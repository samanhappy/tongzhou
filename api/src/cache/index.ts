// 同舟 · Cache 适配器门面
//
// MVP 用法很少：分享短链反查、热点 quota 缓存。
// 接口故意小：get/set/del/incr。Redis 切换零业务改动。

export interface Cache {
  driver: string;
  get<T = string>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSec?: number): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string, delta?: number): Promise<number>;
  close(): Promise<void>;
}

let _cache: Cache | null = null;

export function setCache(c: Cache) {
  _cache = c;
}

export function getCache(): Cache {
  if (!_cache)
    throw new Error("[cache] not initialized. Call setCache() at boot.");
  return _cache;
}

export async function initCache(): Promise<Cache> {
  const { config } = await import("../env.js");
  if (config.cache.driver === "memory") {
    const { createMemoryCache } = await import("./memory.js");
    const c = createMemoryCache();
    setCache(c);
    return c;
  }
  if (config.cache.driver === "redis") {
    const { createRedisCache } = await import("./redis.js");
    const c = createRedisCache(config.cache.redisUrl ?? "");
    setCache(c);
    return c;
  }
  throw new Error(`[cache] unknown driver: ${config.cache.driver}`);
}
