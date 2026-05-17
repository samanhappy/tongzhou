// 学员侧 / 公开接口（不需要创作者身份）
// 路径前缀：/api/x/:slug
//
// V0.5 起加 OAuth2 (公众号 openid) 与 anonToken 合并。

import type { FastifyInstance } from "fastify";
import { getDb } from "../../db/index.js";
import { newId } from "../../lib/id.js";
import { getBySlug } from "../tenants/repo.js";
import * as tracksRepo from "../tracks/repo.js";
import * as lessonsRepo from "../lessons/repo.js";

export async function registerPublicRoutes(app: FastifyInstance) {
  app.get<{ Params: { slug: string } }>("/api/x/:slug", async (req, reply) => {
    const t = getBySlug(req.params.slug);
    if (!t) return reply.code(404).send({ error: "tenant not found" });

    const tracks = tracksRepo.listByTenant(t.id).filter((x) => x.status === "published");
    const track = tracks[0]; // V0 只有 1 门课
    if (!track) return { tenant: t, track: null, lessons: [] };
    const lessons = lessonsRepo.listByTrack(t.id, track.id);
    return { tenant: t, track, lessons };
  });

  app.get<{ Params: { slug: string; lessonId: string } }>(
    "/api/x/:slug/lessons/:lessonId",
    async (req, reply) => {
      const t = getBySlug(req.params.slug);
      if (!t) return reply.code(404).send({ error: "tenant not found" });
      const lesson = lessonsRepo.getById(t.id, req.params.lessonId);
      if (!lesson) return reply.code(404).send({ error: "lesson not found" });
      return { tenant: t, lesson };
    },
  );

  // 学员观看进度上报（与心跳合一）
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
    const t = getBySlug(req.params.slug);
    if (!t) return reply.code(404).send({ error: "tenant not found" });
    const { lessonId, watchedSec, completed, anonToken, memberId } = req.body ?? ({} as never);
    if (!lessonId) return reply.code(400).send({ error: "lessonId required" });
    if (!anonToken && !memberId) {
      return reply.code(400).send({ error: "anonToken or memberId required" });
    }
    const db = getDb();
    // 找现有记录
    const existing = anonToken
      ? db
          .prepare(
            `SELECT id FROM lesson_progress
             WHERE tenant_id = ? AND lesson_id = ? AND anon_token = ?`,
          )
          .get<{ id: string }>([t.id, lessonId, anonToken])
      : db
          .prepare(
            `SELECT id FROM lesson_progress
             WHERE tenant_id = ? AND lesson_id = ? AND member_id = ?`,
          )
          .get<{ id: string }>([t.id, lessonId, memberId!]);

    const sec = Math.max(0, watchedSec | 0);
    if (existing) {
      db.prepare(
        `UPDATE lesson_progress
           SET watched_sec = ?, completed = ?, last_at = ?
         WHERE id = ?`,
      ).run([sec, completed ? 1 : 0, Date.now(), existing.id]);
    } else {
      db.prepare(
        `INSERT INTO lesson_progress
           (id, tenant_id, lesson_id, anon_token, member_id, watched_sec, completed, last_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run([
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
