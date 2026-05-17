// 同舟 · Postgres 适配器（口子 · 未实现）
//
// 待办：
//   1. 引入 `pg` 或 `postgres` 驱动
//   2. 把 ? 占位符转 $1/$2…（业务 SQL 不变）
//   3. 启用 RLS：每个请求开始时 SET app.tenant_id = ...；schema 加 POLICY
//   4. 迁移 schema.sql 中的类型（详见 schema.sql 头注）

import type { Db } from "./index.js";

export function openPostgres(_connStr: string): Db {
  throw new Error(
    "[db/postgres] not implemented yet. 现在用 DB_DRIVER=sqlite 即可。" +
      " 实现指南见 api/src/db/postgres.ts 头部注释。",
  );
}
