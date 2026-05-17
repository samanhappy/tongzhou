// 同舟 · SQLite 适配器（better-sqlite3）
//
// better-sqlite3 是同步的；接口对外是 async,我们用 Promise.resolve() 包一下。
// MVP 起步用,零配置本地可跑。
// 切 Postgres：DB_DRIVER=postgres + 跑 schema.postgres.sql

import fs from "node:fs";
import path from "node:path";
import BetterSqlite3, { type Database, type Statement } from "better-sqlite3";
import type { Db, PreparedStatement, SqlValue } from "./index.js";

const SCHEMA_PATH = new URL("./schema.sql", import.meta.url);

export function openSqlite(filePath: string): Db {
  const abs = path.resolve(filePath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const handle = new BetterSqlite3(abs);
  handle.pragma("journal_mode = WAL");
  handle.pragma("foreign_keys = ON");

  const sql = fs.readFileSync(SCHEMA_PATH, "utf8");
  handle.exec(sql);

  return wrap(handle);
}

function wrap(handle: Database): Db {
  return {
    driver: "sqlite",
    prepare(sql: string): PreparedStatement {
      const stmt = handle.prepare(sql);
      return adaptStmt(stmt);
    },
    async exec(sql: string) {
      handle.exec(sql);
    },
    async transaction<T>(fn: () => Promise<T>): Promise<T> {
      // better-sqlite3.transaction 接受同步 fn；我们的 fn 是 async,
      // 不能直接套。手动 BEGIN/COMMIT/ROLLBACK,同步语义靠 SQLite 单线程保证。
      handle.exec("BEGIN");
      try {
        const r = await fn();
        handle.exec("COMMIT");
        return r;
      } catch (e) {
        handle.exec("ROLLBACK");
        throw e;
      }
    },
    async close() {
      handle.close();
    },
  };
}

function adaptStmt(stmt: Statement): PreparedStatement {
  return {
    async run(params) {
      const result = params == null ? stmt.run() : stmt.run(...(params as SqlValue[]));
      return { changes: result.changes };
    },
    async get(params) {
      const row = params == null ? stmt.get() : stmt.get(...(params as SqlValue[]));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return row as any;
    },
    async all(params) {
      const rows = params == null ? stmt.all() : stmt.all(...(params as SqlValue[]));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return rows as any;
    },
  };
}
