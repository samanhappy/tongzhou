-- 同舟 V0 · Postgres schema（含 RLS）
-- 适用于 PG 14+。
--
-- 与 schema.sql(SQLite) 一一对应,差异：
--   1. 用 TEXT PRIMARY KEY 保留（id 仍是 ULID 字符串,跨驱动不破坏）
--      若想换 uuid 类型,id 字段改 `uuid DEFAULT gen_random_uuid()` + 关掉 ULID 生成
--   2. INTEGER 时间戳保留毫秒数（兼容 SQLite）
--   3. JSON 改 jsonb
--   4. 启用 RLS：所有带 tenant_id 的表 → CREATE POLICY USING (tenant_id = current_setting(...))
--
-- ALL TABLES are CREATE TABLE IF NOT EXISTS — 启动可重复执行。

-- ──────────────────────────────────────────────
-- 1. 多租户
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tenants (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  tagline       TEXT NOT NULL DEFAULT '',
  theme_hue     INTEGER NOT NULL DEFAULT 162,
  group_link    TEXT NOT NULL DEFAULT '',
  plan          TEXT NOT NULL DEFAULT 'free',
  created_at    BIGINT NOT NULL,
  updated_at    BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  password_hash TEXT,
  role          TEXT NOT NULL DEFAULT 'owner',
  created_at    BIGINT NOT NULL,
  UNIQUE (tenant_id, email)
);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ──────────────────────────────────────────────
-- 2. 课程结构
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS uploads (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  filename            TEXT NOT NULL,
  mime                TEXT NOT NULL,
  size_bytes          BIGINT NOT NULL,
  storage_driver      TEXT NOT NULL,
  storage_key         TEXT NOT NULL,
  url                 TEXT NOT NULL,
  phase               TEXT NOT NULL DEFAULT 'uploading',
  progress            INTEGER NOT NULL DEFAULT 0,
  duration_sec        INTEGER,
  meta                JSONB,
  created_at          BIGINT NOT NULL,
  updated_at          BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_uploads_tenant ON uploads(tenant_id);

CREATE TABLE IF NOT EXISTS tracks (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  slug                TEXT NOT NULL,
  title               TEXT NOT NULL,
  subtitle            TEXT NOT NULL DEFAULT '',
  one_line            TEXT NOT NULL DEFAULT '',
  cover_url           TEXT,
  status              TEXT NOT NULL DEFAULT 'draft',
  total_minutes       INTEGER NOT NULL DEFAULT 0,
  cumulative_viewers  INTEGER NOT NULL DEFAULT 0,
  completion_rate     INTEGER NOT NULL DEFAULT 0,
  position            INTEGER NOT NULL DEFAULT 0,
  created_at          BIGINT NOT NULL,
  updated_at          BIGINT NOT NULL,
  UNIQUE (tenant_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_tracks_tenant ON tracks(tenant_id);

CREATE TABLE IF NOT EXISTS lessons (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  track_id            TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  summary             TEXT NOT NULL DEFAULT '',
  position            INTEGER NOT NULL DEFAULT 0,
  duration_sec        INTEGER,
  duration_text       TEXT NOT NULL DEFAULT '—',
  video_id            TEXT REFERENCES uploads(id),
  status              TEXT NOT NULL DEFAULT 'draft',
  views               INTEGER NOT NULL DEFAULT 0,
  progress            INTEGER,
  created_at          BIGINT NOT NULL,
  updated_at          BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lessons_tenant_track ON lessons(tenant_id, track_id, position);

-- ──────────────────────────────────────────────
-- 3. 学员
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS members (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name                TEXT NOT NULL DEFAULT '—',
  phone               TEXT NOT NULL DEFAULT '—',
  source              TEXT NOT NULL DEFAULT '单加',
  bound               INTEGER NOT NULL DEFAULT 0,
  anonymous           INTEGER NOT NULL DEFAULT 0,
  joined_at           TEXT NOT NULL DEFAULT '',
  last_active         TEXT NOT NULL DEFAULT '',
  course_count        INTEGER NOT NULL DEFAULT 0,
  playback_minutes    INTEGER NOT NULL DEFAULT 0,
  wechat_openid       TEXT,
  wechat_unionid      TEXT,
  wechat_nickname     TEXT,
  wechat_avatar       TEXT,
  bound_at            BIGINT,
  created_at          BIGINT NOT NULL,
  updated_at          BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_members_tenant ON members(tenant_id);
-- 已存在的库:补列
ALTER TABLE members ADD COLUMN IF NOT EXISTS wechat_openid TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS wechat_unionid TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS wechat_nickname TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS wechat_avatar TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS bound_at BIGINT;
CREATE UNIQUE INDEX IF NOT EXISTS uq_members_openid
  ON members(tenant_id, wechat_openid) WHERE wechat_openid IS NOT NULL;

CREATE TABLE IF NOT EXISTS member_invites (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  member_id     TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  token         TEXT NOT NULL,
  created_by    TEXT,
  created_at    BIGINT NOT NULL,
  expires_at    BIGINT NOT NULL,
  used_at       BIGINT,
  used_openid   TEXT,
  revoked_at    BIGINT
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_member_invites_token ON member_invites(token);
CREATE INDEX IF NOT EXISTS idx_member_invites_tenant_member
  ON member_invites(tenant_id, member_id);

-- ──────────────────────────────────────────────
-- 4. 计量
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS usage_events (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_key    TEXT NOT NULL,
  delta         DOUBLE PRECISION NOT NULL,
  ref_kind      TEXT,
  ref_id        TEXT,
  occurred_at   BIGINT NOT NULL,
  meta          JSONB
);
CREATE INDEX IF NOT EXISTS idx_usage_events_tenant_metric ON usage_events(tenant_id, metric_key, occurred_at);

CREATE TABLE IF NOT EXISTS usage_meters (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_key      TEXT NOT NULL,
  period          TEXT NOT NULL,
  current_value   DOUBLE PRECISION NOT NULL DEFAULT 0,
  free_quota      DOUBLE PRECISION NOT NULL DEFAULT 0,
  unit            TEXT NOT NULL DEFAULT '',
  unit_price      DOUBLE PRECISION,
  updated_at      BIGINT NOT NULL,
  UNIQUE (tenant_id, metric_key, period)
);
CREATE INDEX IF NOT EXISTS idx_usage_meters_tenant ON usage_meters(tenant_id);

CREATE TABLE IF NOT EXISTS tenant_quotas (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan          TEXT NOT NULL DEFAULT 'free',
  quotas_json   JSONB NOT NULL,
  effective_at  BIGINT NOT NULL,
  created_at    BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tenant_quotas_tenant ON tenant_quotas(tenant_id, effective_at);

-- ──────────────────────────────────────────────
-- 5. 学员观看进度
-- ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lesson_progress (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lesson_id     TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  anon_token    TEXT,
  member_id     TEXT REFERENCES members(id),
  watched_sec   INTEGER NOT NULL DEFAULT 0,
  completed     INTEGER NOT NULL DEFAULT 0,
  last_at       BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_lp_tenant_lesson ON lesson_progress(tenant_id, lesson_id);
-- 部分唯一索引：anon 和 member 各自独立保唯一
CREATE UNIQUE INDEX IF NOT EXISTS uq_lp_anon
  ON lesson_progress(tenant_id, lesson_id, anon_token) WHERE anon_token IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_lp_member
  ON lesson_progress(tenant_id, lesson_id, member_id) WHERE member_id IS NOT NULL;

-- ──────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY
-- ──────────────────────────────────────────────
--
-- 每请求在事务里执行：
--   SELECT set_config('app.tenant_id', '<tenant_id>', true);
-- 之后所有查询自动被以下 USING 子句过滤。
--
-- ❗ tenants 自身不启 RLS — 是 tenant 主体,登录前需查 slug。
-- 超管运维通道：用 SUPERUSER 账户连接（不受 RLS 影响）。

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users','tracks','lessons','members','uploads',
    'usage_events','usage_meters','tenant_quotas','lesson_progress',
    'member_invites'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    -- 删除旧策略后重建,保证 schema 重跑幂等
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I
         USING (tenant_id = current_setting(''app.tenant_id'', true))
         WITH CHECK (tenant_id = current_setting(''app.tenant_id'', true))',
      t
    );
  END LOOP;
END $$;

-- ──────────────────────────────────────────────
-- 7. 调试帮手 — 当前会话身份
-- ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION app_current_tenant()
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT current_setting('app.tenant_id', true)
$$;
