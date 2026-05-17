// 学员侧 · 微信公众号网页授权 路由
//
// 注册路径:
//   GET  /api/x/:slug/auth/start       302 → 微信(或 dev stub)
//   GET  /api/x/:slug/auth/callback    code → openid → 绑定 / 登录,设 cookie,302 回 next
//   GET  /api/x/:slug/auth/me          {member} | 401
//   POST /api/x/:slug/auth/logout      清 cookie
//   GET  /api/wechat/_dev/authorize    dev driver only,渲染填 openid 的本地表单
//
// **状态传递设计**:
// 微信 OAuth 的 state 参数最大 128 字节,如果把 next / invite 都塞进去很容易超限,
// 真实公众号 authorize 端点会直接返回 "Sorry"。所以:
//   - state 只放 32 hex 字符的 csrf id
//   - tz_student_csrf cookie 存 {csrf, next, inv} JSON(HttpOnly,SameSite=Lax)
// callback 拿到 state 后,从 cookie 还原 next/inv,再校验 csrf 是否一致。

import type { FastifyInstance, FastifyReply } from "fastify";
import { randomBytes } from "node:crypto";
import { config } from "../../env.js";
import { getDb } from "../../db/index.js";
import { devEncodeCode } from "../../wechat/dev.js";
import { getWechat } from "../../wechat/index.js";
import * as membersRepo from "../members/repo.js";
import * as repo from "./repo.js";
import {
  STUDENT_COOKIE,
  STUDENT_CSRF_COOKIE,
  STUDENT_TTL_SEC,
  signStudentJwt,
} from "./jwt.js";

const CSRF_COOKIE_TTL_SEC = 10 * 60;

