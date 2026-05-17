// 同舟 · API 环境配置
// 启动时把所有环境变量集中读一次,产出强类型 config 对象。
// 后续不要在业务代码里再读 process.env。

import fs from "node:fs";
import path from "node:path";

// 极简的 .env.local / .env 加载（不引入 dotenv）
function loadDotEnv() {
  for (const name of [".env.local", ".env"]) {
    const p = path.resolve(process.cwd(), name);
    if (!fs.existsSync(p)) continue;
    const text = fs.readFileSync(p, "utf8");
    for (const raw of text.split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 0) continue;
      const k = line.slice(0, eq).trim();
      let v = line.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!(k in process.env)) process.env[k] = v;
    }
  }
}

loadDotEnv();

function need(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v == null) throw new Error(`[env] missing required env: ${name}`);
  return v;
}

function num(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`[env] ${name} not a number: ${v}`);
  return n;
}

function optNum(name: string): number | undefined {
  const v = process.env[name];
  if (!v) return undefined;
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`[env] ${name} not a number: ${v}`);
  return n;
}

function bool(name: string, fallback: boolean): boolean {
  const v = process.env[name];
  if (v == null || v === "") return fallback;
  const normalized = v.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  throw new Error(`[env] ${name} not a boolean: ${v}`);
}

export type DbDriver = "sqlite" | "postgres";
export type CacheDriver = "memory" | "redis";
export type StorageDriver = "local" | "tencent-cos";
export type VideoDriver = "local" | "tencent-vod";
export type WechatDriver = "dev" | "real";

export const config = {
  port: num("PORT", 4100),
  logLevel: need("LOG_LEVEL", "info"),
  corsOrigin: need(
    "CORS_ORIGIN",
    [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:4173",
      "http://127.0.0.1:4173",
    ].join(","),
  ),

  auth: {
    jwtSecret: process.env.AUTH_JWT_SECRET,
    devMode: bool("AUTH_DEV_MODE", process.env.NODE_ENV !== "production"),
  },

  db: {
    driver: need("DB_DRIVER", "sqlite") as DbDriver,
    sqlitePath: need("DB_SQLITE_PATH", "./data/tongzhou.db"),
    databaseUrl: process.env.DATABASE_URL,
  },

  cache: {
    driver: need("CACHE_DRIVER", "memory") as CacheDriver,
    redisUrl: process.env.REDIS_URL,
  },

  storage: {
    driver: need("STORAGE_DRIVER", "local") as StorageDriver,
    localDir: need("STORAGE_LOCAL_DIR", "./uploads"),
    publicBase: need("STORAGE_PUBLIC_BASE", "http://localhost:4100/files"),
    cos: {
      secretId: process.env.COS_SECRET_ID,
      secretKey: process.env.COS_SECRET_KEY,
      bucket: process.env.COS_BUCKET,
      region: process.env.COS_REGION,
      cdnDomain: process.env.COS_CDN_DOMAIN,
    },
  },

  video: {
    driver: need("VIDEO_DRIVER", "local") as VideoDriver,
    vod: {
      secretId: process.env.VOD_SECRET_ID,
      secretKey: process.env.VOD_SECRET_KEY,
      region: process.env.VOD_REGION,
      subAppId: optNum("VOD_SUB_APP_ID"),
      playKey: process.env.VOD_PLAY_KEY,
    },
  },

  wechat: {
    driver: need(
      "WECHAT_DRIVER",
      process.env.NODE_ENV === "production" ? "real" : "dev",
    ) as WechatDriver,
    appId: process.env.WECHAT_APP_ID,
    appSecret: process.env.WECHAT_APP_SECRET,
    // OAuth 回调 URL 的拼接基址。
    // dev 默认指向前端域(借 next.config.ts 的 /api/* 反代),
    // 这样 Set-Cookie 落到与前端页面同源的地方,cookie jar 正常生效;
    // prod 由部署方设置 https 域名,必须以 https:// 开头。
    oauthRedirectBase: need(
      "WECHAT_OAUTH_REDIRECT_BASE",
      need("PUBLIC_APP_BASE", "http://localhost:3000"),
    ),
  },

  // 学员端面向用户的站点基址(创作者侧拼邀请链接、学员登录后回跳)
  publicAppBase: need("PUBLIC_APP_BASE", "http://localhost:3000"),
} as const;

export type AppConfig = typeof config;
