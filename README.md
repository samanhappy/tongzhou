# 同舟

同舟是一个面向内容创作者的轻量课程交付 MVP，仓库包含：

- `app/`：Next.js 15 前端（创作者后台 + 学员 H5）
- `api/`：Fastify 5 后端（认证、多租户、课程、学员、计量、上传）
- `roadmap/`：产品、信息架构、数据模型、API 与阶段范围文档
- `design/`：一次性设计稿快照，不是运行时代码

## 仓库结构

```text
.
├── app/        # Next.js 前端
├── api/        # Fastify 后端
├── roadmap/    # PRD / IA / API / 数据模型 / 路线图
├── design/     # 设计稿快照
└── .github/    # CI 工作流
```

## 本地启动

### 只跑前端（mock 数据）

```bash
cd app
npm install
npm run dev
```

默认访问：`http://localhost:4173`

### 跑前后端联调

```bash
cd api
npm install
npm run seed
npm run dev

cd ../app
npm install
API_BASE=http://localhost:4100 TENANT_SLUG=xingchunge npm run dev
```

## 质量检查

### 前端

```bash
cd app
npm run lint
npm run format:check
npm run typecheck
npm run test:e2e -- --project=chromium
```

### 后端

```bash
cd api
npm run lint
npm run format:check
npm run typecheck
npm test
```

## 重要约束

- `app/` 和 `api/` 是两个独立 npm 项目，不使用 monorepo 工具。
- 前端页面读取数据统一走 `app/lib/source.ts`。
- `design/` 仅为设计参考，真实 UI 改动应在 `app/`。
- 多租户隔离依赖双层防线：应用层 `tenant_id` 过滤 + Postgres RLS。

更详细的工程约束请看 `AGENTS.md`，产品与架构背景请从 `roadmap/README.md` 开始。
