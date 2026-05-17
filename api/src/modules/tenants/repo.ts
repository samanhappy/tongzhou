// Tenants · Repository
// 注意：tenants 表本身不带 tenant_id 过滤(它是 tenant 自身),也不开启 RLS。

import { getDb } from "../../db/index.js";
import { newId } from "../../lib/id.js";

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  theme_hue: number;
  group_link: string;
  plan: string;
  created_at: number;
  updated_at: number;
};

export async function getBySlug(slug: string): Promise<Tenant | undefined> {
  return getDb().prepare(`SELECT * FROM tenants WHERE slug = ?`).get<Tenant>([slug]);
}

export async function getById(id: string): Promise<Tenant | undefined> {
  return getDb().prepare(`SELECT * FROM tenants WHERE id = ?`).get<Tenant>([id]);
}

export async function listAll(): Promise<Tenant[]> {
  return getDb().prepare(`SELECT * FROM tenants ORDER BY created_at DESC`).all<Tenant>();
}

export async function create(input: {
  slug: string;
  name: string;
  tagline?: string;
  themeHue?: number;
  groupLink?: string;
}): Promise<Tenant> {
  const now = Date.now();
  const id = newId("ten");
  await getDb()
    .prepare(
      `INSERT INTO tenants (id, slug, name, tagline, theme_hue, group_link, plan, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'free', ?, ?)`,
    )
    .run([
      id,
      input.slug,
      input.name,
      input.tagline ?? "",
      input.themeHue ?? 162,
      input.groupLink ?? "",
      now,
      now,
    ]);
  return (await getById(id))!;
}

export async function update(
  id: string,
  patch: Partial<Pick<Tenant, "name" | "tagline" | "theme_hue" | "group_link" | "plan">>,
): Promise<Tenant | undefined> {
  const fields: string[] = [];
  const values: (string | number)[] = [];
  for (const [k, v] of Object.entries(patch)) {
    if (v == null) continue;
    fields.push(`${k} = ?`);
    values.push(v as string | number);
  }
  if (!fields.length) return getById(id);
  fields.push("updated_at = ?");
  values.push(Date.now());
  values.push(id);
  await getDb()
    .prepare(`UPDATE tenants SET ${fields.join(", ")} WHERE id = ?`)
    .run(values);
  return getById(id);
}
