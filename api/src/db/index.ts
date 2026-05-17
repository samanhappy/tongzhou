// 同舟 · DB 适配器门面
//
// 设计意图：
// - 业务代码只依赖 `Db` 接口，不依赖具体存储
// - SQLite 是 MVP 实现；Postgres 在 ./postgres.ts 留口
// - 接口故意保持窄面：只暴露 prepare/exec/transaction，避免被某个驱动绑死
//
// 多租户合规：业务代码必须经由 modules/*/repo.ts 调用，
// repo 强制在 SQL where 中带 tenant_id，并由 middleware/tenant.ts 注入。

export type SqlValue = string | number | bigint | Buffer | null;

export type DbRow = Record<string, SqlValue>;

export interface PreparedStatement {
  /** 执行 INSERT / UPDATE / DELETE，返回受影响行数。 */
  run(params?: SqlValue[] | Record<string, SqlValue>): { changes: number; lastInsertRowid?: bigint | number };
  /** 取第一行。 */
  get<T = DbRow>(params?: SqlValue[] | Record<string, SqlValue>): T | undefined;
  /** 取所有行。 */
  all<T = DbRow>(params?: SqlValue[] | Record<string, SqlValue>): T[];
}

export interface Db {
  /** 准备一条 SQL 语句。占位符随驱动有 `?` 或 `$1`，业务层只用 `?`。 */
  prepare(sql: string): PreparedStatement;
  /** 直接执行（DDL / 多语句）。 */
  exec(sql: string): void;
  /** 事务。回调里同步运行；如要异步，请用 `transactionAsync`。 */
  transaction<T>(fn: () => T): T;
  /** 关闭连接。 */
  close(): void;
  /** 驱动名（"sqlite" / "postgres"），调试用。 */
  driver: string;
}

let _db: Db | null = null;

/** 进程内单例 — 启动时调用 setDb(...)。 */
export function setDb(db: Db) {
  _db = db;
}

export function getDb(): Db {
  if (!_db) throw new Error("[db] not initialized. Call setDb() at boot.");
  return _db;
}

/**
 * 根据 env 选驱动并初始化。Postgres 仍是 placeholder（参考 ./postgres.ts）。
 */
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
    const db = openPostgres(config.db.databaseUrl ?? "");
    setDb(db);
    return db;
  }
  throw new Error(`[db] unknown driver: ${config.db.driver}`);
}
