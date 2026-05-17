// Usage · 计量聚合
// roadmap/07-V0范围与计量模型.md §4.1 + §4.2
//
// 4 个 metric_key：
//   members.active_count  / courses.count / storage.bytes / playback.minutes

import { getDb } from "../../db/index.js";
import { newId } from "../../lib/id.js";

export type MetricKey =
  | "members.active_count"
  | "courses.count"
  | "storage.bytes"
  | "playback.minutes";

export type MeterRow = {
  key: MetricKey;
  name: string;
  value: number;
  max: number;
  unit: string;
  sub: string;
  sample: string;
};

const DEFAULT_QUOTAS: Record<MetricKey, { max: number; unit: string }> = {
  "members.active_count": { max: 200, unit: "人" },
  "courses.count": { max: 10, unit: "门" },
  "storage.bytes": { max: 5, unit: "GB" },
  "playback.minutes": { max: 1500, unit: "分钟" },
};

const METRIC_META: Record<MetricKey, { name: string; sub: string; sample: string }> = {
  "members.active_count": {
    name: "月活学员",
    sub: "学员任意一次访问即视为本月活跃 · 月底清零去重",
    sample: "访问事件 / 实时",
  },
  "courses.count": {
    name: "发布课程",
    sub: "status = published 的课程数 · 取本月最大值",
    sample: "课程状态变更 / 实时",
  },
  "storage.bytes": {
    name: "视频存储",
    sub: "视频原始字节数累加 · MVP 暂用即时值（V1 换为每日快照取平均）",
    sample: "uploads 表实时",
  },
  "playback.minutes": {
    name: "播放分钟",
    sub: "播放器 30 秒心跳累加 · 当月加总",
    sample: "心跳事件 / 30 秒",
  },
};

export async function recordEvent(input: {
  tenantId: string;
  metricKey: MetricKey;
  delta: number;
  refKind?: string;
  refId?: string;
  meta?: unknown;
}): Promise<void> {
  await getDb()
    .prepare(
      `INSERT INTO usage_events
        (id, tenant_id, metric_key, delta, ref_kind, ref_id, occurred_at, meta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run([
      newId("ue"),
      input.tenantId,
      input.metricKey,
      input.delta,
      input.refKind ?? null,
      input.refId ?? null,
      Date.now(),
      input.meta ? JSON.stringify(input.meta) : null,
    ]);
}

export async function recomputeMonth(tenantId: string, period?: string): Promise<void> {
  const p = period ?? currentPeriod();
  const { start, end } = periodRange(p);
  const db = getDb();
  await db.transaction(async () => {
    for (const key of Object.keys(METRIC_META) as MetricKey[]) {
      let value = 0;
      if (key === "members.active_count") {
        const row = await db
          .prepare(
            `SELECT COUNT(DISTINCT COALESCE(member_id, anon_token)) AS n
             FROM lesson_progress WHERE tenant_id = ? AND last_at >= ? AND last_at < ?`,
          )
          .get<{ n: number }>([tenantId, start, end]);
        value = row?.n ?? 0;
      } else if (key === "courses.count") {
        const row = await db
          .prepare(`SELECT COUNT(*) AS n FROM tracks WHERE tenant_id = ? AND status = 'published'`)
          .get<{ n: number }>([tenantId]);
        value = row?.n ?? 0;
      } else if (key === "storage.bytes") {
        const row = await db
          .prepare(`SELECT COALESCE(SUM(size_bytes), 0) AS n FROM uploads WHERE tenant_id = ?`)
          .get<{ n: number }>([tenantId]);
        value = Number(((row?.n ?? 0) / 1024 / 1024 / 1024).toFixed(2));
      } else if (key === "playback.minutes") {
        const row = await db
          .prepare(
            `SELECT COALESCE(SUM(delta), 0) AS n FROM usage_events
             WHERE tenant_id = ? AND metric_key = 'playback.minutes'
               AND occurred_at >= ? AND occurred_at < ?`,
          )
          .get<{ n: number }>([tenantId, start, end]);
        value = Math.round(row?.n ?? 0);
      }
      await upsertMeter(tenantId, key, p, value);
    }
  });
}

async function upsertMeter(
  tenantId: string,
  key: MetricKey,
  period: string,
  value: number,
): Promise<void> {
  const q = DEFAULT_QUOTAS[key];
  const db = getDb();
  // SQLite 与 PG 都支持 ON CONFLICT...DO UPDATE
  await db
    .prepare(
      `INSERT INTO usage_meters
         (id, tenant_id, metric_key, period, current_value, free_quota, unit, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (tenant_id, metric_key, period) DO UPDATE SET
         current_value = excluded.current_value,
         free_quota    = excluded.free_quota,
         unit          = excluded.unit,
         updated_at    = excluded.updated_at`,
    )
    .run([newId("um"), tenantId, key, period, value, q.max, q.unit, Date.now()]);
}

export async function readMeters(tenantId: string, period?: string): Promise<MeterRow[]> {
  await recomputeMonth(tenantId, period);
  const p = period ?? currentPeriod();
  const rows = await getDb()
    .prepare(
      `SELECT metric_key, current_value, free_quota, unit
       FROM usage_meters WHERE tenant_id = ? AND period = ?`,
    )
    .all<{
      metric_key: MetricKey;
      current_value: number;
      free_quota: number;
      unit: string;
    }>([tenantId, p]);

  return (Object.keys(METRIC_META) as MetricKey[]).map((key) => {
    const row = rows.find((r) => r.metric_key === key);
    const meta = METRIC_META[key];
    const q = DEFAULT_QUOTAS[key];
    return {
      key,
      name: meta.name,
      value: row?.current_value ?? 0,
      max: row?.free_quota ?? q.max,
      unit: row?.unit ?? q.unit,
      sub: meta.sub,
      sample: meta.sample,
    };
  });
}

function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function periodRange(period: string): { start: number; end: number } {
  const [y, m] = period.split("-").map(Number);
  const start = new Date(y!, (m ?? 1) - 1, 1).getTime();
  const end = new Date(y!, m ?? 1, 1).getTime();
  return { start, end };
}
