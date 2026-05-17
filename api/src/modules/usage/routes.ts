import type { FastifyInstance } from "fastify";
import { requireTenant } from "../../middleware/tenant.js";
import * as repo from "./repo.js";

export async function registerUsageRoutes(app: FastifyInstance) {
  app.get("/api/usage/meters", async (req) => {
    const t = requireTenant(req);
    return { meters: repo.readMeters(t.id) };
  });

  // 重算事件流（用量计费页右上角"重算事件流"按钮）
  app.post("/api/usage/recompute", async (req) => {
    const t = requireTenant(req);
    repo.recomputeMonth(t.id);
    return { ok: true, meters: repo.readMeters(t.id) };
  });

  // 学员侧心跳上报：累加 playback.minutes
  // 路径放在 /api/x/* 下,不需要 tenant header,通过 slug 解析
  app.post<{
    Params: { slug: string };
    Body: { lessonId: string; deltaSec: number; anonToken?: string; memberId?: string };
  }>("/api/x/:slug/heartbeat", async (req, reply) => {
    const { getBySlug } = await import("../tenants/repo.js");
    const t = getBySlug(req.params.slug);
    if (!t) return reply.code(404).send({ error: "tenant not found" });

    const deltaMin = Math.max(0, (req.body?.deltaSec ?? 0) / 60);
    if (deltaMin <= 0) return { ok: true };

    repo.recordEvent({
      tenantId: t.id,
      metricKey: "playback.minutes",
      delta: deltaMin,
      refKind: "video",
      refId: req.body.lessonId,
      meta: { anonToken: req.body.anonToken, memberId: req.body.memberId },
    });
    return { ok: true };
  });
}
