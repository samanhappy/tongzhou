// 创作者后台 · 课程列表（V0 极简版）
//
// roadmap 中"课程"= Track。V0 隐藏 Stage 层，UI 只展示 Course / Lesson。

import Link from "next/link";
import { CreatorShell } from "@/components/shell";
import { I } from "@/components/icons";
import { Bar, Placeholder, SectionLabel } from "@/components/primitives";
import { tracks } from "@/lib/mock";

export default function TracksPage() {
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
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {tracks.map((t) => {
          const published = t.lessons.filter((l) => l.status === "published").length;
          const draft = t.lessons.length - published;
          return (
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
                  <h3
                    className="tz-serif"
                    style={{ margin: 0, fontSize: 17, fontWeight: 500 }}
                  >
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
                  <span>
                    <b style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
                      {t.lessons.length}
                    </b>{" "}
                    课时（{published} 发布 / {draft} 草稿）
                  </span>
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
          );
        })}
      </div>
    </CreatorShell>
  );
}
