import type { FastifyInstance } from "fastify";
import { HttpError } from "../../middleware/error.js";
import { requireTenant } from "../../middleware/tenant.js";
import * as repo from "./repo.js";

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
