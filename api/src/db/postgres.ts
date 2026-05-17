// 同舟 · Postgres 适配器（带 RLS 支持）
//
// 设计要点：
// 1. 占位符兼容：repo 用 `?`,这里转 `$1, $2, …`
// 2. 单 Pool；每请求按需 checkout 一个 client 用于 RLS 事务（见 startRequestScope）
// 3. RLS 在 schema.postgres.sql 启用；
//    每请求 BEGIN + `SELECT set_config('app.tenant_id', :id, true)`,
//    COMMIT/ROLLBACK 在 onResponse；
//    repo 调用 prepare() 时,若 ALS 里有 client → 用 client.query；否则 → pool.query
// 4. 默认 pool 路径只用于：tenants 注册、healthz、初始化 — 这些表无 RLS 或本身就是 RLS 主体
// 5. 事务 fn 是 async；PG 用 SAVEPOINT(因 outer tx 已存在)
//
// schema 启动加载：openPostgres 时执行一次 schema.postgres.sql（IF NOT EXISTS）

import fs from "node:fs";
import {
  Pool,
  type PoolClient,
  type QueryResult,
  type QueryResultRow,
} from "pg";
import {
  currentScope,
  type Db,
  type PreparedStatement,
  requestScope,
  type SqlValue,
} from "./index.js";

const SCHEMA_PATH = fileURL("./schema.postgres.sql");

function fileURL(rel: string) {
  return new URL(rel, import.meta.url);
}

export async function openPostgres(opts: {
  connectionString: string;
}): Promise<Db> {
  if (!opts.connectionString) {
    throw new Error("[db/postgres] DATABASE_URL is required");
  }
  const pool = new Pool({
    connectionString: opts.connectionString,
    // 合理默认；生产可调
    max: 16,
    idleTimeoutMillis: 30_000,
    application_name: "tongzhou-api",
  });

  // 启动连接性自检
  const probe = await pool.connect();
  try {
    await probe.query("SELECT 1");
  } finally {
    probe.release();
  }

  // 加载 schema(幂等)
  const sql = fs.readFileSync(SCHEMA_PATH, "utf8");
  await pool.query(sql);

  return wrap(pool);
}

// 仅给 server.ts 用于 onRequest / onResponse 钩子
export async function checkoutClient(pool: Pool): Promise<PoolClient> {
  return pool.connect();
}

// ─────────────────────────────────────────────
// 实现
// ─────────────────────────────────────────────

function wrap(pool: Pool): Db & { __pool: Pool } {
  return {
    driver: "postgres",
    __pool: pool, // server.ts 需要拿 pool 在 hook 里 checkout
    prepare(sql: string): PreparedStatement {
      const converted = convertPlaceholders(sql);
      return makeStmt(pool, converted);
    },
    async exec(sql: string) {
      // 多语句 DDL；不转 ? 占位符
      const c = await pickClient(pool);
      try {
        await c.exec.query(sql);
      } finally {
        c.release();
      }
    },
    async transaction<T>(fn: () => Promise<T>): Promise<T> {
      // PG 模式下,大概率已经在外层 RLS 事务里 → 用 SAVEPOINT
      const scope = currentScope();
      if (scope?.client) {
        const client = scope.client as PoolClient;
        const sp = `tz_sp_${Math.random().toString(36).slice(2, 8)}`;
        await client.query(`SAVEPOINT ${sp}`);
        try {
          const r = await fn();
          await client.query(`RELEASE SAVEPOINT ${sp}`);
          return r;
        } catch (e) {
          await client.query(`ROLLBACK TO SAVEPOINT ${sp}`);
          throw e;
        }
      }
      // 无 scope:开一个独立事务
      const c = await pool.connect();
      try {
        await c.query("BEGIN");
        const r = await requestScope.run({ client: c }, async () => fn());
        await c.query("COMMIT");
        return r;
      } catch (e) {
        await c.query("ROLLBACK");
        throw e;
      } finally {
        c.release();
      }
    },
    async close() {
      await pool.end();
    },
  };
}

function makeStmt(pool: Pool, sql: string): PreparedStatement {
  async function exec<R extends QueryResultRow = QueryResultRow>(
    params: SqlValue[] | undefined,
  ): Promise<QueryResult<R>> {
    const scope = currentScope();
    if (scope?.client) {
      // RLS 事务路径：复用 scope.client
      return (scope.client as PoolClient).query<R>(sql, params as unknown[]);
    }
    // 默认 pool（无 RLS 上下文 — 仅 tenants/healthz 用）
    return pool.query<R>(sql, params as unknown[]);
  }

  return {
    async run(params) {
      const r = await exec(params);
      return { changes: r.rowCount ?? 0 };
    },
    async get<T = unknown>(params?: SqlValue[]) {
      const r = await exec<QueryResultRow>(params);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return r.rows[0] as any as T | undefined;
    },
    async all<T = unknown>(params?: SqlValue[]) {
      const r = await exec<QueryResultRow>(params);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return r.rows as any as T[];
    },
  };
}

// ─────────────────────────────────────────────
// 工具
// ─────────────────────────────────────────────

/** 把 `?` 占位符按出现顺序转为 `$1, $2, …`。
 *  注意：业务 SQL 不在字符串字面量里出现 `?`(我们的 repo 都没用),所以朴素替换 OK。
 */
export function convertPlaceholders(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function pickClient(
  pool: Pool,
): Promise<{ exec: PoolClient; release: () => void }> {
  const scope = currentScope();
  if (scope?.client) {
    return { exec: scope.client as PoolClient, release: () => {} };
  }
  const c = await pool.connect();
  return { exec: c, release: () => c.release() };
}

/**
 * 暴露给 server.ts 的 hook：
 * - onRequest: 进入请求生命周期,创建 ALS scope(空 client)
 * - preHandler: 拿到 tenant 后,checkout client + BEGIN + SET LOCAL
 * - onResponse: COMMIT/ROLLBACK + release
 *
 * 用法见 src/server.ts。
 */
export const pgHooks = {
  async attachClient(
    pool: Pool,
    scope: { client?: unknown; tenantId?: string },
    tenantId: string | undefined,
  ): Promise<void> {
    const c = await pool.connect();
    try {
      await c.query("BEGIN");
      if (tenantId) {
        // set_config(..., true) 表示 LOCAL — 仅当前事务生效
        await c.query(`SELECT set_config('app.tenant_id', $1, true)`, [
          tenantId,
        ]);
      }
      scope.client = c;
      scope.tenantId = tenantId;
    } catch (e) {
      c.release();
      throw e;
    }
  },

  async finishClient(
    scope: { client?: unknown; tenantId?: string },
    ok: boolean,
  ): Promise<void> {
    if (!scope.client) return;
    const c = scope.client as PoolClient;
    try {
      await c.query(ok ? "COMMIT" : "ROLLBACK");
    } finally {
      c.release();
      scope.client = undefined;
    }
  },
};
