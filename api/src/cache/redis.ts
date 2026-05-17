// 同舟 · Redis 适配器（口子 · 未实现）
//
// 待办：
//   1. npm i ioredis
//   2. 用 SET key val EX ttlSec / GET / DEL / INCRBY
//   3. JSON 值由调用方序列化（接口的 value 是 unknown）

import type { Cache } from "./index.js";

export function createRedisCache(_url: string): Cache {
  throw new Error(
    "[cache/redis] not implemented yet. 用 CACHE_DRIVER=memory 即可。" +
      " 实现指南见 api/src/cache/redis.ts 头部注释。",
  );
}
