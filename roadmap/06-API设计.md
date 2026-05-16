# 同舟 · API 设计（v0.3）

> 风格：RESTful + 资源化 URL + JSON。复杂场景允许 BFF 聚合。
> 鉴权头：`Authorization: Bearer <session-token>`
> 租户：服务端通过 session 查得，客户端不传 `tenant_id`
> 错误模型统一：`{ error: { code, message, fields? } }`
> **v0.3 变更**：根据 V0 加速起步范围，明确 V0 接口子集（标 🪨）；新增计量上报接口；学员端去掉 OAuth2（V0.5 才加）改为匿名 token + 可选手机号；删除「微信支付下单 API」；新增「第三方付费 Webhook 入站」（V0.5）。

---

## 0. V0 接口子集

> 下文用 🪨 标记 V0 必做；其他为 V0.5 / V1 / V2。

**V0 必做（🪨）接口清单：**

```
# 鉴权
POST /api/v1/auth/login                          创作者邮箱登录
POST /api/v1/auth/signup                         创作者注册（开 Tenant）
GET  /api/v1/auth/me

# 课程
GET/POST/PATCH/DELETE /api/v1/tracks             课程 CRUD
GET/POST/PATCH/DELETE /api/v1/sessions           课时 CRUD（V0 不暴露 Stage）

# 视频
POST /api/v1/videos/upload-credentials           OSS 直传凭证
POST /api/v1/videos                              上传完成回调
POST /api/v1/videos/:id:play-auth                播放凭证
POST /webhooks/vod/:provider                     VOD 转码回调

# 学员
POST /api/v1/tracks/:id/members                  单加学员
POST /api/v1/tracks/:id/members:import           CSV 导入
GET  /api/v1/tracks/:id/members                  课程学员列表 + 观看进度
POST /api/v1/tracks/:id/members:invite-link      生成邀请短链

# 学员端（无登录可访问）
GET  /api/v1/m/invite/:token                     解析邀请短链
POST /api/v1/m/auth/anonymous                    访客身份（cookie token）
POST /api/v1/m/auth/sms/send                     绑定手机号（可选）
POST /api/v1/m/auth/sms/verify
GET  /api/v1/m/tracks/:slug                      课程目录页
GET  /api/v1/m/sessions/:id                      课时详情
POST /api/v1/m/sessions/:id:play-auth            播放凭证（学员侧）
POST /api/v1/m/playback/heartbeat                30 秒心跳

# 计量（V0 核心）
GET  /api/v1/usage/meters                        当月 4 维度用量
GET  /api/v1/usage/invoices                      历史账单
GET  /api/v1/usage/quotas                        当前 Freemium 额度
```

**V0 不做：** 微信 OAuth2、订阅消息、Webhook 入站付费、作业、签到、班级、群运营、AI 接口。

---

## 1. 命名与版本

- Base：`/api/v1`
- 资源复数：`/tracks`、`/cohorts`、`/submissions`
- 子资源用嵌套：`/cohorts/:id/members`
- 动作类用动词后缀：`/submissions/:id:review`（少用）

---

## 2. 鉴权与会话

### 2.1 创作者后台

```
POST /api/v1/auth/login
  body: { email, password }
  resp: { sessionToken, user, tenants: [...] }

POST /api/v1/auth/switch-tenant
  body: { tenantId }
  resp: { sessionToken }    # 重新签发，带 tenant context

GET  /api/v1/auth/me
  resp: { user, currentTenant, role }
```

### 2.2 学员 H5（V0 起）

```
# 🪨 V0：访客模式（无登录可看）
POST /api/v1/m/auth/anonymous
  body: { tenantSlug, inviteToken? }
  resp: { sessionToken, memberAnonymousId, mode: 'anonymous' }
  # 后端发 httpOnly cookie；本地存 memberAnonymousId 用于跨页面识别

# 🪨 V0：可选绑定手机号（跨设备同步进度）
POST /api/v1/m/auth/sms/send
  body: { phone, scene: 'bind' | 'login' }
  resp: { sent: true, cooldownSeconds: 60 }

POST /api/v1/m/auth/sms/verify
  body: { phone, code, tenantSlug, inviteToken?, mergeFromAnonymous?: boolean }
  resp: { sessionToken, member, enrollments: [...] }
  # mergeFromAnonymous=true 时：把当前匿名身份的进度并入手机号身份

# 🪨 V0：解析邀请短链
GET  /api/v1/m/invite/:token
  resp: { tenantSlug, courseSlug, courseTitle, creatorName, status: 'pending'|'consumed' }

# 🟢 V0.5：微信内 OAuth2 静默拿 openid（V0 阶段不实现）
POST /api/v1/m/auth/wechat-oauth
  body: { code, tenantSlug, inviteToken? }
  resp: { sessionToken, member, mergedFromAnonymous?: true }
```

