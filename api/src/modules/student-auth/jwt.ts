// 学员 Session JWT
//
// 与创作者 auth/jwt.ts 平行:同一个 AUTH_JWT_SECRET,但 audience 不同,
// 防止创作者 token 被当作学员 token 复用(反之亦然)。
// payload 三件套: sub=member_id, tid=tenant_id, oid=openid。
// oid 用于 middleware 二次校验(member 仍存在 + openid 仍匹配)。

import { SignJWT, jwtVerify } from "jose";
import { config } from "../../env.js";

export type StudentJwtPayload = {
  sub: string; // members.id
  tid: string; // tenants.id
  oid: string; // wechat openid
};

const ISSUER = "tongzhou-api";
const AUDIENCE = "tongzhou-student";

function getSecret(): Uint8Array {
  const s = config.auth.jwtSecret;
  if (!s) throw new Error("[student-auth/jwt] AUTH_JWT_SECRET not set");
  if (s.length < 32) {
    throw new Error(
      `[student-auth/jwt] AUTH_JWT_SECRET too short (${s.length} chars, need >= 32)`,
    );
  }
  return new TextEncoder().encode(s);
}

export async function signStudentJwt(
  payload: StudentJwtPayload,
  ttlSec = 30 * 24 * 3600,
): Promise<string> {
  return new SignJWT({ tid: payload.tid, oid: payload.oid })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ttlSec}s`)
    .sign(getSecret());
}

export async function verifyStudentJwt(
  token: string,
): Promise<StudentJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (
      !payload.sub ||
      typeof payload.tid !== "string" ||
      typeof payload.oid !== "string"
    ) {
      return null;
    }
    return { sub: payload.sub, tid: payload.tid, oid: payload.oid };
  } catch {
    return null;
  }
}

export const STUDENT_COOKIE = "tz_student";
export const STUDENT_CSRF_COOKIE = "tz_student_csrf";
export const STUDENT_TTL_SEC = 30 * 24 * 3600;
