// 学员侧 / 公开接口（不需要创作者身份）
// 路径前缀：/api/x/:slug
//
// 注意 PG/RLS 路径：这些路由不在创作者 tenant 上下文里,
// 但仍需访问 tenant 数据,因此 middleware/tenant.ts 会基于 URL 的 :slug 设置
// app.tenant_id,确保 RLS 通过。

import type { FastifyInstance } from "fastify";
import { getDb } from "../../db/index.js";
import { newId } from "../../lib/id.js";
import { getBySlug } from "../tenants/repo.js";
import * as tracksRepo from "../tracks/repo.js";
import * as lessonsRepo from "../lessons/repo.js";
import * as uploadsRepo from "../uploads/repo.js";
import { getStorage } from "../../storage/index.js";

export async function registerPublicRoutes(app: FastifyInstance) {
  app.get<{ Params: { slug: string } }>("/api/x/:slug", async (req, reply) => {
    const t = await getBySlug(req.params.slug);
    if (!t) return reply.code(404).send({ error: "tenant not found" });

    const all = await tracksRepo.listByTenant(t.id);
    const tracks = all.filter((x) => x.status === "published");
    const track = tracks[0];
    if (!track) return { tenant: t, track: null, lessons: [] };
    const lessons = await lessonsRepo.listByTrack(t.id, track.id);
    return { tenant: t, track, lessons };
  });

  app.get<{ Params: { slug: string; lessonId: string } }>(
    "/api/x/:slug/lessons/:lessonId",
    async (req, reply) => {
      const t = await getBySlug(req.params.slug);
      if (!t) return reply.code(404).send({ error: "tenant not found" });
      const lesson = await lessonsRepo.getById(t.id, req.params.lessonId);
      if (!lesson) return reply.code(404).send({ error: "lesson not found" });
      return { tenant: t, lesson };
    },
  );

  // 学员端播放地址 · MVP 直接返回 uploads.url(local / COS 公开 URL)
  // V0.5 切到 tencent-vod 后,这里改成 video.getPlayInfo() 返回 playAuth-signed URL
  app.get<{ Params: { slug: string; lessonId: string } }>(
    "/api/x/:slug/lessons/:lessonId/play",
    async (req, reply) => {
      const t = await getBySlug(req.params.slug);
      if (!t) return reply.code(404).send({ error: "tenant not found" });
      const lesson = await lessonsRepo.getById(t.id, req.params.lessonId);
      if (!lesson) return reply.code(404).send({ error: "lesson not found" });
      if (!lesson.video_id) {
        return reply.code(404).send({ error: "lesson has no video" });
      }
      const upload = await uploadsRepo.getById(t.id, lesson.video_id);
      if (!upload) {
        return reply.code(404).send({ error: "upload not found" });
      }
      if (upload.phase !== "ready") {
        return reply
          .code(409)
          .send({ error: `upload not ready: ${upload.phase}` });
      }
      const expiresSec = 6 * 3600;
      // 私有桶 / CDN 鉴权下需要签名 URL；local 适配器直接返回 publicUrl
      const playUrl = await getStorage().signedReadUrl(
        upload.storage_key,
        expiresSec,
      );
      return {
        playUrl,
        mime: upload.mime,
        durationSec: upload.duration_sec ?? lesson.duration_sec,
        expiresAt: Date.now() + expiresSec * 1000,
      };
    },
  );

  app.post<{
    Params: { slug: string };
    Body: {
      lessonId: string;
      watchedSec: number;
      completed?: boolean;
      anonToken?: string;
      memberId?: string;
    };
  }>("/api/x/:slug/progress", async (req, reply) => {
    const t = await getBySlug(req.params.slug);
    if (!t) return reply.code(404).send({ error: "tenant not found" });
    const { lessonId, watchedSec, completed, anonToken, memberId } =
      req.body ?? ({} as never);
    if (!lessonId) return reply.code(400).send({ error: "lessonId required" });
    if (!anonToken && !memberId) {
      return reply.code(400).send({ error: "anonToken or memberId required" });
    }
    const db = getDb();
    const existing = anonToken
      ? await db
          .prepare(
            `SELECT id FROM lesson_progress
             WHERE tenant_id = ? AND lesson_id = ? AND anon_token = ?`,
          )
          .get<{ id: string }>([t.id, lessonId, anonToken])
      : await db
          .prepare(
            `SELECT id FROM lesson_progress
             WHERE tenant_id = ? AND lesson_id = ? AND member_id = ?`,
          )
          .get<{ id: string }>([t.id, lessonId, memberId!]);

    const sec = Math.max(0, watchedSec | 0);
    if (existing) {
      await db
        .prepare(
          `UPDATE lesson_progress
             SET watched_sec = ?, completed = ?, last_at = ?
           WHERE id = ?`,
        )
        .run([sec, completed ? 1 : 0, Date.now(), existing.id]);
    } else {
      await db
        .prepare(
          `INSERT INTO lesson_progress
             (id, tenant_id, lesson_id, anon_token, member_id, watched_sec, completed, last_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run([
          newId("lp"),
          t.id,
          lessonId,
          anonToken ?? null,
          memberId ?? null,
          sec,
          completed ? 1 : 0,
          Date.now(),
        ]);
    }
    return { ok: true };
  });
}
