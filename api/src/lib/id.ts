// ULID-ish id generator — 时间有序 + 26 字符 Crockford Base32
// 不引第三方依赖。MVP 够用，V1 可换 ulid/uuid v7。

import { randomBytes } from "node:crypto";

const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function encodeTime(now: number, len: number) {
  let out = "";
  for (let i = len - 1; i >= 0; i--) {
    const mod = now % 32;
    out = ENCODING[mod]! + out;
    now = Math.floor(now / 32);
  }
  return out;
}

function encodeRandom(len: number) {
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ENCODING[bytes[i]! % 32];
  }
  return out;
}

export function newId(prefix?: string): string {
  const ulid = encodeTime(Date.now(), 10) + encodeRandom(16);
  return prefix ? `${prefix}_${ulid}` : ulid;
}

export function shortCode(len = 6): string {
  return encodeRandom(len);
}
