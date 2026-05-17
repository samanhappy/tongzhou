// 创作者后台 · 课程列表（V0 极简版）
//
// 数据源：环境变量 API_BASE 设置时走真后端（api/ Fastify + SQLite）,
// 否则回退到 lib/mock.ts。
// roadmap 中"课程"= Track。V0 隐藏 Stage 层，UI 只展示 Course / Lesson。

import Link from "next/link";
import { CreatorShell } from "@/components/shell";
import { I } from "@/components/icons";
import { Bar, Placeholder, SectionLabel } from "@/components/primitives";
import { getSourceLabel, getTracks } from "@/lib/source";

export default async function TracksPage() {
  const tracks = await getTracks();
  const source = getSourceLabel();

  return (
    <CreatorShell
      title="课程"
      breadcrumb={["醒春阁", "交付"]}
      actions={
        <button className="tz-btn tz-btn-primary">
          <I.plus size={14} /> 新建课程
        </button>
      }
    >
      <SectionLabel
        stamp="课"
        title="全部课程"
        sub={`共 ${tracks.length} 门 · 含草稿`}
        right={
          <span
            className="tz-chip"
            style={{
              fontFamily: "var(--mono)",
              background:
                source === "api"
                  ? "color-mix(in oklch, var(--accent) 14%, #fff)"
                  : "var(--paper-deep)",
              color: source === "api" ? "var(--accent-deep)" : "var(--ink-3)",
            }}
            title={
              source === "api"
                ? "数据来自 api/（Fastify + SQLite）"
                : "数据来自 lib/mock.ts — 设置环境变量 API_BASE 切换"
            }
          >
            数据源 · {source}
          </span>
        }
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {tracks.map((t) => (
          <Link
            key={t.id}
            href={`/app/tracks/${t.id}`}
            className="tz-card"
            style={{
              padding: 18,
              display: "flex",
              gap: 18,
              alignItems: "stretch",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Placeholder w={120} h={80} radius={6} label="封面" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <h3 className="tz-serif" style={{ margin: 0, fontSize: 17, fontWeight: 500 }}>
                  {t.title} · {t.subtitle}
                </h3>
                {t.status === "published" ? (
                  <span className="tz-chip is-accent">
                    <I.check size={10} /> 已发布
                  </span>
                ) : (
                  <span className="tz-chip">草稿</span>
                )}
              </div>
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: 12,
                  color: "var(--ink-2)",
                  maxWidth: 640,
                }}
              >
                {t.oneLine}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 22,
                  fontSize: 11.5,
                  color: "var(--ink-3)",
                }}
              >
                {t.lessonsTotal > 0 && (
                  <span>
                    <b style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
                      {t.lessonsTotal}
                    </b>{" "}
                    课时（{t.lessonsPublished} 发布 / {t.lessonsTotal - t.lessonsPublished} 草稿）
                  </span>
                )}
                <span>
                  <b style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
                    {t.totalMinutes}
                  </b>{" "}
                  min 总时长
                </span>
                <span>
                  <b style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
                    {t.cumulativeViewers}
                  </b>{" "}
                  累计观看人
                </span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 8,
                minWidth: 120,
              }}
            >
              <span
                style={{
                  fontSize: 10.5,
                  color: "var(--ink-3)",
                  letterSpacing: "0.05em",
                }}
              >
                完播率
              </span>
              <div
                className="tz-serif"
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {t.completionRate}%
              </div>
              <div style={{ width: 100 }}>
                <Bar value={t.completionRate} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </CreatorShell>
  );
}
