# AGENTS.md · 同舟

> 给写代码的 AI agent 的工程契约。人类入门看 [`roadmap/README.md`](./roadmap/README.md)。

## 0. 仓库长什么样

四个目录,各有清楚的职责,**不要混淆**:

| 目录 | 性质 | 你能动吗? |
|---|---|---|
| [`roadmap/`](./roadmap/) | 产品 / 架构设计文档(Markdown)— **唯一权威需求来源** | 仅在 PRD 或路线图变更时改;改之前问用户 |
| [`design/`](./design/) | 一次性 React/JSX 设计稿,浏览器 Babel 直跑 — **不是运行时代码** | **不要改**。要改 UI 改 `app/`,这里只是设计稿快照 |
| [`app/`](./app/) | Next.js 15 前端(App Router + React 19 + TS)| 是 |
| [`api/`](./api/) | Fastify 5 后端(TS + ESM) | 是 |

根目录还有 [`docker-compose.yml`](./docker-compose.yml)(本地 Postgres)。**没有** monorepo 工具(pnpm/turbo),`app/` 和 `api/` 是两个独立 npm 项目,各自 `npm install`。

## 1. 跑起来

```bash
# 前端 only(mock 数据,零依赖)
cd app && npm install && npm run dev          # → http://localhost:4173

# 前后端连通
cd api && npm install && npm run seed && npm run dev      # → http://localhost:4100
cd app && API_BASE=http://localhost:4100 TENANT_SLUG=xingchunge npm run dev

# 切 Postgres + RLS
docker compose up -d postgres
# 改 api/.env.local: DB_DRIVER=postgres + DATABASE_URL=postgres://tongzhou:tongzhou@localhost:5432/tongzhou
cd api && npm run seed && npm run dev
```

页面入口路径见根 `/`(就是个 demo 导航)。

## 2. 质量门(commit / PR 前必跑)

两个项目都要过:

```bash
cd app && npx tsc --noEmit       # 必须 0 errors
cd api && npm run typecheck      # 必须 0 errors
```

**没有自动化测试**(MVP 阶段只有 HTTP 烟测)。新加复杂逻辑请补 unit / integration test 再交。

提交规范:遵循已有 commit 风格(看 `git log`)。当前没有 commit lint;别破例写"WIP"或全大写。

## 3. 前端架构契约

### 3.1 数据源单一入口

所有页面拿数据**必须**走 [`app/lib/source.ts`](./app/lib/source.ts):

```ts
// ✅ 对的
import { getDashboardData } from "@/lib/source";
const data = await getDashboardData();

// ❌ 错的 — 绕过了 mock/api 切换
import { dashboardStats } from "@/lib/mock";
```

`source.ts` 自动按 `process.env.API_BASE` 切换:有 → 调真后端([`lib/api.ts`](./app/lib/api.ts));无 → 落回 [`lib/mock.ts`](./app/lib/mock.ts)。新加页面时**两条路径都要实现**,API 模式不能从 mock 里偷字段。

### 3.2 设计 token 来自一处

颜色、字体、圆角、阴影都来自 [`app/app/globals.css`](./app/app/globals.css) 里的 CSS 变量(`--paper / --ink / --accent / --serif / --r-md / --shadow-1`)。

- **不要**引入 Tailwind / styled-components / CSS Modules — 现有页面用 inline `style={{...}}` + 共享原子组件,保持一致
- **不要**硬编码颜色 hex(`#1a4d4a` 之类只在主题选项数组里出现,且只是预览)
- 新原子组件放 [`app/components/`](./app/components/),不要塞到 page 里

### 3.3 路由结构

```
app/app/
├── page.tsx                   # / — demo 导航
├── onboarding/                # 30 分钟创作者链路
├── app/                       # 创作者后台(注意:嵌套 app/ 是有意的 — Next.js 路由分组)
│   ├── dashboard/  tracks/  members/  usage/  settings/  library/
└── x/[slug]/                  # 学员 H5(slug 是 tenant slug)
    ├── page.tsx               # 落地页
    ├── play/[lessonId]/       # 播放页(含手机号水印 — V0 红线)
    └── me/                    # 我的
```

新加路由前先看 [`roadmap/01-信息架构.md`](./roadmap/01-信息架构.md),别凭感觉加 Tab。

### 3.4 Server Components 优先

页面默认是 Server Component,只在需要交互时用 `"use client"`。当前只有两个 client 组件:[`tracks/[id]/client.tsx`](./app/app/app/tracks/[id]/client.tsx)(拖拽 + 上传进度)和 [`onboarding/client.tsx`](./app/app/onboarding/client.tsx)(向导状态机)。**别滥用 use client。**