> `m/` 前缀：学员侧接口域，与创作者侧的权限策略不同。
> `inviteToken` 是创作者发出的"入营短链"中携带的签名 token；V0 阶段也用它把"匿名访客"挂到"创作者预录入的 member"上（若存在）。

---

## 3. 资源 API（创作者侧）

### 3.1 Tracks

```
GET    /api/v1/tracks                         列表（带分页 cursor）
POST   /api/v1/tracks                         创建
GET    /api/v1/tracks/:id                     详情
PATCH  /api/v1/tracks/:id                     更新
DELETE /api/v1/tracks/:id                     软删

POST   /api/v1/tracks/:id:publish             发布
POST   /api/v1/tracks/:id:archive             归档

GET    /api/v1/tracks/:id/stages              阶段列表
POST   /api/v1/tracks/:id/stages              新建阶段
PATCH  /api/v1/stages/:id                     更新阶段
DELETE /api/v1/stages/:id

GET    /api/v1/stages/:id/sessions            训练节点列表
POST   /api/v1/stages/:id/sessions            创建训练节点
PATCH  /api/v1/sessions/:id
DELETE /api/v1/sessions/:id

POST   /api/v1/sessions/:id/reorder           批量调序
```

#### 创建 Track 请求 / 响应示例

```http
POST /api/v1/tracks
Content-Type: application/json

{
  "title": "21 天写作训练营",
  "subtitle": "从零开始构建公开写作习惯",
  "coverUrl": "https://...",
  "description": "...",
  "pricing": { "type": "one_off", "amount": 299, "currency": "CNY" }
}
```

```http
HTTP/1.1 201 Created

{
  "id": "01H...uuidv7",
  "title": "21 天写作训练营",
  "status": "draft",
  "createdAt": "2026-05-16T03:21:00Z",
  ...
}
```

### 3.2 Cohorts

```
GET    /api/v1/cohorts
POST   /api/v1/cohorts
GET    /api/v1/cohorts/:id
PATCH  /api/v1/cohorts/:id

POST   /api/v1/cohorts/:id:start              开营
POST   /api/v1/cohorts/:id:archive            结营归档

GET    /api/v1/cohorts/:id/members            学员列表（带筛选/状态）
POST   /api/v1/cohorts/:id/members             单个添加学员（手机号 + 昵称）
POST   /api/v1/cohorts/:id/members:import      CSV 批量导入（返回成功/失败行）
POST   /api/v1/cohorts/:id/members:invite-link 生成入营短链（带 inviteToken）

GET    /api/v1/cohorts/:id/progress           汇总进度
GET    /api/v1/cohorts/:id/report             班级报告

GET    /api/v1/cohorts/:id/submissions        作业列表（创作者批阅）
GET    /api/v1/cohorts/:id/checkins           签到记录

POST   /api/v1/cohorts/:id/group:bind         绑定微信群（半自助）
PATCH  /api/v1/cohorts/:id/group              更新群信息
DELETE /api/v1/cohorts/:id/group
```

### 3.3 Submissions（作业批阅）

```
GET    /api/v1/submissions?cohortId=&status=&page=
GET    /api/v1/submissions/:id

POST   /api/v1/submissions/:id:request-ai-draft     请求 AI 反馈初稿
POST   /api/v1/submissions/:id:review               提交批阅
  body: {
    feedback: { text, mediaIds? },
    isFeatured?: boolean,
    requestRevision?: boolean
  }

POST   /api/v1/submissions/:id:feature              置为精华
POST   /api/v1/submissions/:id:unfeature
```

### 3.4 Content / Videos

```
GET    /api/v1/videos
POST   /api/v1/videos/upload-credentials       拿 OSS 直传凭证
POST   /api/v1/videos                          上传完成回调（注册元数据）
GET    /api/v1/videos/:id
DELETE /api/v1/videos/:id

POST   /api/v1/videos/:id:play-auth            发放播放凭证（带水印参数）
```

#### upload-credentials 示例

```http
POST /api/v1/videos/upload-credentials
{
  "filename": "day-1.mp4",
  "sizeBytes": 1234567
}
```

```http
HTTP/1.1 200 OK
{
  "uploadUrl": "https://...oss...",
  "method": "PUT",
  "headers": { "...": "..." },
  "key": "tenants/abc/videos/01H..../day-1.mp4",
  "expiresAt": "2026-05-16T03:36:00Z"
}
```

