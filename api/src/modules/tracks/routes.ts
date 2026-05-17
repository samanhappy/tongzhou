import type { FastifyInstance } from "fastify";
import { HttpError } from "../../middleware/error.js";
import { requireTenant } from "../../middleware/tenant.js";
import * as repo from "./repo.js";
import * as lessons from "../lessons/repo.js";

export async function registerTrackRoutes(app: FastifyInstance) {
  app.get("/api/tracks", async (req) => {
    const t = requireTenant(req);
    return { tracks: await repo.listByTenant(t.id) };
  });

  app.get<{ Params: { id: string } }>("/api/tracks/:id", async (req) => {
    const t = requireTenant(req);
    const track =
      (await repo.getById(t.id, req.params.id)) ??
      (await repo.getBySlug(t.id, req.params.id));
    if (!track) throw new HttpError(404, "track not found");
    const ls = await lessons.listByTrack(t.id, track.id);
    return { track, lessons: ls };
  });

  app.post<{ Body: { slug: string; title: string; subtitle?: string; oneLine?: string } }>(
    "/api/tracks",
    async (req) => {
      const t = requireTenant(req);
      const { slug, title } = req.body ?? {};
      if (!slug || !title) throw new HttpError(400, "slug & title required");
      if (await repo.getBySlug(t.id, slug)) throw new HttpError(409, "slug exists");
      return { track: await repo.create(t.id, req.body!) };
    },
  );

  app.patch<{
    Params: { id: string };
    Body: Partial<{
      slug: string;
      title: string;
      subtitle: string;
      oneLine: string;
      status: "draft" | "published" | "archived";
    }>;
  }>("/api/tracks/:id", async (req) => {
    const t = requireTenant(req);
    const existing = await repo.getById(t.id, req.params.id);
    if (!existing) throw new HttpError(404, "track not found");
    const nextSlug = req.body?.slug?.trim();
    if (nextSlug && nextSlug !== existing.slug) {
      const slugConflict = await repo.getBySlug(t.id, nextSlug);
      if (slugConflict && slugConflict.id !== existing.id) {
        throw new HttpError(409, "slug exists");
      }
    }
    const track = await repo.update(t.id, req.params.id, {
      slug: nextSlug,
      title: req.body?.title,
      subtitle: req.body?.subtitle,
      one_line: req.body?.oneLine,
      status: req.body?.status,
    });
    return { track };
  });
}
