// Auth · Users repository
//
// V0:一个 tenant 一个 owner user。schema 已有 users 表。
// V1 起 role=owner|coach + 多人协作。

import { getDb } from "../../db/index.js";
import { newId } from "../../lib/id.js";

export type User = {
  id: string;
  tenant_id: string;
  email: string;
  password_hash: string | null;
  role: string;
  created_at: number;
};

export async function getByEmail(email: string): Promise<User | undefined> {
  return getDb()
    .prepare(`SELECT * FROM users WHERE email = ?`)
    .get<User>([email.toLowerCase()]);
}

export async function getById(id: string): Promise<User | undefined> {
  return getDb().prepare(`SELECT * FROM users WHERE id = ?`).get<User>([id]);
}

export async function create(input: {
  tenantId: string;
  email: string;
  passwordHash: string;
  role?: "owner" | "coach";
}): Promise<User> {
  const id = newId("usr");
  await getDb()
    .prepare(
      `INSERT INTO users (id, tenant_id, email, password_hash, role, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run([
      id,
      input.tenantId,
      input.email.toLowerCase(),
      input.passwordHash,
      input.role ?? "owner",
      Date.now(),
    ]);
  return (await getById(id))!;
}
