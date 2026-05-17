// Auth · Routes
//
// POST /api/auth/register   email + password + (slug + name) → 创建 tenant+user → cookie
// POST /api/auth/login      email + password → cookie
// POST /api/auth/logout     清 cookie
// GET  /api/auth/me         返回 { user, tenant }
//
// 注册流程同时创建 tenant + user(原子,事务保护)。
// 这是 V0 的一对一模型;V1 改成"用户可属多个 tenant"时拆开。

import bcrypt from "bcryptjs";
import type { FastifyInstance, FastifyReply } from "fastify";
import { HttpError } from "../../middleware/error.js";
import { getDb } from "../../db/index.js";
import * as tenantsRepo from "../tenants/repo.js";
import * as authRepo from "./repo.js";
import { COOKIE_NAME, signJwt, verifyJwt } from "./jwt.js";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOKIE_TTL_SEC = 7 * 24 * 3600;

function isProd() {
  return process.env.NODE_ENV === "production";
}

function setSessionCookie(reply: FastifyReply, token: string) {
  reply.setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_TTL_SEC,
  });
}

function clearSessionCookie(reply: FastifyReply) {
  reply.clearCookie(COOKIE_NAME, { path: "/" });
}

export async function registerAuthRoutes(app: FastifyInstance) {
  // ─── register ───
  app.post<{
    Body: { email: string; password: string; slug: string; name: string };
  }>("/api/auth/register", async (req, reply) => {
    const { email, password, slug, name } = req.body ?? ({} as never);

    if (!email || !EMAIL_RE.test(email)) throw new HttpError(400, "invalid email");
    if (!password || password.length < 8) throw new HttpError(400, "password >= 8 chars");
    if (!slug || !SLUG_RE.test(slug)) {
      throw new HttpError(400, "slug must be 3-32 chars, [a-z0-9-]");
    }
    if (!name) throw new HttpError(400, "name required");

    if (await authRepo.getByEmail(email)) {
      throw new HttpError(409, "email already registered");
    }
    if (await tenantsRepo.getBySlug(slug)) {
      throw new HttpError(409, "slug already taken");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const db = getDb();

    // 原子:tenant + user 一起建
    const { user, tenant } = await db.transaction(async () => {
      const t = await tenantsRepo.create({ slug, name });
      const u = await authRepo.create({
        tenantId: t.id,
        email,
        passwordHash,
        role: "owner",
      });
      return { user: u, tenant: t };
    });

    const token = await signJwt({ sub: user.id, tid: tenant.id, email: user.email });
    setSessionCookie(reply, token);

    return {
      user: { id: user.id, email: user.email, role: user.role },
      tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
    };
  });

  // ─── login ───
  app.post<{ Body: { email: string; password: string } }>(
    "/api/auth/login",
    async (req, reply) => {
      const { email, password } = req.body ?? ({} as never);
      if (!email || !password) throw new HttpError(400, "email & password required");

      const user = await authRepo.getByEmail(email);
      if (!user || !user.password_hash) {
        // 故意不区分"邮箱不存在"和"密码错"
        throw new HttpError(401, "invalid credentials");
      }
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) throw new HttpError(401, "invalid credentials");

      const tenant = await tenantsRepo.getById(user.tenant_id);
      if (!tenant) throw new HttpError(500, "user has no tenant");

      const token = await signJwt({ sub: user.id, tid: tenant.id, email: user.email });
      setSessionCookie(reply, token);

      return {
        user: { id: user.id, email: user.email, role: user.role },
        tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
      };
    },
  );

  // ─── logout ───
  app.post("/api/auth/logout", async (_req, reply) => {
    clearSessionCookie(reply);
    return { ok: true };
  });

  // ─── me ───
  // 不需要 tenant header — 自己从 cookie 解
  app.get("/api/auth/me", async (req, reply) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = (req as any).cookies?.[COOKIE_NAME];
    if (!token) return reply.code(401).send({ error: "no session" });
    const payload = await verifyJwt(token);
    if (!payload) return reply.code(401).send({ error: "invalid session" });
    const user = await authRepo.getById(payload.sub);
    if (!user) return reply.code(401).send({ error: "user gone" });
    const tenant = await tenantsRepo.getById(user.tenant_id);
    if (!tenant) return reply.code(500).send({ error: "user has no tenant" });
    return {
      user: { id: user.id, email: user.email, role: user.role },
      tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
    };
  });
}