### 3.5 Community / 群运营助手

```
GET    /api/v1/groups                          已绑定的微信群
POST   /api/v1/groups
PATCH  /api/v1/groups/:id

POST   /api/v1/assistant/today-broadcast       生成今日开营文案
  body: { cohortId, sessionId }
  resp: { copy: "..." }

POST   /api/v1/assistant/extract-highlights    粘贴聊天记录 → 精华
  body: { cohortId, rawText }
  resp: {
    highlights: [{ text, attribution? }],
    questions: [...],
    followUpMembers: [...]
  }

POST   /api/v1/assistant/missing-checkins      未签到 @ 名单文案
  body: { cohortId, date }
  resp: { mentionText: "..." , members: [...] }

GET    /api/v1/faq                             FAQ 列表
POST   /api/v1/faq                             新增（AI 生成可标记 source）
PATCH  /api/v1/faq/:id
```

### 3.5 计量与 Freemium（V0 核心）

```
# 🪨 V0：当月 4 维度用量
GET  /api/v1/usage/meters
  query: ?period=2026-05      # 默认当月
  resp: {
    period: "2026-05",
    meters: [
      {
        metric_key: "members.active_count",
        current_value: 12,
        free_quota: 30,
        billable_value: 0,
        unit: "人",
        percent_used: 0.4
      },
      {
        metric_key: "courses.count",
        current_value: 2,
        free_quota: 5,
        billable_value: 0,
        unit: "门",
        percent_used: 0.4
      },
      {
        metric_key: "storage.bytes",
        current_value: 1234567890,
        free_quota: 2147483648,
        billable_value: 0,
        unit: "GB·月",
        percent_used: 0.57
      },
      {
        metric_key: "playback.minutes",
        current_value: 432,
        free_quota: 3000,
        billable_value: 0,
        unit: "分钟",
        percent_used: 0.14
      }
    ],
    status: "healthy" | "warning" | "over_quota_soft" | "over_quota_hard"
  }

# 🪨 V0：历史账单
GET  /api/v1/usage/invoices
  query: ?status=&limit=&cursor=
  resp: { data: [{period, status, total_amount, lines}], pageInfo }

# 🪨 V0：当前 Freemium 额度（只读）
GET  /api/v1/usage/quotas
  resp: {
    plan: "free",
    quotas: { ... 见 02 §3.5 schema }
  }

# 🪨 V0：升级占位接口（V0 仅返回引导信息，V0.5 后接真实计费）
POST /api/v1/usage/upgrade:enquiry
  body: { contact, message? }
  resp: { ticketId, expectedReplyHours: 24 }
```

### 3.6 Settings / Brand / Billing

```
GET    /api/v1/tenant/me                       当前 Tenant 元数据
PATCH  /api/v1/tenant/me                       更新 brand / settings

GET    /api/v1/team                            成员
POST   /api/v1/team:invite

GET    /api/v1/billing/subscription
POST   /api/v1/billing/checkout                跳支付
GET    /api/v1/billing/invoices

GET    /api/v1/wechat/apps                     已绑定的公众号
POST   /api/v1/wechat/apps:authorize-url       生成授权链接（V1 自有公众号授权）
GET    /api/v1/wechat/apps/:id
DELETE /api/v1/wechat/apps/:id

# 第三方付费工具绑定（C 路线核心）
GET    /api/v1/payment-providers               已接入的第三方付费
POST   /api/v1/payment-providers               接入新付费源
  body: { provider: 'xiaobaotong'|'xingqiu'|'youzan', credentials: {...} }
DELETE /api/v1/payment-providers/:id
POST   /api/v1/payment-providers/:id:test      测试 Webhook
```

---

## 4. 学员侧 API（`/api/v1/m`）

```
# 🪨 V0
GET  /api/v1/m/me                             我的概览（匿名/手机号身份）
GET  /api/v1/m/tracks/:slug                   课程目录页（创作者品牌 + 课时列表）
GET  /api/v1/m/sessions/:id                   课时详情
POST /api/v1/m/sessions/:id:play-auth         播放凭证（带学员水印）
POST /api/v1/m/playback/heartbeat             30 秒心跳：上报观看时长（同时计入 usage_events）
  body: { sessionId, secondsWatched, position }
  resp: { ok: true }

# 🟡 V1+
GET  /api/v1/m/today                          今日页（聚合接口）
GET  /api/v1/m/tracks/:id                     我加入的某条路径（完整视图）
POST /api/v1/m/sessions/:id/checkin           签到（同时返回 streak）

GET  /api/v1/m/submissions?sessionId=         我的某节点提交
POST /api/v1/m/submissions                    新提交
PATCH /api/v1/m/submissions/:id               草稿编辑（status=draft）
POST /api/v1/m/submissions/:id:submit         提交

GET  /api/v1/m/cohorts/:id/wall               班级动态（打卡墙）
POST /api/v1/m/submissions/:id:like           点赞同伴作业

GET  /api/v1/m/profile                        个人档案
PATCH /api/v1/m/profile                       昵称 / 头像

POST /api/v1/m/notifications/subscribe-url    返回公众号订阅消息授权链接
GET  /api/v1/m/notifications/quota             查询我当前的订阅消息可发次数
```

