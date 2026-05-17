import type { FastifyInstance } from "fastify";
import * as repo from "./repo.js";
import { HttpError } from "../../middleware/error.js";

export async function registerTenantRoutes(app: FastifyInstance) {
  app.post<{ Body: { slug: string; name: string; email?: string } }>(
    "/api/tenants",
    async (req) => {
      const { slug, name } = req.body ?? {};
      if (!slug || !name) throw new HttpError(400, "slug & name required");
      if (await repo.getBySlug(slug)) throw new HttpError(409, "slug already taken");
      const t = await repo.create({ slug, name });
      return { tenant: t };
    },
  );

  app.get("/api/tenants/me", async (req) => {
    if (!req.tenant) throw new HttpError(401, "no tenant context");
    const full = await repo.getById(req.tenant.id);
    if (!full) throw new HttpError(404, "tenant not found");
    return { tenant: full };
  });

  app.patch<{
    Body: {
      slug?: string;
      name?: string;
      tagline?: string;
      themeHue?: number;
      groupLink?: string;
    };
  }>("/api/tenants/me", async (req) => {
    if (!req.tenant) throw new HttpError(401, "no tenant context");
    const nextSlug = req.body?.slug?.trim();
    if (nextSlug && nextSlug !== req.tenant.slug) {
      const existing = await repo.getBySlug(nextSlug);
      if (existing && existing.id !== req.tenant.id) {
        throw new HttpError(409, "slug already taken");
      }
    }
    const t = await repo.update(req.tenant.id, {
      slug: nextSlug,
      name: req.body?.name,
      tagline: req.body?.tagline,
      theme_hue: req.body?.themeHue,
      group_link: req.body?.groupLink,
    });
    return { tenant: t };
  });
}
