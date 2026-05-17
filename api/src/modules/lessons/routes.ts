import type { FastifyInstance } from "fastify";
import { HttpError } from "../../middleware/error.js";
import { requireTenant } from "../../middleware/tenant.js";
import * as repo from "./repo.js";
import * as tracks from "../tracks/repo.js";

export async function registerLessonRoutes(app: FastifyInstance) {
  app.get<{ Params: { trackId: string } }>(
    "/api/tracks/:trackId/lessons",
    async (req) => {
      const t = requireTenant(req);
      const track = await tracks.getById(t.id, req.params.trackId);
      if (!track) throw new HttpError(404, "track not found");
      return { lessons: await repo.listByTrack(t.id, track.id) };
    },
  );

  app.post<{
    Params: { trackId: string };
    Body: {
      title: string;
      summary?: string;
      durationSec?: number;
      durationText?: string;
      videoId?: string;
      status?: "draft" | "uploading" | "transcoding" | "published" | "failed";
    };
  }>("/api/tracks/:trackId/lessons", async (req) => {
    const t = requireTenant(req);
    const track = await tracks.getById(t.id, req.params.trackId);
    if (!track) throw new HttpError(404, "track not found");
    if (!req.body?.title) throw new HttpError(400, "title required");

    const existing = await repo.listByTrack(t.id, track.id);
    const lesson = await repo.create(t.id, track.id, {
      ...req.body,
      position: existing.length,
    });
    await tracks.recomputeStats(t.id, track.id);
    return { lesson };
  });

  app.patch<{
    Params: { id: string };
    Body: Partial<{
      title: string;
      summary: string;
      videoId: string;
      status: "draft" | "uploading" | "transcoding" | "published" | "failed";
      durationSec: number;
      durationText: string;
      progress: number;
    }>;
  }>("/api/lessons/:id", async (req) => {
    const t = requireTenant(req);
    const lesson = await repo.update(t.id, req.params.id, {
      title: req.body?.title,
      summary: req.body?.summary,
      video_id: req.body?.videoId,
      status: req.body?.status,
      duration_sec: req.body?.durationSec,
      duration_text: req.body?.durationText,
      progress: req.body?.progress,
    });
    if (!lesson) throw new HttpError(404, "lesson not found");
    await tracks.recomputeStats(t.id, lesson.track_id);
    return { lesson };
  });

  app.delete<{ Params: { id: string } }>("/api/lessons/:id", async (req) => {
    const t = requireTenant(req);
    const lesson = await repo.getById(t.id, req.params.id);
    if (!lesson) throw new HttpError(404, "lesson not found");
    await repo.remove(t.id, req.params.id);
    await tracks.recomputeStats(t.id, lesson.track_id);
    return { ok: true };
  });

  app.post<{
    Params: { trackId: string };
    Body: { orderedIds: string[] };
  }>("/api/tracks/:trackId/lessons/reorder", async (req) => {
    const t = requireTenant(req);
    const track = await tracks.getById(t.id, req.params.trackId);
    if (!track) throw new HttpError(404, "track not found");
    if (!Array.isArray(req.body?.orderedIds)) {
      throw new HttpError(400, "orderedIds: string[] required");
    }
    await repo.reorder(t.id, track.id, req.body.orderedIds);
    return { ok: true, lessons: await repo.listByTrack(t.id, track.id) };
  });
}