### 4.1 "今日" 聚合接口示例

```http
GET /api/v1/m/today

{
  "date": "2026-05-16",
  "todayIndex": 7,              // Day 7
  "session": {
    "id": "01H...",
    "title": "Day 7：用故事代替道理",
    "video": { "id": "...", "duration": 312 },
    "materials": [ ... ],
    "assignment": { "type": "text", "prompt": "..." }
  },
  "tasks": [
    { "kind": "checkin", "done": false },
    { "kind": "submission", "done": false }
  ],
  "streak": 6,
  "cohort": { "id": "...", "name": "第 1 期" }
}
```

---

## 5. Webhook / 回调

### 5.1 接收（微信、第三方付费、视频转码）

```
POST /webhooks/wechat/mp/:tenantId                公众号事件（关注 / 取关 / 客服消息）
POST /webhooks/payment/:provider/:tenantId        第三方付费回调（小报童/星球/有赞）
POST /webhooks/vod/:provider                      视频转码回调
```

> **注意（C 路线）**：不再有 `wechat-pay` 回调；学员入站统一走 `/webhooks/payment/:provider` 抽象层。每个 provider 在 `ingress` 模块里实现验签和字段映射。

> 所有 webhook 走签名校验 → 入 outbox → 异步处理。同步只返回 ACK。

### 5.2 外发（开放 API，V2）

```
POST <creator-configured-url>
  Headers:
    X-Tongzhou-Event: submission.reviewed
    X-Tongzhou-Signature: HMAC-SHA256(secret, body)
  Body:
    { event, tenantId, occurredAt, data }
```

事件清单（首期 6 类）：

```
member.enrolled
member.checkin
session.opened
submission.created
submission.reviewed
cohort.completed
```

---

## 6. 列表接口规范

- 分页：`?cursor=<opaque>&limit=20`（cursor 内部编码 created_at + id）
- 过滤：URL query，禁止 `?filter[xxx]=` 类嵌套
- 排序：`?sort=-createdAt`（前导 `-` 表降序）
- 响应：

```json
{
  "data": [...],
  "pageInfo": {
    "nextCursor": "...",
    "hasMore": true
  }
}
```

---

## 7. 错误模型

```json
{
  "error": {
    "code": "submission.already_reviewed",
    "message": "该作业已被批阅",
    "fields": {
      "submissionId": "01H..."
    },
    "traceId": "..."
  }
}
```

错误码命名空间：

- `auth.*` 鉴权
- `tenant.*` 租户
- `track.*` `cohort.*` `submission.*` 业务领域
- `wechat.*` 微信交互
- `internal.*` 系统级（统一 500，避免泄漏）

HTTP 状态使用：

- `400` 参数 / 业务规则违例
- `401` 未登录
- `403` 已登录但越权
- `404` 资源不存在或不属于当前 Tenant
- `409` 状态机冲突
- `422` 校验失败
- `429` 限流
- `5xx` 内部错误

---

## 8. 性能、缓存与幂等

- **缓存：** `GET /today`、`GET /cohorts/:id/wall` 走 Redis 短缓存（30-60s）+ 写入时主动失效
- **限流：** 按 (tenant_id, user_id) + IP 双维度
- **幂等：** 写接口支持 `Idempotency-Key` 头，5 分钟去重
- **批量：** 列表接口避免 N+1，关联资源以 ID 列表回填，前端再批量请求

---

## 9. 安全要点

- 所有写接口要求 CSRF token（H5 后台）
- 学员小程序 token 14 天过期，可静默 refresh
- 文件上传走 OSS 直传，禁止后端中转大文件
- 接口层 schema 校验（Zod / Valibot），失败直接 422

---

## 10. OpenAPI

- MVP 期间手写 OpenAPI 3.1 yaml（不用 Swagger UI 暴露给 Tenant）
- 内部 API Explorer：放在 `app.tongzhou.app/internal/api-docs`
- V1 后逐步开放部分给创作者，作为开放 API
