// Student-Auth · Repository
//
// 三件事:
//   1. 按 (tenant_id, openid) 找 member —— middleware 与 callback 都用
//   2. 把 openid + 昵称/头像 绑定到 member
//   3. member_invites 表的 CRUD

import { randomBytes } from "node:crypto";
import { getDb } from "../../db/index.js";
import { newId } from "../../lib/id.js";
import type { Member } from "../members/repo.js";

export type MemberInvite = {
  id: string;
  tenant_id: string;
  member_id: string;
  token: string;
  created_by: string | null;
  created_at: number;
  expires_at: number;
  used_at: number | null;
  used_openid: string | null;
  revoked_at: number | null;
};

export async function findMemberByOpenid(
  tenantId: string,
  openid: string,
): Promise<Member | undefined> {
  return getDb()
    .prepare(
      `SELECT * FROM members WHERE tenant_id = ? AND wechat_openid = ?`,
    )
    .get<Member>([tenantId, openid]);
}

export async function bindOpenid(
  tenantId: string,
  memberId: string,
  wechat: {
    openid: string;
    unionid?: string;
    nickname?: string;
    avatar?: string;
  },
): Promise<void> {
  const now = Date.now();
  await getDb()
    .prepare(
      `UPDATE members
         SET wechat_openid = ?, wechat_unionid = ?,
             wechat_nickname = ?, wechat_avatar = ?,
             bound = 1, bound_at = ?, updated_at = ?
       WHERE tenant_id = ? AND id = ?`,
    )
    .run([
      wechat.openid,
      wechat.unionid ?? null,
      wechat.nickname ?? null,
      wechat.avatar ?? null,
      now,
      now,
      tenantId,
      memberId,
    ]);
}

export async function clearBinding(
  tenantId: string,
  memberId: string,
): Promise<void> {
  await getDb()
    .prepare(
      `UPDATE members
         SET wechat_openid = NULL, wechat_unionid = NULL,
             wechat_nickname = NULL, wechat_avatar = NULL,
             bound_at = NULL, updated_at = ?
       WHERE tenant_id = ? AND id = ?`,
    )
    .run([Date.now(), tenantId, memberId]);
}

// ───────────────── 邀请链接 ─────────────────

export async function createInvite(
  tenantId: string,
  memberId: string,
  args: { createdBy?: string; ttlSec?: number } = {},
): Promise<MemberInvite> {
  const now = Date.now();
  const ttl = args.ttlSec ?? 30 * 24 * 3600;
  const id = newId("inv");
  const token = generateToken();
  await getDb()
    .prepare(
      `INSERT INTO member_invites
        (id, tenant_id, member_id, token, created_by, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run([
      id,
      tenantId,
      memberId,
      token,
      args.createdBy ?? null,
      now,
      now + ttl * 1000,
    ]);
  return (await getInviteById(tenantId, id))!;
}

export async function getInviteById(
  tenantId: string,
  id: string,
): Promise<MemberInvite | undefined> {
  return getDb()
    .prepare(`SELECT * FROM member_invites WHERE tenant_id = ? AND id = ?`)
    .get<MemberInvite>([tenantId, id]);
}

/** 按 token 查；不带 tenant 过滤(token 全局唯一),调用方需再校 tenant。 */
export async function getInviteByToken(
  token: string,
): Promise<MemberInvite | undefined> {
  return getDb()
    .prepare(`SELECT * FROM member_invites WHERE token = ?`)
    .get<MemberInvite>([token]);
}

export async function markInviteUsed(
  inviteId: string,
  openid: string,
): Promise<void> {
  await getDb()
    .prepare(
      `UPDATE member_invites SET used_at = ?, used_openid = ? WHERE id = ?`,
    )
    .run([Date.now(), openid, inviteId]);
}

export async function revokeInvite(
  tenantId: string,
  inviteId: string,
): Promise<void> {
  await getDb()
    .prepare(
      `UPDATE member_invites SET revoked_at = ? WHERE tenant_id = ? AND id = ?`,
    )
    .run([Date.now(), tenantId, inviteId]);
}

export async function revokeLiveInvitesForMember(
  tenantId: string,
  memberId: string,
): Promise<void> {
  await getDb()
    .prepare(
      `UPDATE member_invites SET revoked_at = ?
        WHERE tenant_id = ? AND member_id = ?
          AND used_at IS NULL AND revoked_at IS NULL`,
    )
    .run([Date.now(), tenantId, memberId]);
}

export async function listInvitesForMember(
  tenantId: string,
  memberId: string,
): Promise<MemberInvite[]> {
  return getDb()
    .prepare(
      `SELECT * FROM member_invites
        WHERE tenant_id = ? AND member_id = ?
        ORDER BY created_at DESC`,
    )
    .all<MemberInvite>([tenantId, memberId]);
}

function generateToken(): string {
  // 32 字节 → 43 字符 base64url(去除 =)。
  return randomBytes(32)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
