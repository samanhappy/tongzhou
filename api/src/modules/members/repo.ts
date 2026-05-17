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

export function listByTenant(tenantId: string): Member[] {
  return getDb()
    .prepare(`SELECT * FROM members WHERE tenant_id = ? ORDER BY created_at DESC`)
    .all<Member>([tenantId]);
}

export function getById(tenantId: string, id: string): Member | undefined {
  return getDb()
    .prepare(`SELECT * FROM members WHERE tenant_id = ? AND id = ?`)
    .get<Member>([tenantId, id]);
}

export function create(
  tenantId: string,
  input: {
    name?: string;
    phone?: string;
    source?: string;
    bound?: boolean;
    anonymous?: boolean;
    joinedAt?: string;
  },
): Member {
  const now = Date.now();
  const id = newId("mem");
  getDb()
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
  return getById(tenantId, id)!;
}

export function countActiveThisMonth(tenantId: string): number {
  // MVP：用 last_active 字符串不可靠，改用 lesson_progress.last_at 在本月内的 distinct 学员
  const monthStart = startOfMonth();
  const row = getDb()
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
