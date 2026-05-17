// 同舟 · 多租户上下文中间件
//
// V0：通过 header `x-tenant-slug` 或 subdomain 解析当前 Tenant。
// V1：换成 JWT/Session-based 用户身份反查 tenant_id。
//
// 强制：业务 route 必须挂在 withTenant() 之后；repo 层用 ctx.tenantId 过滤。

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getDb } from "../db/index.js";

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
  app.addHook("preHandler", async (req: FastifyRequest, reply: FastifyReply) => {
    // 只对 /api/* 生效，公共路径 /files、/healthz 不需要租户
    if (!req.url.startsWith("/api/")) return;

    // 学员侧 public 子接口：/api/x/:slug/... 自己解析 slug
    if (req.url.startsWith("/api/x/")) return;

    // tenant 注册接口本身免身份
    if (req.url.startsWith("/api/tenants") && req.method === "POST") return;

    // 健康检查
    if (req.url === "/api/healthz") return;

    const slug = req.headers[HEADER];
    if (typeof slug !== "string" || !slug) {
      return reply.code(401).send({ error: "missing tenant header (x-tenant-slug)" });
    }
    const t = getDb()
      .prepare(`SELECT id, slug, name, plan FROM tenants WHERE slug = ?`)
      .get<TenantCtx>([slug]);
    if (!t) return reply.code(404).send({ error: `tenant not found: ${slug}` });
    req.tenant = t;
  });
}

/** Route 内部用：强制断言 tenant 存在（preHandler 已挡过） */
export function requireTenant(req: FastifyRequest): TenantCtx {
  if (!req.tenant) throw new Error("[tenant] missing — route must be under withTenant");
  return req.tenant;
}
