// 创作者后台 · 数据看板
// 来自 design/creator-dashboard.jsx + PRD §4.6 + V0 §3.1
//
// 数据走 lib/source.ts：API_BASE 设置时读真后端，否则 mock。

import { CreatorShell } from "@/components/shell";
import { I } from "@/components/icons";
import {
  Bar,
  Placeholder,
  SectionLabel,
  Sparkline,
} from "@/components/primitives";
import { SourceChip } from "@/components/source-chip";
import { CopyShareLinkButton } from "@/components/copy-share-link-button";
import { getDashboardData, getTenant } from "@/lib/source";

function StatCard({
  label,
  value,
  unit,
  delta,
  trend,
  foot,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: number;
  trend?: readonly number[];
  foot?: string;
}) {
  return (
    <div
      className="tz-card"
      style={{ padding: "16px 18px", flex: 1, minWidth: 0 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 11.5,
            color: "var(--ink-3)",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </span>
        {delta != null && delta !== 0 && (
          <span
            style={{
              fontSize: 10.5,
              color: delta > 0 ? "var(--accent)" : "var(--ink-3)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {delta > 0 ? "↑" : "↓"} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 4,
          marginTop: 8,
          marginBottom: 4,
        }}
      >
        <span
          className="tz-serif"
          style={{
            fontSize: 28,
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{unit}</span>
        )}
      </div>
      {trend && (
        <div style={{ marginTop: 8, marginBottom: 4, marginLeft: -2 }}>
          <Sparkline values={[...trend]} w={150} h={26} />
        </div>
      )}
      {foot && (
        <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 6 }}>
          {foot}
        </div>
      )}
    </div>
  );
}

function QuotaRow({
  label,
  value,
  max,
  unit,
  color,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{label}</span>
        <span
          style={{
            fontSize: 11.5,
            color: pct > 80 ? "var(--warn)" : "var(--ink-2)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <b style={{ color: "var(--ink)", fontWeight: 500 }}>{value}</b> /{" "}
          {max} {unit}
        </span>
      </div>
      <Bar value={value} max={max} color={color} />
    </div>
  );
}

export default async function DashboardPage() {
  const [{ stats, quotas, courseWatch, activities, source }, tenant] =
    await Promise.all([getDashboardData(), getTenant()]);

  return (
    <CreatorShell
      title="今日 · 五月十七"
      breadcrumb={[tenant.name, "工作台"]}
      actions={<CopyShareLinkButton slug={tenant.slug} />}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          marginTop: -10,
          marginBottom: 14,
        }}
      >
        <SourceChip source={source} />
      </div>

      {/* 顶部 4 维度统计 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 22,
        }}
      >
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}
      >
        {/* 左：课程观看 */}
        <div className="tz-card" style={{ padding: 20 }}>
          <SectionLabel
            stamp="观"
            title="课程观看 · 近 7 日"
            sub="谁看了什么 · 看了多久"
          />
          {courseWatch.length === 0 ? (
            <div
              style={{
                padding: 28,
                textAlign: "center",
                color: "var(--ink-3)",
                fontSize: 12,
              }}
            >
              暂无观看记录 — 学员通过 H5 链接打开后会在此显示
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12.5,
              }}
            >
              <thead>
                <tr
                  style={{
                    color: "var(--ink-3)",
                    fontSize: 11,
                    fontWeight: 400,
                    textAlign: "left",
                  }}
                >
                  <th
                    style={{
                      padding: "8px 0",
                      fontWeight: 400,
                      letterSpacing: "0.05em",
                    }}
                  >
                    课时
                  </th>
                  <th
                    style={{
                      padding: "8px 0",
                      fontWeight: 400,
                      width: 80,
                      textAlign: "right",
                    }}
                  >
                    观看人数
                  </th>
                  <th
                    style={{
                      padding: "8px 0",
                      fontWeight: 400,
                      width: 100,
                      textAlign: "right",
                    }}
                  >
                    播放分钟
                  </th>
                  <th style={{ padding: "8px 0", fontWeight: 400, width: 140 }}>
                    完播率
                  </th>
                </tr>
              </thead>
              <tbody>
                {courseWatch.map((r, i) => (
                  <tr
                    key={i}
                    style={{ borderTop: "1px solid var(--paper-line)" }}
                  >
                    <td style={{ padding: "11px 0" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Placeholder w={36} h={22} radius={3} label="" />
                        {r.name}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "11px 0",
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {r.view}
                    </td>
                    <td
                      style={{
                        padding: "11px 0",
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {r.mins}
                    </td>
                    <td style={{ padding: "11px 0" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <Bar value={r.complete} />
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--ink-2)",
                            fontVariantNumeric: "tabular-nums",
                            width: 28,
                            textAlign: "right",
                          }}
                        >
                          {r.complete}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 右：Quota + 最近活动 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="tz-card" style={{ padding: 18 }}>
            <SectionLabel stamp="量" title="本月 Freemium" sub="实时" />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {quotas.map((q) => (
                <QuotaRow key={q.label} {...q} />
              ))}
            </div>
            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                background: "var(--accent-soft)",
                borderRadius: 6,
                fontSize: 11.5,
                color: "var(--accent-deep)",
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <I.info size={13} style={{ marginTop: 1, flex: "0 0 auto" }} />
              <span>任何超额仅冻结上传，学员观看不受影响。</span>
            </div>
          </div>

          <div className="tz-card" style={{ padding: 18 }}>
            <SectionLabel stamp="动" title="最近活动" />
            {activities.length === 0 ? (
              <div
                style={{
                  padding: 20,
                  textAlign: "center",
                  color: "var(--ink-3)",
                  fontSize: 11.5,
                }}
              >
                暂无活动事件 — 等接入 activity events 后填充
              </div>
            ) : (
              activities.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                    borderTop: i ? "1px solid var(--paper-line)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      background: "var(--paper-deep)",
                      color: "var(--ink-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--serif)",
                      fontSize: 11.5,
                      flex: "0 0 auto",
                    }}
                  >
                    {r.who[0]}
                  </div>
                  <div style={{ flex: 1, fontSize: 12 }}>
                    <div>
                      <b style={{ fontWeight: 500 }}>{r.who}</b> ·{" "}
                      <span style={{ color: "var(--ink-2)" }}>{r.what}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}>
                    {r.t}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </CreatorShell>
  );
}