## 4. 后端架构契约

### 4.1 Port-and-Adapter

四个 facade,业务代码**只**依赖接口,不依赖具体驱动:

| Facade | 文件 | 默认 (MVP) | 生产 |
|---|---|---|---|
| `Db` | [`api/src/db/index.ts`](./api/src/db/index.ts) | `sqlite` | `postgres` (含 RLS) |
| `Cache` | [`api/src/cache/index.ts`](./api/src/cache/index.ts) | `memory` | `redis`(口子) |
| `Storage` | [`api/src/storage/index.ts`](./api/src/storage/index.ts) | `local`(磁盘) | `tencent-cos` |
| `Video` | [`api/src/video/index.ts`](./api/src/video/index.ts) | `local`(桥接 Storage) | `tencent-vod`(6h playAuth) |

**规则**:
- 业务代码 `import { getDb } from "@/db"`,**不要** `import "@/db/sqlite"` 直接拿驱动
- 加新功能默认从接口出发;真的需要新增驱动方法就改接口,所有实现一起加
- 写完新驱动**必须**保留旧驱动可跑(双模式存活)
- 不能写 placeholder 留 `throw new Error("not implemented")`(除非接口里已有该方法的口子语义)

### 4.2 多租户两道防线 — 不可妥协

1. **应用层**:repo 的每条 SQL **必须**带 `WHERE tenant_id = ?`(`tenants` 表自身除外)
   - 新加 repo 函数:第一参数永远是 `tenantId: string`
   - 不要写裸 SQL 直接放 routes;走 repo
2. **数据层**(仅 PG 模式):`schema.postgres.sql` 启用 RLS,每张表 `USING (tenant_id = current_setting('app.tenant_id')::uuid)`
   - 中间件 [`middleware/tenant.ts`](./api/src/middleware/tenant.ts) 在请求开始时 `SET LOCAL app.tenant_id`,结束时 `COMMIT/ROLLBACK`

任何一层失守,另一层兜底。**改 repo / 改 middleware 之前先理解这两层。**

### 4.3 Repo 接口规则

```ts
// ✅ 对的
export async function listByTenant(tenantId: string): Promise<Track[]> {
  return getDb()
    .prepare(`SELECT * FROM tracks WHERE tenant_id = ? ORDER BY position`)
    .all<Track>([tenantId]);
}

// ❌ 错的 — 没带 tenantId 过滤
export async function getById(id: string) {
  return getDb().prepare(`SELECT * FROM tracks WHERE id = ?`).get([id]);
}
```

所有 prepare 用 `?` 占位符,**不要**用 `$1` 或命名占位符 — PG 适配器自动转。

### 4.4 Async 全链路

`Db.prepare` 返回的 `run/get/all` **全部** `Promise`。改老 repo 之后忘 `await` 是最常见 bug — 跑 `tsc` 不会全抓到(`Promise<X>` 给 `X` 形参会报,但 `Promise<X>.then(...)` 不会)。提交前肉眼扫一遍 `repo.` 调用。

### 4.5 模块化单体结构

```
api/src/modules/<name>/
├── repo.ts       # 仅 SQL + 业务无关数据转换
├── routes.ts     # Fastify 路由 + 入参校验 + 调 repo
└── (service.ts)  # 跨 repo 的协作逻辑(目前还没有,V1 起会有)
```

加新模块就开新目录,在 [`server.ts`](./api/src/server.ts) 注册一次。**不要**把模块之间的代码互相 import 业务函数;只跨 repo `import` 是允许的(例:lessons 调 tracks.recomputeStats 更新派生字段)。

## 5. 计量(roadmap 的灵魂)

4 个 metric_key,写死在代码里、不可改名:

```
members.active_count   ← 月活去重
courses.count          ← published 课程数
storage.bytes          ← 上传字节 / 1024^3 (GB)
playback.minutes       ← 心跳累加
```

实现在 [`api/src/modules/usage/repo.ts`](./api/src/modules/usage/repo.ts)。加新维度需先改 [`roadmap/07-V0范围与计量模型.md`](./roadmap/07-V0范围与计量模型.md)。

## 6. 不可越线的红线

