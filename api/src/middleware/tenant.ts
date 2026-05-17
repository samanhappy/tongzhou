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
import { getDb, requestScope } from "../db/index.js";
import * as tenantsRepo from "../modules/tenants/repo.js";

export type TenantCtx = {
  id: string;
  slug: string;
  name: string;
  plan: string;
};

declare module "fastify" {
  interface FastifyRequest {
    tenant?: TenantCtx;
  }
}

const HEADER = "x-tenant-slug";

export function registerTenantHook(app: FastifyInstance) {
  // 1. onRequest: 建立 ALS scope(任何请求都建,但只有 PG 模式才会往里放 client)
  app.addHook("onRequest", (req, _reply, done) => {
    // enterWith 让 ALS 上下文在请求的剩余生命周期内有效
    requestScope.enterWith({});
    done();
  });

  // 2. preHandler: 解析 tenant + (PG) attach client
  app.addHook("preHandler", async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.url.startsWith("/api/")) return;

    let tenantId: string | undefined;

    // 公开学员接口：从 URL 解析 slug
    if (req.url.startsWith("/api/x/")) {
      const m = /^\/api\/x\/([^/?]+)/.exec(req.url);
      const slug = m?.[1];
      if (slug) {
        const t = await tenantsRepo.getBySlug(decodeURIComponent(slug));
        if (t) tenantId = t.id;
      }
      // 学员接口找不到 tenant 不直接挡（让 handler 决定 404/200）
    }
    // 注册 / 健康检查 / 直接放行
    else if (req.url.startsWith("/api/tenants") && req.method === "POST") {
      // pass
    } else if (req.url === "/api/healthz") {
      // pass
    } else {
      const slug = req.headers[HEADER];
      if (typeof slug !== "string" || !slug) {
        return reply.code(401).send({ error: "missing tenant header (x-tenant-slug)" });
      }
      const t = await tenantsRepo.getBySlug(slug);
      if (!t) return reply.code(404).send({ error: `tenant not found: ${slug}` });
      req.tenant = t as TenantCtx;
      tenantId = t.id;
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
  });

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
  if (!req.tenant) throw new Error("[tenant] missing — route must be under withTenant");
  return req.tenant;
}
