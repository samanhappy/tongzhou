// 同舟 · DB 适配器门面
//
// 设计意图：
// - 业务代码只依赖 `Db` 接口，不依赖具体存储
// - SQLite 是 MVP 默认；Postgres 支持 RLS 防御层
// - 占位符统一用 `?`,PG 适配器内部转 $N
// - 事务接口为 async,SQLite 内部同步桥接
//
// 多租户合规两道防线：
//   ① 应用层：repo SQL 必带 tenant_id where（已落实）
//   ② 数据层：PG 模式启用 RLS,USING (tenant_id = current_setting('app.tenant_id')::uuid)
//      每请求 BEGIN + SET LOCAL,onResponse COMMIT/ROLLBACK
//
// 任一层失守,另一层兜底。

export type SqlValue = string | number | bigint | Buffer | null | boolean;

export type DbRow = Record<string, SqlValue>;

export interface PreparedStatement {
  run(params?: SqlValue[]): Promise<{ changes: number }>;
  get<T = DbRow>(params?: SqlValue[]): Promise<T | undefined>;
  all<T = DbRow>(params?: SqlValue[]): Promise<T[]>;
}

export interface Db {
  driver: "sqlite" | "postgres";
  prepare(sql: string): PreparedStatement;
  /** 直接执行 (DDL / 多语句)。 */
  exec(sql: string): Promise<void>;
  /** 事务。返回值即 fn 的返回。SQLite 桥接同步实现；PG 用 SAVEPOINT。 */
  transaction<T>(fn: () => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

// ─────────────────────────────────────────────
// 请求作用域 (per-request connection for PG + RLS)
// ─────────────────────────────────────────────
//
// AsyncLocalStorage 持有当前请求的 PG client 引用。
// SQLite 不需要 — 共享一个 file handle,无并发竞争。
// 见 ./postgres.ts startRequestScope / attachClientToScope / endRequestScope。

import { AsyncLocalStorage } from "node:async_hooks";

// 用 unknown 避免循环引用 pg 类型；postgres.ts 自己 cast 回 PoolClient。
export type RequestScope = {
  client?: unknown;
  tenantId?: string;
};

export const requestScope = new AsyncLocalStorage<RequestScope>();

export function currentScope(): RequestScope | undefined {
  return requestScope.getStore();
}

// ─────────────────────────────────────────────
// 单例
// ─────────────────────────────────────────────

let _db: Db | null = null;

export function setDb(db: Db) {
  _db = db;
}

export function getDb(): Db {
  if (!_db) throw new Error("[db] not initialized. Call setDb() at boot.");
  return _db;
}

export async function initDb(): Promise<Db> {
  const { config } = await import("../env.js");
  if (config.db.driver === "sqlite") {
    const { openSqlite } = await import("./sqlite.js");
    const db = openSqlite(config.db.sqlitePath);
    setDb(db);
    return db;
  }
  if (config.db.driver === "postgres") {
    const { openPostgres } = await import("./postgres.js");
    const db = await openPostgres({
      connectionString: config.db.databaseUrl ?? "",
    });
    setDb(db);
    return db;
  }
  throw new Error(`[db] unknown driver: ${config.db.driver}`);
}
