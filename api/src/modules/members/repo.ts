// Members · Repository

import { getDb } from "../../db/index.js";
import { newId } from "../../lib/id.js";

export type Member = {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  source: string;
  bound: number;
  anonymous: number;
  joined_at: string;
  last_active: string;
  course_count: number;
  playback_minutes: number;
  created_at: number;
  updated_at: number;
};

export async function listByTenant(tenantId: string): Promise<Member[]> {
  return getDb()
    .prepare(
      `SELECT * FROM members WHERE tenant_id = ? ORDER BY created_at DESC`,
    )
    .all<Member>([tenantId]);
}

export async function getById(
  tenantId: string,
  id: string,
): Promise<Member | undefined> {
  return getDb()
    .prepare(`SELECT * FROM members WHERE tenant_id = ? AND id = ?`)
    .get<Member>([tenantId, id]);
}

export async function create(
  tenantId: string,
  input: {
    name?: string;
    phone?: string;
    source?: string;
    bound?: boolean;
    anonymous?: boolean;
    joinedAt?: string;
  },
): Promise<Member> {
  const now = Date.now();
  const id = newId("mem");
  await getDb()
    .prepare(
      `INSERT INTO members
        (id, tenant_id, name, phone, source, bound, anonymous,
         joined_at, last_active, course_count, playback_minutes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', 0, 0, ?, ?)`,
    )
    .run([
      id,
      tenantId,
      input.name ?? "—",
      input.phone ?? "—",
      input.source ?? "单加",
      input.bound ? 1 : 0,
      input.anonymous ? 1 : 0,
      input.joinedAt ?? "",
      now,
      now,
    ]);
  return (await getById(tenantId, id))!;
}

export async function countActiveThisMonth(tenantId: string): Promise<number> {
  const monthStart = startOfMonth();
  const row = await getDb()
    .prepare(
      `SELECT COUNT(DISTINCT COALESCE(member_id, anon_token)) AS n
       FROM lesson_progress
       WHERE tenant_id = ? AND last_at >= ?`,
    )
    .get<{ n: number }>([tenantId, monthStart]);
  return row?.n ?? 0;
}

function startOfMonth(): number {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}
