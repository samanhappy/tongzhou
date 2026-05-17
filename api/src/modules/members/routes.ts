import type { FastifyInstance } from "fastify";
import { config } from "../../env.js";
import { HttpError } from "../../middleware/error.js";
import { requireTenant } from "../../middleware/tenant.js";
import * as repo from "./repo.js";
import * as studentAuthRepo from "../student-auth/repo.js";

export async function registerMemberRoutes(app: FastifyInstance) {
  app.get("/api/members", async (req) => {
    const t = requireTenant(req);
    const [list, activeCount] = await Promise.all([
      repo.listByTenant(t.id),
      repo.countActiveThisMonth(t.id),
    ]);
    return { members: list, activeCount };
  });

  app.post<{
    Body: { name?: string; phone?: string; source?: string };
  }>("/api/members", async (req) => {
    const t = requireTenant(req);
    if (!req.body?.name && !req.body?.phone) {
      throw new HttpError(400, "name or phone required");
    }
    return {
      member: await repo.create(t.id, {
        ...req.body,
        bound: !!req.body?.phone && req.body.phone !== "—",
        joinedAt: shortDate(),
      }),
    };
  });

  // ── 邀请链接 ──
  app.post<{
    Params: { id: string };
    Body: { ttlDays?: number };
  }>("/api/members/:id/invite", async (req) => {
    const t = requireTenant(req);
    const member = await repo.getById(t.id, req.params.id);
    if (!member) throw new HttpError(404, "member not found");
    const ttlDays = clampInt(req.body?.ttlDays ?? 30, 1, 365);
    const invite = await studentAuthRepo.createInvite(t.id, member.id, {
      createdBy: req.auth?.userId,
      ttlSec: ttlDays * 24 * 3600,
    });
    return { invite: shapeInvite(invite, t.slug) };
  });

  app.get<{ Params: { id: string } }>(
    "/api/members/:id/invites",
    async (req) => {
      const t = requireTenant(req);
      const member = await repo.getById(t.id, req.params.id);
      if (!member) throw new HttpError(404, "member not found");
      const list = await studentAuthRepo.listInvitesForMember(t.id, member.id);
      return { invites: list.map((i) => shapeInvite(i, t.slug)) };
    },
  );

  app.delete<{ Params: { inviteId: string } }>(
    "/api/members/invites/:inviteId",
    async (req) => {
      const t = requireTenant(req);
      await studentAuthRepo.revokeInvite(t.id, req.params.inviteId);
      return { ok: true };
    },
  );

  app.post<{ Params: { id: string } }>(
    "/api/members/:id/unbind",
    async (req) => {
      const t = requireTenant(req);
      const member = await repo.getById(t.id, req.params.id);
      if (!member) throw new HttpError(404, "member not found");
      await studentAuthRepo.clearBinding(t.id, member.id);
      await studentAuthRepo.revokeLiveInvitesForMember(t.id, member.id);
      return { ok: true };
    },
  );

  app.post<{ Body: { csv: string; source?: string } }>(
    "/api/members/import-csv",
    async (req) => {
      const t = requireTenant(req);
      const text = String(req.body?.csv ?? "").trim();
      if (!text) throw new HttpError(400, "csv required");
      const source = req.body?.source ?? "CSV";
      let n = 0;
      for (const raw of text.split("\n")) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const [name, phone] = line.split(",").map((s) => s?.trim());
        if (!name && !phone) continue;
        await repo.create(t.id, {
          name: name || "—",
          phone: phone || "—",
          source,
          bound: !!phone,
          joinedAt: shortDate(),
        });
        n++;
      }
      return { imported: n };
    },
  );
}

function shortDate() {
  const d = new Date();
  return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, "0")}`;
}

function clampInt(v: unknown, min: number, max: number): number {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function shapeInvite(invite: studentAuthRepo.MemberInvite, slug: string) {
  const base = config.publicAppBase.replace(/\/$/, "");
  return {
    id: invite.id,
    token: invite.token,
    url: `${base}/x/${encodeURIComponent(slug)}/invite/${encodeURIComponent(
      invite.token,
    )}`,
    createdAt: invite.created_at,
    expiresAt: invite.expires_at,
    usedAt: invite.used_at,
    revokedAt: invite.revoked_at,
  };
}
