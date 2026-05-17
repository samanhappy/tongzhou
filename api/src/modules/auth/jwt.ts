// JWT 签发与验证
//
// 用 jose 而非 jsonwebtoken — 现代 API、Web Crypto 兼容、active 维护。
// HS256 + 32 字节 secret(env);生产请确保 secret >= 32 字节随机。

import { SignJWT, jwtVerify } from "jose";

export type JwtPayload = {
  sub: string; // user.id
  tid: string; // tenant.id
  email: string;
};

const ISSUER = "tongzhou-api";
const AUDIENCE = "tongzhou-app";

function getSecret(): Uint8Array {
  const s = process.env.AUTH_JWT_SECRET;
  if (!s) {
    throw new Error("[auth/jwt] AUTH_JWT_SECRET not set");
  }
  if (s.length < 32) {
    throw new Error(`[auth/jwt] AUTH_JWT_SECRET too short (${s.length} chars, need >= 32)`);
  }
  return new TextEncoder().encode(s);
}

export async function signJwt(payload: JwtPayload, ttlSec = 7 * 24 * 3600): Promise<string> {
  return new SignJWT({ tid: payload.tid, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ttlSec}s`)
    .sign(getSecret());
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (!payload.sub || typeof payload.tid !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return { sub: payload.sub, tid: payload.tid, email: payload.email };
  } catch {
    return null;
  }
}

export const COOKIE_NAME = "tz_session";
