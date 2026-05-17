// 创作者后台 · 用量计费（V0 核心差异化页面）
// 来自 design/creator-other.jsx · CreatorUsage
// 4 维度计量 + Freemium 状态 + 降级路径
//
// 数据走 lib/source.ts

import { CreatorShell } from "@/components/shell";
import { I } from "@/components/icons";
import { Bar, SectionLabel } from "@/components/primitives";
import { SourceChip } from "@/components/source-chip";
import { getUsageData } from "@/lib/source";

function MeterCard({
  name,
  metricKey,
  value,
  max,
  unit,
  sub,
  sample,
}: {
  name: string;
  metricKey: string;
  value: number;
  max: number;
  unit: string;
  sub: string;
  sample: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const tone = pct > 100 ? "var(--danger)" : pct > 80 ? "var(--warn)" : "var(--accent)";
  return (
    <div className="tz-card" style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 500 }}>{name}</div>
          <div className="tz-mono" style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 2 }}>
            {metricKey}
          </div>
        </div>
        <span
          className="tz-chip"
          style={{
            background:
              tone === "var(--accent)"
                ? "var(--accent-soft)"
                : `color-mix(in oklch, ${tone} 12%, #fff)`,
            color: tone,
            borderColor: "transparent",
          }}
        >
          {pct > 100 ? "超额" : pct > 80 ? "警戒" : "健康"} · {pct}%
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "10px 0 8px" }}>
        <span
          className="tz-serif"
          style={{ fontSize: 30, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}
        >
          {typeof value === "number" && value % 1 !== 0 ? value.toFixed(2) : value}
        </span>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
          / {max} {unit}
        </span>
      </div>
      <Bar value={Math.min(value, max)} max={max} color={tone} />
      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8, lineHeight: 1.6 }}>{sub}</div>
      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: "1px solid var(--paper-line)",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10.5,
          color: "var(--ink-3)",
        }}
      >
        <span>采样：{sample}</span>
        <span>本月对账日 6/01</span>
      </div>
    </div>
  );
}

export default async function UsagePage() {
  const { meters, totalPct, source } = await getUsageData();
  const remaining = Math.max(0, 100 - totalPct);

  return (
    <CreatorShell
      title="用量计费"
      breadcrumb={["醒春阁", "运营"]}
      actions={
        <>
          <button className="tz-btn">
            <I.cloud size={13} /> 重算事件流
          </button>
          <button className="tz-btn tz-btn-accent">升级到 Pro</button>
        </>
      }
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: -10, marginBottom: 14 }}>
        <SourceChip source={source} />
      </div>

      {/* 当前方案 */}
      <div
        className="tz-card"
        style={{
          padding: "20px 22px",
          marginBottom: 22,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr 220px",
          gap: 18,
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.08em", marginBottom: 4 }}>
            当前方案
          </div>
          <div className="tz-serif" style={{ fontSize: 19, fontWeight: 500 }}>
            FREE · Freemium
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
            2026 年 5 月 · 计费周期
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.08em", marginBottom: 4 }}>
            本月用量比例
          </div>
          <div className="tz-serif" style={{ fontSize: 22, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
            {totalPct}%
          </div>
          <div style={{ fontSize: 11, color: totalPct > 80 ? "var(--warn)" : "var(--ink-3)", marginTop: 2 }}>
            距软超额还有 {remaining}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.08em", marginBottom: 4 }}>
            预估超额费用
          </div>
          <div className="tz-serif" style={{ fontSize: 22, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
            ¥ 0
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>当前在免费额内</div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.08em", marginBottom: 4 }}>
            下次对账
          </div>
          <div className="tz-serif" style={{ fontSize: 22, fontWeight: 500 }}>
            6 月 1 日
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>15 天后</div>
        </div>
        <div style={{ borderLeft: "1px solid var(--paper-line)", paddingLeft: 18 }}>
          <div style={{ fontSize: 11, color: "var(--ink-2)", marginBottom: 8, lineHeight: 1.5 }}>
            升级到 <b>Pro</b> 解锁更多额度 + 按量阶梯单价
          </div>
          <button className="tz-btn tz-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            查看方案
          </button>
        </div>
      </div>

      <SectionLabel stamp="量" title="本月用量 · 四维度" sub="每日刷新 · 事件流可重算" />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          marginBottom: 22,
        }}
      >
        {meters.map((m) => (
          <MeterCard
            key={m.key}
            name={m.name}
            metricKey={m.key}
            value={m.value}
            max={m.max}
            unit={m.unit}
            sub={m.sub}
            sample={m.sample}
          />
        ))}
      </div>

      {/* 降级策略 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div className="tz-card" style={{ padding: 20 }}>
          <SectionLabel stamp="级" title="超额降级路径" sub="学员观看体验永不受影响" />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ color: "var(--ink-3)", fontSize: 10.5, letterSpacing: "0.05em" }}>
                <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 400 }}>用量比例</th>
                <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 400 }}>状态</th>
                <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 400 }}>创作者侧</th>
                <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 400 }}>学员侧</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["0 – 80%", "healthy", "var(--accent)", "正常", "正常"],
                  ["80 – 100%", "warning", "var(--warn)", "横幅 + 邮件提示", "正常"],
                  [
                    "100 – 120%",
                    "over_soft",
                    "var(--seal)",
                    "上传 / 加学员置灰 · 元数据可编辑",
                    "正常播放",
                  ],
                  [
                    ">120% (7 日后)",
                    "over_hard",
                    "var(--danger)",
                    "后台只读",
                    "正常播放 ✓",
                  ],
                ] as const
              ).map((r, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--paper-line)" }}>
                  <td style={{ padding: "11px 0", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-2)" }}>
                    {r[0]}
                  </td>
                  <td style={{ padding: "11px 0" }}>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 10.5,
                        padding: "2px 7px",
                        borderRadius: 3,
                        background: `color-mix(in oklch, ${r[2]} 12%, #fff)`,
                        color: r[2],
                      }}
                    >
                      {r[1]}
                    </span>
                  </td>
                  <td style={{ padding: "11px 0", color: "var(--ink-2)" }}>{r[3]}</td>
                  <td
                    style={{
                      padding: "11px 0",
                      color: i >= 2 ? "var(--accent)" : "var(--ink-2)",
                      fontWeight: i >= 2 ? 500 : 400,
                    }}
                  >
                    {r[4]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            style={{
              marginTop: 14,
              padding: "10px 12px",
              borderRadius: 6,
              background: "color-mix(in oklch, var(--seal) 9%, transparent)",
              color: "var(--seal)",
              fontSize: 11.5,
              display: "flex",
              gap: 8,
            }}
          >
            <I.warn size={14} style={{ flex: "0 0 auto", marginTop: 1 }} />
            <span>
              <b>承诺：</b>「学员看视频不被中断」是同舟与小鹅通的差异化红线 —
              即使创作者超额，已发布内容也将持续可播。
            </span>
          </div>
        </div>

        <div className="tz-card" style={{ padding: 18 }}>
          <SectionLabel title="月账单" />
          {[
            { p: "2026-05", st: "draft", amt: "—" },
            { p: "2026-04", st: "paid", amt: "¥ 0.00" },
            { p: "2026-03", st: "paid", amt: "¥ 0.00" },
          ].map((b, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderTop: i ? "1px solid var(--paper-line)" : "none",
              }}
            >
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500, fontFamily: "var(--mono)" }}>{b.p}</div>
                <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>
                  {b.st === "draft" ? "进行中 · 仍在累计" : "已结清"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
                  {b.amt}
                </div>
                {b.st === "paid" && (
                  <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>查看明细</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CreatorShell>
  );
}
