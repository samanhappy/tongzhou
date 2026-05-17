// 同舟 · 多租户上下文中间件
//
// 三个钩子合作：
//   onRequest    → 给当前请求建一个 ALS scope（PG 模式下后续 query 用它的 client）
//   preHandler   → 解析 x-tenant-slug → 设 req.tenant；PG 模式下 checkout + BEGIN + SET LOCAL
//   onResponse   → PG 模式下 COMMIT/ROLLBACK + release
//
// 公开学员接口 /api/x/:slug/* 不走 header,middleware 自动从 URL 解析 slug 并设置 tenant 上下文。
//
// SQLite 模式下,后两个钩子的 PG 分支是 no-op。

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { config } from "../env.js";
import { getDb, requestScope } from "../db/index.js";
import * as authRepo from "../modules/auth/repo.js";
import { COOKIE_NAME, verifyJwt } from "../modules/auth/jwt.js";
import * as tenantsRepo from "../modules/tenants/repo.js";

export type TenantCtx = {
  id: string;
  slug: string;
  name: string;
  plan: string;
};

export type AuthCtx = {
  userId: string;
  email: string;
  role: string;
  dev: boolean;
};

declare module "fastify" {
  interface FastifyRequest {
    tenant?: TenantCtx;
    auth?: AuthCtx;
  }
}

const HEADER = "x-tenant-slug";
const PUBLIC_NO_AUTH_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/healthz",
]);

function pathOf(req: FastifyRequest) {
  return req.url.split("?")[0] ?? req.url;
}

function headerSlug(req: FastifyRequest): string | undefined {
  const slug = req.headers[HEADER];
  return typeof slug === "string" && slug ? slug : undefined;
}

function toTenantCtx(tenant: tenantsRepo.Tenant): TenantCtx {
  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    plan: tenant.plan,
  };
}

async function resolveSession(
  req: FastifyRequest,
): Promise<{ auth: AuthCtx; tenant: TenantCtx } | undefined> {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return undefined;

  const payload = await verifyJwt(token);
  if (!payload) return undefined;

  const user = await authRepo.getById(payload.sub);
  if (!user || user.tenant_id !== payload.tid) return undefined;

  const tenant = await tenantsRepo.getById(user.tenant_id);
  if (!tenant) return undefined;

  return {
    auth: {
      userId: user.id,
      email: user.email,
      role: user.role,
      dev: false,
    },
    tenant: toTenantCtx(tenant),
  };
}

function buildDevAuth(tenant: TenantCtx): AuthCtx {
  return {
    userId: `dev_${tenant.id}`,
    email: `dev+${tenant.slug}@tongzhou.local`,
    role: "owner",
    dev: true,
  };
}

export function registerTenantHook(app: FastifyInstance) {
  // 1. onRequest: 建立 ALS scope(任何请求都建,但只有 PG 模式才会往里放 client)
  app.addHook("onRequest", (req, _reply, done) => {
    // enterWith 让 ALS 上下文在请求的剩余生命周期内有效
    requestScope.enterWith({});
    done();
  });

  // 2. preHandler: 解析 tenant + (PG) attach client
  app.addHook(
    "preHandler",
    async (req: FastifyRequest, reply: FastifyReply) => {
      const pathname = pathOf(req);
      if (!pathname.startsWith("/api/")) return;

      let tenantId: string | undefined;

      // 公开学员接口：从 URL 解析 slug
      if (pathname.startsWith("/api/x/")) {
        const m = /^\/api\/x\/([^/?]+)/.exec(pathname);
        const slug = m?.[1];
        if (slug) {
          const t = await tenantsRepo.getBySlug(decodeURIComponent(slug));
          if (t) {
            req.tenant = toTenantCtx(t);
            tenantId = t.id;
          }
        }
        // 学员接口找不到 tenant 不直接挡（让 handler 决定 404/200）
      }
      // 注册 / 健康检查 / 直接放行
      else if (
        (pathname.startsWith("/api/tenants") && req.method === "POST") ||
        PUBLIC_NO_AUTH_PATHS.has(pathname)
      ) {
        // pass
      } else {
        const session = await resolveSession(req);
        if (session) {
          req.auth = session.auth;
          req.tenant = session.tenant;
          tenantId = session.tenant.id;
        } else if (config.auth.devMode) {
          const slug = headerSlug(req);
          if (!slug) {
            return reply.code(401).send({ error: "missing session" });
          }
          const t = await tenantsRepo.getBySlug(slug);
          if (!t)
            return reply.code(404).send({ error: `tenant not found: ${slug}` });
          req.tenant = toTenantCtx(t);
          req.auth = buildDevAuth(req.tenant);
          tenantId = t.id;
        } else {
          return reply.code(401).send({ error: "invalid or missing session" });
        }
      }

      // 3. PG 模式：checkout 一个 client + BEGIN + SET LOCAL app.tenant_id
      const db = getDb();
      if (db.driver === "postgres" && tenantId) {
        const { pgHooks } = await import("../db/postgres.js");
        // 拿到 pool —— wrap 出来的 db 上暴露了 __pool
        const pool = (db as unknown as { __pool: import("pg").Pool }).__pool;
        const scope = requestScope.getStore();
        if (scope && pool) {
          await pgHooks.attachClient(pool, scope, tenantId);
        }
      }
    },
  );

  // 3. onResponse: PG 模式下 COMMIT / ROLLBACK 并归还 client
  app.addHook("onResponse", async (req, reply) => {
    const db = getDb();
    if (db.driver !== "postgres") return;
    const scope = requestScope.getStore();
    if (!scope?.client) return;
    const { pgHooks } = await import("../db/postgres.js");
    const ok = reply.statusCode < 400;
    await pgHooks.finishClient(scope, ok);
  });

  // 异常时也要确保 client 归还(防止池泄漏)
  app.addHook("onError", async (_req, _reply, _err) => {
    const db = getDb();
    if (db.driver !== "postgres") return;
    const scope = requestScope.getStore();
    if (!scope?.client) return;
    const { pgHooks } = await import("../db/postgres.js");
    await pgHooks.finishClient(scope, false);
  });
}

export function requireTenant(req: FastifyRequest): TenantCtx {
  if (!req.tenant)
    throw new Error("[tenant] missing — route must be under withTenant");
  return req.tenant;
}
