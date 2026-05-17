// 同舟 · SQLite 适配器（better-sqlite3）
//
// MVP 起步用，零配置本地可跑。
// Postgres 迁移：见 ./postgres.ts 留口；schema.sql 已按可迁移性写。

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

  // 初始化 schema（幂等）
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
    exec(sql: string) {
      handle.exec(sql);
    },
    transaction<T>(fn: () => T): T {
      return handle.transaction(fn)();
    },
    close() {
      handle.close();
    },
  };
}

function adaptStmt(stmt: Statement): PreparedStatement {
  return {
    run(params) {
      const result = params == null
        ? stmt.run()
        : Array.isArray(params)
          ? stmt.run(...(params as SqlValue[]))
          : stmt.run(params);
      return {
        changes: result.changes,
        lastInsertRowid: result.lastInsertRowid,
      };
    },
    get(params) {
      const row = params == null
        ? stmt.get()
        : Array.isArray(params)
          ? stmt.get(...(params as SqlValue[]))
          : stmt.get(params);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return row as any;
    },
    all(params) {
      const rows = params == null
        ? stmt.all()
        : Array.isArray(params)
          ? stmt.all(...(params as SqlValue[]))
          : stmt.all(params);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return rows as any;
    },
  };
}
