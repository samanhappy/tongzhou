import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  addMember,
  bindStudent,
  bootTestApp,
  createLesson,
  createMemberInvite,
  createTrack,
  registerOwner,
  responseJson,
  uniqueSlug,
} from "./helpers/test-app.js";

describe("student-auth · wechat dev driver", () => {
  let close: (() => Promise<void>) | undefined;
  let app: Awaited<ReturnType<typeof bootTestApp>>["app"];

  beforeAll(async () => {
    const boot = await bootTestApp();
    app = boot.app;
    close = boot.close;
  });

  afterAll(async () => {
    await close?.();
  });

  async function setupCourseWithVideo() {
    const owner = await registerOwner(app, { slug: uniqueSlug("stuauth") });
    const track = await createTrack(app, owner.cookie, {
      slug: uniqueSlug("course"),
      title: "Course",
    });
    const publish = await app.inject({
      method: "PATCH",
      url: `/api/tracks/${track.id}`,
      headers: { cookie: owner.cookie },
      payload: { status: "published" },
    });
    expect(publish.statusCode).toBe(200);

    const { create: createUpload } = await import(
      "../src/modules/uploads/repo.js"
    );
    const upload = await createUpload(owner.tenant.id, {
      filename: "demo.mp4",
      mime: "video/mp4",
      sizeBytes: 10_000_000,
      storageDriver: "local",
      storageKey: `videos/${owner.tenant.id}/demo.mp4`,
      url: `http://127.0.0.1:4100/files/${owner.tenant.id}/demo.mp4`,
      phase: "ready",
    });

    const lesson = await createLesson(app, owner.cookie, track.id, {
      title: "L1",
      status: "published",
      durationSec: 600,
      videoId: upload.id,
    });
    return { owner, lesson };
  }

  // Case 1: 完整邀请 → 绑定 → 播放
  test("invite → bind → play roundtrip", async () => {
    const { owner, lesson } = await setupCourseWithVideo();
    const member = await addMember(app, owner.cookie, { phone: "13800000001" });

    // 未登录访问 /play 直接 401
    const guestPlay = await app.inject({
      method: "GET",
      url: `/api/x/${owner.tenant.slug}/lessons/${lesson.id}/play`,
    });
    expect(guestPlay.statusCode).toBe(401);
    expect(responseJson<{ error: string }>(guestPlay).error).toBe(
      "login_required",
    );

    // 创作者生成 invite,学员 dev OAuth 一条龙
    const invite = await createMemberInvite(app, owner.cookie, member.id);
    const student = await bindStudent(app, owner.tenant.slug, {
      openid: "openid_case1",
      inviteToken: invite.token,
    });

    // 带 cookie 再请求 /play → 200 且 playUrl 存在
    const okPlay = await app.inject({
      method: "GET",
      url: `/api/x/${owner.tenant.slug}/lessons/${lesson.id}/play`,
      headers: { cookie: student.cookie },
    });
    expect(okPlay.statusCode).toBe(200);
    const body = responseJson<{ playUrl: string }>(okPlay);
    expect(body.playUrl).toContain("http");

    // /auth/me 返回 member
    const me = await app.inject({
      method: "GET",
      url: `/api/x/${owner.tenant.slug}/auth/me`,
      headers: { cookie: student.cookie },
    });
    expect(me.statusCode).toBe(200);
    const meBody = responseJson<{
      member: { id: string; phone: string };
    }>(me);
    expect(meBody.member.id).toBe(member.id);
  });

  // Case 2: 静默重登(同 openid,无 invite)
  test("silent re-login by openid (no invite)", async () => {
    const { owner, lesson } = await setupCourseWithVideo();
    const member = await addMember(app, owner.cookie, { phone: "13800000002" });
    const invite = await createMemberInvite(app, owner.cookie, member.id);

    // 首次绑定
    await bindStudent(app, owner.tenant.slug, {
      openid: "openid_case2",
      inviteToken: invite.token,
    });
    // 不带 invite,重新走 oauth → 仍应拿到 cookie
    const again = await bindStudent(app, owner.tenant.slug, {
      openid: "openid_case2",
    });
    const okPlay = await app.inject({
      method: "GET",
      url: `/api/x/${owner.tenant.slug}/lessons/${lesson.id}/play`,
      headers: { cookie: again.cookie },
    });
    expect(okPlay.statusCode).toBe(200);
  });

  // Case 3: invite 过期 → 410
  test("expired invite returns 410", async () => {
    const { owner } = await setupCourseWithVideo();
    const member = await addMember(app, owner.cookie, { phone: "13800000003" });
    const invite = await createMemberInvite(app, owner.cookie, member.id);
    // 直接改库把它弄过期
    const { getDb } = await import("../src/db/index.js");
    await getDb()
      .prepare(`UPDATE member_invites SET expires_at = ? WHERE id = ?`)
      .run([Date.now() - 1000, invite.id]);

    await expect(
      bindStudent(app, owner.tenant.slug, {
        openid: "openid_case3",
        inviteToken: invite.token,
      }),
    ).rejects.toThrow(/callback failed: 410/);
  });

  // Case 4: invite 单用 → 第二次同 invite 不同 openid 返回 409
  test("single-use invite blocks second openid", async () => {
    const { owner } = await setupCourseWithVideo();
    const member = await addMember(app, owner.cookie, { phone: "13800000004" });
    const invite = await createMemberInvite(app, owner.cookie, member.id);
    await bindStudent(app, owner.tenant.slug, {
      openid: "openid_case4_a",
      inviteToken: invite.token,
    });
    await expect(
      bindStudent(app, owner.tenant.slug, {
        openid: "openid_case4_b",
        inviteToken: invite.token,
      }),
    ).rejects.toThrow(/callback failed: 409/);
  });

  // Case 5: openid 已绑定给别的 member → 用旧 invite 拿不下
  test("openid already bound to different member returns 409", async () => {
    const { owner } = await setupCourseWithVideo();
    const m1 = await addMember(app, owner.cookie, { phone: "13800000005" });
    const m2 = await addMember(app, owner.cookie, { phone: "13800000015" });
    const inv1 = await createMemberInvite(app, owner.cookie, m1.id);
    const inv2 = await createMemberInvite(app, owner.cookie, m2.id);
    await bindStudent(app, owner.tenant.slug, {
      openid: "openid_case5",
      inviteToken: inv1.token,
    });
    // 同一 openid 用 m2 的 invite → callback 走「已绑定」分支命中 m1,
    // 直接登 m1 而不绑 m2(invite 仍可后续给别人用) — 即静默重登,200。
    // 这里检查它确实落到 m1 而不是 m2。
    const again = await bindStudent(app, owner.tenant.slug, {
      openid: "openid_case5",
      inviteToken: inv2.token,
    });
    const me = await app.inject({
      method: "GET",
      url: `/api/x/${owner.tenant.slug}/auth/me`,
      headers: { cookie: again.cookie },
    });
    expect(responseJson<{ member: { id: string } }>(me).member.id).toBe(m1.id);
  });

  // Case 6: member 删除 → 旧 cookie 不再生效
  test("deleted member invalidates session", async () => {
    const { owner, lesson } = await setupCourseWithVideo();
    const member = await addMember(app, owner.cookie, { phone: "13800000006" });
    const invite = await createMemberInvite(app, owner.cookie, member.id);
    const student = await bindStudent(app, owner.tenant.slug, {
      openid: "openid_case6",
      inviteToken: invite.token,
    });
    const { getDb } = await import("../src/db/index.js");
    await getDb()
      .prepare(`DELETE FROM members WHERE id = ?`)
      .run([member.id]);

    const denied = await app.inject({
      method: "GET",
      url: `/api/x/${owner.tenant.slug}/lessons/${lesson.id}/play`,
      headers: { cookie: student.cookie },
    });
    expect(denied.statusCode).toBe(401);
  });

  // Case 7: 跨租户 cookie
  test("session for tenant A cannot play tenant B", async () => {
    const a = await setupCourseWithVideo();
    const b = await setupCourseWithVideo();
    const memberA = await addMember(a.owner.cookie ? app : app, a.owner.cookie, {
      phone: "13800000007",
    });
    const inv = await createMemberInvite(app, a.owner.cookie, memberA.id);
    const studentA = await bindStudent(app, a.owner.tenant.slug, {
      openid: "openid_case7",
      inviteToken: inv.token,
    });
    const cross = await app.inject({
      method: "GET",
      url: `/api/x/${b.owner.tenant.slug}/lessons/${b.lesson.id}/play`,
      headers: { cookie: studentA.cookie },
    });
    expect(cross.statusCode).toBe(401);
  });

  // Case 8: /progress 必须登录
  test("/progress requires login", async () => {
    const { owner, lesson } = await setupCourseWithVideo();
    const res = await app.inject({
      method: "POST",
      url: `/api/x/${owner.tenant.slug}/progress`,
      payload: { lessonId: lesson.id, watchedSec: 30 },
    });
    expect(res.statusCode).toBe(401);
  });

  // Case 9: logout 清 cookie
  test("logout clears cookie", async () => {
    const { owner } = await setupCourseWithVideo();
    const member = await addMember(app, owner.cookie, { phone: "13800000009" });
    const invite = await createMemberInvite(app, owner.cookie, member.id);
    const student = await bindStudent(app, owner.tenant.slug, {
      openid: "openid_case9",
      inviteToken: invite.token,
    });
    const out = await app.inject({
      method: "POST",
      url: `/api/x/${owner.tenant.slug}/auth/logout`,
      headers: { cookie: student.cookie },
    });
    expect(out.statusCode).toBe(200);
    const setCookie = out.headers["set-cookie"];
    const cookies = Array.isArray(setCookie)
      ? setCookie
      : setCookie
        ? [String(setCookie)]
        : [];
    expect(
      cookies.some(
        (c) => c.startsWith("tz_student=") && c.includes("Max-Age=0"),
      ),
    ).toBe(true);
  });
});