export async function registerStudentAuthRoutes(app: FastifyInstance) {
  // ───────────── start ─────────────
  app.get<{
    Params: { slug: string };
    Querystring: { invite?: string; next?: string };
  }>("/api/x/:slug/auth/start", async (req, reply) => {
    const t = req.tenant;
    if (!t) return reply.code(404).send({ error: "tenant not found" });

    const invite = req.query?.invite?.trim() || undefined;
    const next = safeNext(req.query?.next, `/x/${t.slug}`);
    const csrf = randomBytes(16).toString("hex");

    // state 只塞 csrf id;next/invite 走 HttpOnly cookie,绕开微信 128 字节 state 限制
    reply.setCookie(
      STUDENT_CSRF_COOKIE,
      encodeCsrfCookie({ csrf, next, inv: invite }),
      {
        httpOnly: true,
        secure: isProd(),
        sameSite: "lax",
        path: "/",
        maxAge: CSRF_COOKIE_TTL_SEC,
      },
    );

    const redirectUri = `${config.wechat.oauthRedirectBase}/api/x/${encodeURIComponent(
      t.slug,
    )}/auth/callback`;
    const scope = invite ? "snsapi_userinfo" : "snsapi_base";
    const url = getWechat().buildAuthorizeUrl({
      redirectUri,
      state: csrf,
      scope,
    });
    return reply.redirect(url);
  });

  // ───────────── callback ─────────────
  app.get<{
    Params: { slug: string };
    Querystring: { code?: string; state?: string };
  }>("/api/x/:slug/auth/callback", async (req, reply) => {
    const t = req.tenant;
    if (!t) return reply.code(404).send({ error: "tenant not found" });

    const code = req.query?.code;
    const stateRaw = req.query?.state;
    if (!code || !stateRaw) {
      return reply.code(400).send({ error: "missing code/state" });
    }

    const csrfCookieRaw = req.cookies?.[STUDENT_CSRF_COOKIE];
    reply.clearCookie(STUDENT_CSRF_COOKIE, { path: "/" });
    const cookieState = csrfCookieRaw ? decodeCsrfCookie(csrfCookieRaw) : null;
    if (!cookieState || cookieState.csrf !== stateRaw) {
      return reply.code(400).send({ error: "csrf mismatch" });
    }
    const state = cookieState;

    let user;
    try {
      user = await getWechat().exchangeCode(code);
    } catch (err) {
      req.log.warn({ err }, "[student-auth] exchangeCode failed");
      return reply.code(502).send({ error: "wechat exchange failed" });
    }

    const next = safeNext(state.next, `/x/${t.slug}`);
    const nextAbs = absoluteNext(next);

    // 1) 已绑定 openid → 直接登录
    const existing = await repo.findMemberByOpenid(t.id, user.openid);
    if (existing) {
      // 即便不带 invite,顺手刷新昵称/头像
      if (
        (user.nickname && user.nickname !== existing.wechat_nickname) ||
        (user.headimgurl && user.headimgurl !== existing.wechat_avatar)
      ) {
        await repo.bindOpenid(t.id, existing.id, {
          openid: user.openid,
          unionid: user.unionid ?? existing.wechat_unionid ?? undefined,
          nickname: user.nickname ?? existing.wechat_nickname ?? undefined,
          avatar: user.headimgurl ?? existing.wechat_avatar ?? undefined,
        });
      }
      await issueSessionCookie(reply, {
        memberId: existing.id,
        tenantId: t.id,
        openid: user.openid,
      });
      return reply.redirect(nextAbs);
    }

    // 2) 没绑定 + 无 invite → 引导到登录页解释
    if (!state.inv) {
      return reply.redirect(
        joinUrl(config.publicAppBase, `/x/${t.slug}/login?need_invite=1`),
      );
    }

    // 3) 没绑定 + 有 invite → 校验后绑定
    const invite = await repo.getInviteByToken(state.inv);
    if (!invite || invite.tenant_id !== t.id) {
      return reply
        .code(404)
        .send({ error: "invite not found", reason: "unknown_token" });
    }
    if (invite.revoked_at) {
      return reply
        .code(410)
        .send({ error: "invite revoked", reason: "revoked" });
    }
    if (invite.expires_at < Date.now()) {
      return reply
        .code(410)
        .send({ error: "invite expired", reason: "expired" });
    }
    if (invite.used_at) {
      // 幂等:同一 openid 再请求一次视为成功(用户中途关闭微信再点)
      if (invite.used_openid === user.openid) {
        await issueSessionCookie(reply, {
          memberId: invite.member_id,
          tenantId: t.id,
          openid: user.openid,
        });
        return reply.redirect(nextAbs);
      }
      return reply
        .code(409)
        .send({ error: "invite already used", reason: "used" });
    }

    const member = await membersRepo.getById(t.id, invite.member_id);
    if (!member) {
      return reply
        .code(410)
        .send({ error: "member deleted", reason: "member_missing" });
    }
    if (member.wechat_openid && member.wechat_openid !== user.openid) {
      return reply
        .code(409)
        .send({ error: "member already bound", reason: "member_bound" });
    }

    try {
      await getDb().transaction(async () => {
        await repo.bindOpenid(t.id, member.id, {
          openid: user.openid,
          unionid: user.unionid,
          nickname: user.nickname,
          avatar: user.headimgurl,
        });
        await repo.markInviteUsed(invite.id, user.openid);
      });
    } catch (err) {
      // 唯一索引兜底:并发把同一 openid 绑到另一个 member
      req.log.warn({ err }, "[student-auth] bind transaction failed");
      return reply
        .code(409)
        .send({ error: "openid already bound", reason: "openid_conflict" });
    }

    await issueSessionCookie(reply, {
      memberId: member.id,
      tenantId: t.id,
      openid: user.openid,
    });
    return reply.redirect(nextAbs);
  });

  // ───────────── me ─────────────
  app.get<{ Params: { slug: string } }>(
    "/api/x/:slug/auth/me",
    async (req, reply) => {
      const t = req.tenant;
      if (!t) return reply.code(404).send({ error: "tenant not found" });
      if (!req.student) return reply.code(401).send({ error: "no session" });
      const m = await membersRepo.getById(t.id, req.student.memberId);
      if (!m) return reply.code(401).send({ error: "no session" });
      return { member: publicMember(m) };
    },
  );

  // ───────────── logout ─────────────
  app.post<{ Params: { slug: string } }>(
    "/api/x/:slug/auth/logout",
    async (_req, reply) => {
      reply.clearCookie(STUDENT_COOKIE, { path: "/" });
      return { ok: true };
    },
  );

  // ───────────── dev driver:本地填 openid 的 stub 页面 ─────────────
  //
  // 表单提交用 GET,把数据放进 query,避免引入 @fastify/formbody。
  // 同一 handler 兼顾「渲染表单」与「处理提交并 302」两种路径。
  if (config.wechat.driver === "dev") {
    app.get<{
      Querystring: {
        redirect_uri?: string;
        state?: string;
        openid?: string;
        nickname?: string;
        avatar?: string;
      };
    }>("/api/wechat/_dev/authorize", async (req, reply) => {
      if (process.env.NODE_ENV === "production") {
        return reply.code(403).send({ error: "dev driver disabled in prod" });
      }
      const q = req.query ?? {};
      const redirectUri = q.redirect_uri ?? "";
      const state = q.state ?? "";
      const openid = q.openid?.trim();
      if (openid) {
        if (!redirectUri || !state) {
          return reply
            .code(400)
            .send({ error: "redirect_uri/state required" });
        }
        const code = devEncodeCode({
          openid,
          nickname: q.nickname?.trim() || undefined,
          avatar: q.avatar?.trim() || undefined,
        });
        const u = new URL(redirectUri);
        u.searchParams.set("code", code);
        u.searchParams.set("state", state);
        return reply.redirect(u.toString());
      }
      reply.type("text/html").send(devFormHtml(redirectUri, state));
    });
  }
}

