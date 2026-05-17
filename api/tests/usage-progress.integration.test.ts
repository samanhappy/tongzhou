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

describe("usage recompute and learner progress", () => {
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

  test("dedupes progress per learner and recomputes tenant meters", async () => {
    const owner = await registerOwner(app, { slug: uniqueSlug("usage") });
    const track = await createTrack(app, owner.cookie, {
      slug: uniqueSlug("usage-course"),
      title: "Usage Course",
    });

    const publishTrack = await app.inject({
      method: "PATCH",
      url: `/api/tracks/${track.id}`,
      headers: { cookie: owner.cookie },
      payload: { status: "published" },
    });
    expect(publishTrack.statusCode).toBe(200);

    const lesson = await createLesson(app, owner.cookie, track.id, {
      title: "第一课",
      status: "published",
      durationSec: 600,
      durationText: "10:00",
    });

    const { create: createUpload } = await import(
      "../src/modules/uploads/repo.js"
    );
    await createUpload(owner.tenant.id, {
      filename: "lesson-1.mp4",
      mime: "video/mp4",
      sizeBytes: 536870912,
      storageDriver: "local",
      storageKey: `videos/${owner.tenant.id}/lesson-1.mp4`,
      url: `http://127.0.0.1:4100/files/${owner.tenant.id}/lesson-1.mp4`,
      phase: "ready",
    });

    // 学员需先登录(微信 dev mock)才能写进度 / 心跳
    const member = await addMember(app, owner.cookie, {
      name: "Test Student",
      phone: "13800000001",
    });
    const invite = await createMemberInvite(app, owner.cookie, member.id);
    const student = await bindStudent(app, owner.tenant.slug, {
      openid: "openid_progress_1",
      inviteToken: invite.token,
    });

    const firstProgress = await app.inject({
      method: "POST",
      url: `/api/x/${owner.tenant.slug}/progress`,
      headers: { cookie: student.cookie },
      payload: { lessonId: lesson.id, watchedSec: 120 },
    });
    expect(firstProgress.statusCode).toBe(200);

    const secondProgress = await app.inject({
      method: "POST",
      url: `/api/x/${owner.tenant.slug}/progress`,
      headers: { cookie: student.cookie },
      payload: {
        lessonId: lesson.id,
        watchedSec: 240,
        completed: true,
      },
    });
    expect(secondProgress.statusCode).toBe(200);

    const heartbeat = await app.inject({
      method: "POST",
      url: `/api/x/${owner.tenant.slug}/heartbeat`,
      headers: { cookie: student.cookie },
      payload: { lessonId: lesson.id, deltaSec: 180 },
    });
    expect(heartbeat.statusCode).toBe(200);

    const { getDb } = await import("../src/db/index.js");
    const progressRows = await getDb()
      .prepare(
        `SELECT watched_sec, completed
         FROM lesson_progress
         WHERE tenant_id = ? AND lesson_id = ? AND member_id = ?`,
      )
      .all<{ watched_sec: number; completed: number }>([
        owner.tenant.id,
        lesson.id,
        member.id,
      ]);

    expect(progressRows).toEqual([{ watched_sec: 240, completed: 1 }]);

    const recompute = await app.inject({
      method: "POST",
      url: "/api/usage/recompute",
      headers: { cookie: owner.cookie },
    });
    expect(recompute.statusCode).toBe(200);

    const meters = responseJson<{
      meters: Array<{
        key: string;
        value: number;
      }>;
    }>(recompute).meters;

    expect(
      Object.fromEntries(meters.map((meter) => [meter.key, meter.value])),
    ).toMatchObject({
      "members.active_count": 1,
      "courses.count": 1,
      "storage.bytes": 0.5,
      "playback.minutes": 3,
    });
  });
});
