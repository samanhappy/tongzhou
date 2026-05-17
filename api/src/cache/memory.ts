// 同舟 · 进程内 Cache（MVP）
// 单进程,够用;多副本部署后切 Redis。

import type { Cache } from "./index.js";

type Entry = { value: unknown; expiresAt?: number };

export function createMemoryCache(): Cache {
  const store = new Map<string, Entry>();

  function fresh(k: string): Entry | undefined {
    const e = store.get(k);
    if (!e) return undefined;
    if (e.expiresAt != null && e.expiresAt < Date.now()) {
      store.delete(k);
      return undefined;
    }
    return e;
  }

  return {
    driver: "memory",
    async get<T>(k: string) {
      const e = fresh(k);
      return (e ? (e.value as T) : null);
    },
    async set(k, v, ttlSec) {
      const expiresAt = ttlSec ? Date.now() + ttlSec * 1000 : undefined;
      store.set(k, { value: v, expiresAt });
    },
    async del(k) {
      store.delete(k);
    },
    async incr(k, delta = 1) {
      const e = fresh(k);
      const cur = typeof e?.value === "number" ? (e.value as number) : 0;
      const next = cur + delta;
      store.set(k, { value: next, expiresAt: e?.expiresAt });
      return next;
    },
    async close() {
      store.clear();
    },
  };
}