// ───────────── helpers ─────────────

function isProd() {
  return process.env.NODE_ENV === "production";
}

async function issueSessionCookie(
  reply: FastifyReply,
  args: { memberId: string; tenantId: string; openid: string },
) {
  const token = await signStudentJwt({
    sub: args.memberId,
    tid: args.tenantId,
    oid: args.openid,
  });
  reply.setCookie(STUDENT_COOKIE, token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: STUDENT_TTL_SEC,
  });
}

type CsrfState = { csrf: string; next: string; inv?: string };

function encodeCsrfCookie(s: CsrfState): string {
  return Buffer.from(JSON.stringify(s), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeCsrfCookie(raw: string): CsrfState | null {
  try {
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    const obj = JSON.parse(json);
    if (typeof obj?.csrf !== "string" || typeof obj?.next !== "string") {
      return null;
    }
    return {
      csrf: obj.csrf,
      next: obj.next,
      inv: typeof obj.inv === "string" ? obj.inv : undefined,
    };
  } catch {
    return null;
  }
}

function safeNext(raw: string | undefined, fallback: string): string {
  // 只允许同站内相对路径,防 open redirect
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  return raw;
}

function absoluteNext(next: string): string {
  return joinUrl(config.publicAppBase, next);
}

function joinUrl(base: string, relative: string): string {
  return `${base.replace(/\/$/, "")}${
    relative.startsWith("/") ? relative : `/${relative}`
  }`;
}

function publicMember(m: membersRepo.Member) {
  return {
    id: m.id,
    name: m.name,
    phone: m.phone,
    bound: m.bound,
    wechat_nickname: m.wechat_nickname,
    wechat_avatar: m.wechat_avatar,
  };
}

function devFormHtml(redirectUri: string, state: string): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>微信登录 · DEV stub</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font: 14px/1.6 -apple-system, system-ui, sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; color: #1c1c1c; }
    h1 { font-size: 16px; margin: 0 0 8px; }
    p { color: #666; margin: 0 0 18px; font-size: 12.5px; }
    label { display: block; margin-bottom: 12px; font-size: 12.5px; color: #444; }
    input { width: 100%; padding: 9px 10px; border: 1px solid #ddd; border-radius: 6px; font: inherit; box-sizing: border-box; }
    button { background: #1c1c1c; color: #fff; border: 0; padding: 10px 16px; border-radius: 6px; font: inherit; cursor: pointer; }
    .hint { color: #999; font-size: 11px; margin-top: -8px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <h1>微信登录 · DEV stub</h1>
  <p>这是开发模式下的本地占位。生产环境(<code>WECHAT_DRIVER=real</code>)走真实公众号授权。</p>
  <form method="get" action="/api/wechat/_dev/authorize">
    <input type="hidden" name="redirect_uri" value="${esc(redirectUri)}" />
    <input type="hidden" name="state" value="${esc(state)}" />
    <label>openid (必填)<input name="openid" required placeholder="openid_alice" /></label>
    <div class="hint">同一 openid 重复登录会复用已绑定的学员记录。</div>
    <label>昵称 (可选)<input name="nickname" placeholder="Alice" /></label>
    <label>头像 URL (可选)<input name="avatar" placeholder="https://..." /></label>
    <button type="submit">完成授权</button>
  </form>
</body>
</html>`;
}

