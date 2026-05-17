// Tracks · Repository
// 所有 SQL 都带 tenant_id 过滤 — 多租户硬约束(应用层),配合 PG RLS(数据层)双保险。

import { getDb } from "../../db/index.js";
import { newId } from "../../lib/id.js";

export type Track = {
  id: string;
  tenant_id: string;
  slug: string;
  title: string;
  subtitle: string;
  one_line: string;
  cover_url: string | null;
  status: "draft" | "published" | "archived";
  total_minutes: number;
  cumulative_viewers: number;
  completion_rate: number;
  position: number;
  created_at: number;
  updated_at: number;
};

export async function listByTenant(tenantId: string): Promise<Track[]> {
  return getDb()
    .prepare(`SELECT * FROM tracks WHERE tenant_id = ? ORDER BY position, created_at DESC`)
    .all<Track>([tenantId]);
}

export async function getById(tenantId: string, id: string): Promise<Track | undefined> {
  return getDb()
    .prepare(`SELECT * FROM tracks WHERE tenant_id = ? AND id = ?`)
    .get<Track>([tenantId, id]);
}

export async function getBySlug(tenantId: string, slug: string): Promise<Track | undefined> {
  return getDb()
    .prepare(`SELECT * FROM tracks WHERE tenant_id = ? AND slug = ?`)
    .get<Track>([tenantId, slug]);
}

export async function create(
  tenantId: string,
  input: { slug: string; title: string; subtitle?: string; oneLine?: string },
): Promise<Track> {
  const now = Date.now();
  const id = newId("trk");
  await getDb()
    .prepare(
      `INSERT INTO tracks
        (id, tenant_id, slug, title, subtitle, one_line, status, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'draft', 0, ?, ?)`,
    )
    .run([id, tenantId, input.slug, input.title, input.subtitle ?? "", input.oneLine ?? "", now, now]);
  return (await getById(tenantId, id))!;
}

export async function update(
  tenantId: string,
  id: string,
  patch: Partial<Pick<Track, "title" | "subtitle" | "one_line" | "status" | "cover_url" | "position">>,
): Promise<Track | undefined> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    fields.push(`${k} = ?`);
    values.push(v as string | number | null);
  }
  if (!fields.length) return getById(tenantId, id);
  fields.push("updated_at = ?");
  values.push(Date.now());
  values.push(tenantId, id);
  await getDb()
    .prepare(`UPDATE tracks SET ${fields.join(", ")} WHERE tenant_id = ? AND id = ?`)
    .run(values);
  return getById(tenantId, id);
}

export async function recomputeStats(tenantId: string, trackId: string): Promise<void> {
  const db = getDb();
  const sums = await db
    .prepare(
      `SELECT
         COALESCE(SUM(duration_sec), 0) AS sum_dur,
         COALESCE(SUM(views), 0)        AS sum_views,
         COUNT(*) AS total
       FROM lessons WHERE tenant_id = ? AND track_id = ? AND status = 'published'`,
    )
    .get<{ sum_dur: number; sum_views: number; total: number }>([tenantId, trackId]);
  const totalMinutes = Math.round((sums?.sum_dur ?? 0) / 60);
  const cumulativeViewers = sums?.sum_views ?? 0;
  await db
    .prepare(
      `UPDATE tracks
         SET total_minutes = ?, cumulative_viewers = ?, updated_at = ?
       WHERE tenant_id = ? AND id = ?`,
    )
    .run([totalMinutes, cumulativeViewers, Date.now(), tenantId, trackId]);
}
