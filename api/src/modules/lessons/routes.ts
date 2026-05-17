import type { FastifyInstance } from "fastify";
import { HttpError } from "../../middleware/error.js";
import { requireTenant } from "../../middleware/tenant.js";
import * as repo from "./repo.js";
import * as tracks from "../tracks/repo.js";

export async function registerLessonRoutes(app: FastifyInstance) {
  // 列出 track 下所有课时（也可以直接通过 GET /api/tracks/:id 拿到）
  app.get<{ Params: { trackId: string } }>(
    "/api/tracks/:trackId/lessons",
    async (req) => {
      const t = requireTenant(req);
      const track = tracks.getById(t.id, req.params.trackId);
      if (!track) throw new HttpError(404, "track not found");
      return { lessons: repo.listByTrack(t.id, track.id) };
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
    };
  }>("/api/tracks/:trackId/lessons", async (req) => {
    const t = requireTenant(req);
    const track = tracks.getById(t.id, req.params.trackId);
    if (!track) throw new HttpError(404, "track not found");
    if (!req.body?.title) throw new HttpError(400, "title required");

    const existing = repo.listByTrack(t.id, track.id);
    const lesson = repo.create(t.id, track.id, {
      ...req.body,
      position: existing.length,
    });
    tracks.recomputeStats(t.id, track.id);
    return { lesson };
  });

  app.patch<{
    Params: { id: string };
    Body: Partial<{
      title: string;
      summary: string;
      status: "draft" | "uploading" | "transcoding" | "published" | "failed";
      durationSec: number;
      durationText: string;
      progress: number;
    }>;
  }>("/api/lessons/:id", async (req) => {
    const t = requireTenant(req);
    const lesson = repo.update(t.id, req.params.id, {
      title: req.body?.title,
      summary: req.body?.summary,
      status: req.body?.status,
      duration_sec: req.body?.durationSec,
      duration_text: req.body?.durationText,
      progress: req.body?.progress,
    });
    if (!lesson) throw new HttpError(404, "lesson not found");
    tracks.recomputeStats(t.id, lesson.track_id);
    return { lesson };
  });

  app.delete<{ Params: { id: string } }>("/api/lessons/:id", async (req) => {
    const t = requireTenant(req);
    const lesson = repo.getById(t.id, req.params.id);
    if (!lesson) throw new HttpError(404, "lesson not found");
    repo.remove(t.id, req.params.id);
    tracks.recomputeStats(t.id, lesson.track_id);
    return { ok: true };
  });

  // 拖拽排序
  app.post<{
    Params: { trackId: string };
    Body: { orderedIds: string[] };
  }>("/api/tracks/:trackId/lessons/reorder", async (req) => {
    const t = requireTenant(req);
    const track = tracks.getById(t.id, req.params.trackId);
    if (!track) throw new HttpError(404, "track not found");
    if (!Array.isArray(req.body?.orderedIds)) {
      throw new HttpError(400, "orderedIds: string[] required");
    }
    repo.reorder(t.id, track.id, req.body.orderedIds);
    return { ok: true, lessons: repo.listByTrack(t.id, track.id) };
  });
}
