import type { FastifyInstance } from "fastify";
import { requireTenant } from "../../middleware/tenant.js";
import * as repo from "./repo.js";

export async function registerUsageRoutes(app: FastifyInstance) {
  app.get("/api/usage/meters", async (req) => {
    const t = requireTenant(req);
    return { meters: await repo.readMeters(t.id) };
  });

  app.post("/api/usage/recompute", async (req) => {
    const t = requireTenant(req);
    await repo.recomputeMonth(t.id);
    return { ok: true, meters: await repo.readMeters(t.id) };
  });

  // 学员侧心跳：累加 playback.minutes
  app.post<{
    Params: { slug: string };
    Body: {
      lessonId: string;
      deltaSec: number;
      anonToken?: string;
      memberId?: string;
    };
  }>("/api/x/:slug/heartbeat", async (req, reply) => {
    const { getBySlug } = await import("../tenants/repo.js");
    const t = await getBySlug(req.params.slug);
    if (!t) return reply.code(404).send({ error: "tenant not found" });

    const deltaMin = Math.max(0, (req.body?.deltaSec ?? 0) / 60);
    if (deltaMin <= 0) return { ok: true };

    await repo.recordEvent({
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
