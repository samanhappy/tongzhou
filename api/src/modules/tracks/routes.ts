import type { FastifyInstance } from "fastify";
import { HttpError } from "../../middleware/error.js";
import { requireTenant } from "../../middleware/tenant.js";
import * as repo from "./repo.js";
import * as lessons from "../lessons/repo.js";

export async function registerTrackRoutes(app: FastifyInstance) {
  app.get("/api/tracks", async (req) => {
    const t = requireTenant(req);
    const list = repo.listByTenant(t.id);
    return { tracks: list };
  });

  app.get<{ Params: { id: string } }>("/api/tracks/:id", async (req) => {
    const t = requireTenant(req);
    const track = repo.getById(t.id, req.params.id) ?? repo.getBySlug(t.id, req.params.id);
    if (!track) throw new HttpError(404, "track not found");
    const ls = lessons.listByTrack(t.id, track.id);
    return { track, lessons: ls };
  });

  app.post<{ Body: { slug: string; title: string; subtitle?: string; oneLine?: string } }>(
    "/api/tracks",
    async (req) => {
      const t = requireTenant(req);
      const { slug, title } = req.body ?? {};
      if (!slug || !title) throw new HttpError(400, "slug & title required");
      if (repo.getBySlug(t.id, slug)) throw new HttpError(409, "slug exists");
      return { track: repo.create(t.id, req.body!) };
    },
  );

  app.patch<{
    Params: { id: string };
    Body: Partial<{
      title: string;
      subtitle: string;
      oneLine: string;
      status: "draft" | "published" | "archived";
    }>;
  }>("/api/tracks/:id", async (req) => {
    const t = requireTenant(req);
    const track = repo.update(t.id, req.params.id, {
      title: req.body?.title,
      subtitle: req.body?.subtitle,
      one_line: req.body?.oneLine,
      status: req.body?.status,
    });
    if (!track) throw new HttpError(404, "track not found");
    return { track };
  });
}
