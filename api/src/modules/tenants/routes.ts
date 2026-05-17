import type { FastifyInstance } from "fastify";
import * as repo from "./repo.js";
import { HttpError } from "../../middleware/error.js";

export async function registerTenantRoutes(app: FastifyInstance) {
  // 注册（V0 邮箱占位；不做密码）
  app.post<{ Body: { slug: string; name: string; email?: string } }>(
    "/api/tenants",
    async (req) => {
      const { slug, name } = req.body ?? {};
      if (!slug || !name) throw new HttpError(400, "slug & name required");
      if (repo.getBySlug(slug)) throw new HttpError(409, "slug already taken");
      const t = repo.create({ slug, name });
      return { tenant: t };
    },
  );

  // 当前 Tenant 概要（前端通过 header 注入）
  app.get("/api/tenants/me", async (req) => {
    if (!req.tenant) throw new HttpError(401, "no tenant context");
    return { tenant: req.tenant };
  });

  // 更新品牌
  app.patch<{
    Body: {
      name?: string;
      tagline?: string;
      themeHue?: number;
      groupLink?: string;
    };
  }>("/api/tenants/me", async (req) => {
    if (!req.tenant) throw new HttpError(401, "no tenant context");
    const t = repo.update(req.tenant.id, {
      name: req.body?.name,
      tagline: req.body?.tagline,
      theme_hue: req.body?.themeHue,
      group_link: req.body?.groupLink,
    });
    return { tenant: t };
  });
}
