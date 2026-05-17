// Uploads · Repository

import { getDb } from "../../db/index.js";
import { newId } from "../../lib/id.js";

export type Upload = {
  id: string;
  tenant_id: string;
  filename: string;
  mime: string;
  size_bytes: number;
  storage_driver: string;
  storage_key: string;
  url: string;
  phase: "uploading" | "transcoding" | "ready" | "failed";
  progress: number;
  duration_sec: number | null;
  meta: string | null;
  created_at: number;
  updated_at: number;
};

export async function create(
  tenantId: string,
  input: {
    filename: string;
    mime: string;
    sizeBytes: number;
    storageDriver: string;
    storageKey: string;
    url: string;
    phase?: Upload["phase"];
  },
): Promise<Upload> {
  const now = Date.now();
  const id = newId("upl");
  await getDb()
    .prepare(
      `INSERT INTO uploads
        (id, tenant_id, filename, mime, size_bytes, storage_driver, storage_key, url,
         phase, progress, duration_sec, meta, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 100, NULL, NULL, ?, ?)`,
    )
    .run([
      id,
      tenantId,
      input.filename,
      input.mime,
      input.sizeBytes,
      input.storageDriver,
      input.storageKey,
      input.url,
      input.phase ?? "ready",
      now,
      now,
    ]);
  return (await getById(tenantId, id))!;
}

export async function getById(tenantId: string, id: string): Promise<Upload | undefined> {
  return getDb()
    .prepare(`SELECT * FROM uploads WHERE tenant_id = ? AND id = ?`)
    .get<Upload>([tenantId, id]);
}

export async function listByTenant(tenantId: string): Promise<Upload[]> {
  return getDb()
    .prepare(`SELECT * FROM uploads WHERE tenant_id = ? ORDER BY created_at DESC`)
    .all<Upload>([tenantId]);
}