| 红线 | 来源 | 含义 |
|---|---|---|
| **学员看视频不被中断** | [`07 §5`](./roadmap/07-V0范围与计量模型.md) | 即使创作者超额,已发布内容必须可播。超额降级只能影响创作者侧(上传/加学员置灰),不能动学员观看路径 |
| **同舟不收钱** | [`00 §6`](./roadmap/00-PRD.md) | 不接入支付商户号、不做商城/SKU。创作者用小报童 / 知识星球收钱 |
| **多租户隔离** | 见 §4.2 | tenant_id WHERE + PG RLS 双保险 |
| **视频水印** | [`student-h5.jsx` `H5Player`](./design/student-h5.jsx) | 播放页必须叠手机号水印(`<WatermarkLayer text={...} />`),不可移除 |
| **0 资质起步** | [`07 §1`](./roadmap/07-V0范围与计量模型.md) | 创作者注册不需要公众号 / 商户号。Onboarding 5 步内必须能拿到分享链接 |

## 7. 环境变量

`api/.env.local` (gitignored)。模板见 [`.env.example`](./api/.env.example)。最小可跑只需要默认 sqlite + local。

前端 `app/`:服务端读 `API_BASE` 和 `TENANT_SLUG`(无 `NEXT_PUBLIC_` 前缀),所以**只**在 Server Component / Server Action 里有效。

## 8. 常见任务怎么做

| 任务 | 第一步去哪 |
|---|---|
| 加一个创作者后台新页面 | `app/app/app/<name>/page.tsx` + 在 `lib/source.ts` 加 `getXxxData()` |
| 加一个 API 接口 | `api/src/modules/<existing or new>/routes.ts` |
| 加新数据表 | 同时改 `api/src/db/schema.sql`(SQLite)和 `api/src/db/schema.postgres.sql`(PG + RLS 策略),都要 IF NOT EXISTS |
| 加新计量维度 | 先改 [`roadmap/07`](./roadmap/07-V0范围与计量模型.md) → 再改 [`usage/repo.ts`](./api/src/modules/usage/repo.ts) 的 `METRIC_META` 和 `DEFAULT_QUOTAS` |
| 切真生产存储 | `STORAGE_DRIVER=tencent-cos` + 设 `COS_*`,业务代码零改动 |
| 上 6h playAuth | `VIDEO_DRIVER=tencent-vod` + 设 `VOD_*` + 控制台开 Key 防盗链 |

## 9. 不要做的事

- 不要把数据库连接信息 hardcode 到代码里(用 `env.ts`)
- 不要在前端读取 `process.env.NEXT_PUBLIC_*` 暴露后端 url —— 用 `API_BASE`(服务端)
- 不要给 `roadmap/` 里随便加新文档 —— 编号是固定的,新文档先和用户对齐
- 不要在没有 `.env.local` 时跑 `npm run seed` 期望它"自己有默认值"(它会,但你应该看一眼用的是什么)
- 不要把 `data/`(SQLite 文件)或 `uploads/`(本地视频)提交进 git(`.gitignore` 已挡)
- 不要重命名 metric key、tenant_id 列名、route path —— 前端 / 文档 / 测试有耦合
- 不要在不读 [`roadmap/07-V0范围与计量模型.md`](./roadmap/07-V0范围与计量模型.md) 的情况下加 / 改 quota 相关字段

## 10. 进阶约定

- **ID 格式**:全部 ULID-ish(26 char Crockford32 + 类型前缀,如 `trk_`、`les_`、`mem_`),工厂在 [`api/src/lib/id.ts`](./api/src/lib/id.ts)
- **时间戳**:DB 列存 epoch ms(`BIGINT`),展示层转字符串。**不要** 在表里存 ISO 字符串
- **错误处理**:后端抛 `HttpError(status, msg)`(`api/src/middleware/error.ts`),不要直接 `reply.code(500)`
- **日志**:用 `req.log.info(...)`(Fastify 内置),不要 `console.log` 进生产
- **路径别名**:`@/*` 在两个项目都指向自己的根(`app/` 或 `api/`)
- **ESM**:两个项目都是 `"type": "module"`,import 路径写 `.js` 后缀(TS 编译后是 .js)

## 11. 文档读取顺序

新 agent 上手按这个顺序读 30 分钟内能掌握全貌:

1. 本文件(你正在看)— 工程约束
2. [`roadmap/README.md`](./roadmap/README.md) — 5 分钟入门
3. [`roadmap/07-V0范围与计量模型.md`](./roadmap/07-V0范围与计量模型.md) — 当前阶段边界(最重要)
4. [`roadmap/01-信息架构.md`](./roadmap/01-信息架构.md) — 页面有哪些
5. [`roadmap/06-API设计.md`](./roadmap/06-API设计.md) — 接口契约
6. 看代码:[`api/src/modules/tracks/repo.ts`](./api/src/modules/tracks/repo.ts) + [`api/src/modules/tracks/routes.ts`](./api/src/modules/tracks/routes.ts) 是标准模块样本

读完这些再开始动代码。
