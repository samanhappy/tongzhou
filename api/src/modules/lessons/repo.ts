// Lessons · Repository

import { getDb } from "../../db/index.js";
import { newId } from "../../lib/id.js";

export type Lesson = {
  id: string;
  tenant_id: string;
  track_id: string;
  title: string;
  summary: string;
  position: number;
  duration_sec: number | null;
  duration_text: string;
  video_id: string | null;
  status: "draft" | "uploading" | "transcoding" | "published" | "failed";
  views: number;
  progress: number | null;
  created_at: number;
  updated_at: number;
};

export async function listByTrack(tenantId: string, trackId: string): Promise<Lesson[]> {
  return getDb()
    .prepare(
      `SELECT * FROM lessons WHERE tenant_id = ? AND track_id = ? ORDER BY position, created_at`,
    )
    .all<Lesson>([tenantId, trackId]);
}

export async function getById(tenantId: string, id: string): Promise<Lesson | undefined> {
  return getDb()
    .prepare(`SELECT * FROM lessons WHERE tenant_id = ? AND id = ?`)
    .get<Lesson>([tenantId, id]);
}

export async function create(
  tenantId: string,
  trackId: string,
  input: {
    title: string;
    summary?: string;
    position?: number;
    durationSec?: number;
    durationText?: string;
    status?: Lesson["status"];
    videoId?: string;
  },
): Promise<Lesson> {
  const now = Date.now();
  const id = newId("les");
  await getDb()
    .prepare(
      `INSERT INTO lessons
        (id, tenant_id, track_id, title, summary, position, duration_sec, duration_text,
         video_id, status, views, progress, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?)`,
    )
    .run([
      id,
      tenantId,
      trackId,
      input.title,
      input.summary ?? "",
      input.position ?? 0,
      input.durationSec ?? null,
      input.durationText ?? "—",
      input.videoId ?? null,
      input.status ?? "draft",
      now,
      now,
    ]);
  return (await getById(tenantId, id))!;
}

export async function update(
  tenantId: string,
  id: string,
  patch: Partial<
    Pick<
      Lesson,
      "title" | "summary" | "position" | "duration_sec" | "duration_text" | "video_id" | "status" | "views" | "progress"
    >
  >,
): Promise<Lesson | undefined> {
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
    .prepare(`UPDATE lessons SET ${fields.join(", ")} WHERE tenant_id = ? AND id = ?`)
    .run(values);
  return getById(tenantId, id);
}

export async function remove(tenantId: string, id: string): Promise<void> {
  await getDb()
    .prepare(`DELETE FROM lessons WHERE tenant_id = ? AND id = ?`)
    .run([tenantId, id]);
}

/** 整组 position 写回(拖拽排序) — 用 async 事务 */
export async function reorder(tenantId: string, trackId: string, orderedIds: string[]): Promise<void> {
  const db = getDb();
  await db.transaction(async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db
        .prepare(
          `UPDATE lessons SET position = ?, updated_at = ?
           WHERE tenant_id = ? AND track_id = ? AND id = ?`,
        )
        .run([i, Date.now(), tenantId, trackId, orderedIds[i]!]);
    }
  });
}
