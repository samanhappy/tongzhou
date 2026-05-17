-- 同舟 V0 · 共享 schema
-- 适用于 SQLite（MVP）；Postgres 迁移时需调：
--   1. uuid 改为 uuid 类型 + 默认 gen_random_uuid()
--   2. INTEGER 时间戳改为 timestamptz
--   3. JSON 改为 jsonb
--   4. 启用 RLS：CREATE POLICY ... USING (tenant_id = current_setting('app.tenant_id')::uuid)
-- 参考 roadmap/02-数据模型.md §3 / §3.5

-- ──────────────────────────────────────────────
-- 1. 多租户
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tenants (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,           -- xingchunge
  name          TEXT NOT NULL,                  -- 醒春阁
  tagline       TEXT NOT NULL DEFAULT '',
  theme_hue     INTEGER NOT NULL DEFAULT 162,
  group_link    TEXT NOT NULL DEFAULT '',
  plan          TEXT NOT NULL DEFAULT 'free',   -- free | pro | custom
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

-- 创作者账号（V0 邮箱登录）
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  password_hash TEXT,                            -- V0 占位
  role          TEXT NOT NULL DEFAULT 'owner',   -- owner | coach (V1)
  created_at    INTEGER NOT NULL,
  UNIQUE (tenant_id, email)
);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ──────────────────────────────────────────────
-- 2. 课程结构（V0：Track + Lesson；Stage / Cohort 仅占位）
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tracks (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  slug                TEXT NOT NULL,
  title               TEXT NOT NULL,
  subtitle            TEXT NOT NULL DEFAULT '',
  one_line            TEXT NOT NULL DEFAULT '',
  cover_url           TEXT,
  status              TEXT NOT NULL DEFAULT 'draft',  -- draft | published | archived
  total_minutes       INTEGER NOT NULL DEFAULT 0,     -- 派生：发布课时秒数 / 60
  cumulative_viewers  INTEGER NOT NULL DEFAULT 0,     -- 派生
  completion_rate     INTEGER NOT NULL DEFAULT 0,     -- 派生 0-100
  position            INTEGER NOT NULL DEFAULT 0,
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL,
  UNIQUE (tenant_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_tracks_tenant ON tracks(tenant_id);

-- 课时（= Session）。V0 直挂在 Track 下；V1 起会插入 Stage 层
CREATE TABLE IF NOT EXISTS lessons (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  track_id            TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  summary             TEXT NOT NULL DEFAULT '',
  position            INTEGER NOT NULL DEFAULT 0,
  duration_sec        INTEGER,                         -- 已发布课时
  duration_text       TEXT NOT NULL DEFAULT '—',       -- 08:24
  video_id            TEXT REFERENCES uploads(id),
  status              TEXT NOT NULL DEFAULT 'draft',   -- draft | uploading | transcoding | published | failed
  views               INTEGER NOT NULL DEFAULT 0,
  progress            INTEGER,                          -- 0-100 上传/转码进度
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lessons_tenant_track ON lessons(tenant_id, track_id, position);

-- ──────────────────────────────────────────────
-- 3. 学员（V0 匿名 token 默认；可选手机号绑定）
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS members (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name                TEXT NOT NULL DEFAULT '—',
  phone               TEXT NOT NULL DEFAULT '—',
  source              TEXT NOT NULL DEFAULT '单加',      -- 单加 / CSV · 知识星球 / 邀请短链
  bound               INTEGER NOT NULL DEFAULT 0,       -- bool 0/1
  anonymous           INTEGER NOT NULL DEFAULT 0,
  joined_at           TEXT NOT NULL DEFAULT '',         -- 显示用 5/02
  last_active         TEXT NOT NULL DEFAULT '',
  course_count        INTEGER NOT NULL DEFAULT 0,
  playback_minutes    INTEGER NOT NULL DEFAULT 0,
  -- 学员侧微信绑定(V0.5 公众号网页授权)
  wechat_openid       TEXT,
  wechat_unionid      TEXT,
  wechat_nickname     TEXT,
  wechat_avatar       TEXT,
  bound_at            INTEGER,
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_members_tenant ON members(tenant_id);
-- 同 tenant 下 openid 唯一；NULL 不参与索引
CREATE UNIQUE INDEX IF NOT EXISTS uq_members_openid
  ON members(tenant_id, wechat_openid) WHERE wechat_openid IS NOT NULL;

-- 学员邀请链接(创作者侧生成,带学员去微信授权后绑定 openid)
CREATE TABLE IF NOT EXISTS member_invites (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  member_id     TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  token         TEXT NOT NULL,            -- url-safe 32B random
  created_by    TEXT,                     -- users.id
  created_at    INTEGER NOT NULL,
  expires_at    INTEGER NOT NULL,
  used_at       INTEGER,
  used_openid   TEXT,
  revoked_at    INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_member_invites_token ON member_invites(token);
CREATE INDEX IF NOT EXISTS idx_member_invites_tenant_member
  ON member_invites(tenant_id, member_id);

-- ──────────────────────────────────────────────
-- 4. 上传 / 视频对象
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS uploads (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  filename            TEXT NOT NULL,
  mime                TEXT NOT NULL,
  size_bytes          INTEGER NOT NULL,
  storage_driver      TEXT NOT NULL,                    -- local | tencent-cos
  storage_key         TEXT NOT NULL,
  url                 TEXT NOT NULL,
  phase               TEXT NOT NULL DEFAULT 'uploading',  -- uploading | transcoding | ready | failed
  progress            INTEGER NOT NULL DEFAULT 0,
  duration_sec        INTEGER,
  meta                TEXT,                              -- json
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_uploads_tenant ON uploads(tenant_id);

-- ──────────────────────────────────────────────
-- 5. 计量（roadmap 07 §4）
-- ──────────────────────────────────────────────

-- usage_events：原子事件流
CREATE TABLE IF NOT EXISTS usage_events (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_key    TEXT NOT NULL,        -- members.active_count | courses.count | storage.bytes | playback.minutes
  delta         REAL NOT NULL,
  ref_kind      TEXT,                  -- member | video | course | snapshot
  ref_id        TEXT,
  occurred_at   INTEGER NOT NULL,
  meta          TEXT
);
CREATE INDEX IF NOT EXISTS idx_usage_events_tenant_metric ON usage_events(tenant_id, metric_key, occurred_at);

-- usage_meters：月聚合，幂等可重算
CREATE TABLE IF NOT EXISTS usage_meters (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_key      TEXT NOT NULL,
  period          TEXT NOT NULL,        -- YYYY-MM
  current_value   REAL NOT NULL DEFAULT 0,
  free_quota      REAL NOT NULL DEFAULT 0,
  unit            TEXT NOT NULL DEFAULT '',
  unit_price      REAL,
  updated_at      INTEGER NOT NULL,
  UNIQUE (tenant_id, metric_key, period)
);
CREATE INDEX IF NOT EXISTS idx_usage_meters_tenant ON usage_meters(tenant_id);

-- tenant_quotas：每个 tenant 当前的 Freemium 阈值（plan 切换时分段记录）
CREATE TABLE IF NOT EXISTS tenant_quotas (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan          TEXT NOT NULL DEFAULT 'free',
  quotas_json   TEXT NOT NULL,                -- 4 个维度的 free/unit_price
  effective_at  INTEGER NOT NULL,
  created_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tenant_quotas_tenant ON tenant_quotas(tenant_id, effective_at);

-- ──────────────────────────────────────────────
-- 6. 学员观看进度（V0：以匿名 token 或绑定 member_id 索引）
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lesson_progress (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lesson_id     TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  -- 二选一：未绑定时用 anon_token，绑定后挂 member_id
  anon_token    TEXT,
  member_id     TEXT REFERENCES members(id),
  watched_sec   INTEGER NOT NULL DEFAULT 0,
  completed     INTEGER NOT NULL DEFAULT 0,    -- 0/1
  last_at       INTEGER NOT NULL
  -- 唯一性靠 repo 层 SELECT-then-INSERT 保证（SQLite NULL 在 UNIQUE 不稳）
  -- Postgres 迁移时可加 partial unique index：
  --   CREATE UNIQUE INDEX ON lesson_progress(tenant_id, lesson_id, anon_token) WHERE anon_token IS NOT NULL;
);
CREATE INDEX IF NOT EXISTS idx_lp_tenant_lesson ON lesson_progress(tenant_id, lesson_id);
