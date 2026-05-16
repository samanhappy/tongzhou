// 创作者后台 · 学员名单（V0：单加 + CSV 导入；V0.5 起加 Webhook）
// 来自 design/creator-other.jsx · CreatorMembers

import { CreatorShell } from "@/components/shell";
import { I } from "@/components/icons";
import { Bar } from "@/components/primitives";
import { members } from "@/lib/mock";

export default function MembersPage() {
  return (
    <CreatorShell
      title="学员"
      breadcrumb={["醒春阁", "运营"]}
      actions={
        <>
          <button className="tz-btn">
            <I.csv size={14} /> CSV 导入
          </button>
          <button className="tz-btn">
            <I.link size={14} /> 邀请短链
          </button>
          <button className="tz-btn tz-btn-primary">
            <I.plus size={14} /> 单个添加
          </button>
        </>
      }
    >
      {/* 计量提示 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 18,
          padding: "12px 16px",
          background: "#fff",
          border: "1px solid var(--paper-edge)",
          borderRadius: 8,
        }}
      >
        <I.member size={18} style={{ color: "var(--accent)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5 }}>
            <b style={{ fontVariantNumeric: "tabular-nums" }}>142</b> 位本月活跃 ·
            <span style={{ color: "var(--ink-3)" }}> 计入 Freemium 配额 </span>
            <b style={{ fontVariantNumeric: "tabular-nums" }}>200</b>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>
            学员在本月内有任意访问即视为活跃 · 月底清零
          </div>
        </div>
        <div style={{ width: 220 }}>
          <Bar value={142} max={200} />
        </div>
        <span
          style={{
            fontSize: 11.5,
            color: "var(--ink-2)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          71%
        </span>
      </div>

      {/* 过滤栏 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#fff",
            border: "1px solid var(--paper-edge)",
            borderRadius: 6,
            padding: "6px 10px",
            flex: "0 0 240px",
            fontSize: 12,
          }}
        >
          <I.search size={13} style={{ color: "var(--ink-3)" }} />
          <input
            placeholder="搜索姓名 / 手机号"
            style={{
              border: 0,
              outline: 0,
              background: "transparent",
              flex: 1,
              fontSize: 12,
              color: "var(--ink)",
            }}
          />
        </div>
        <button className="tz-btn">
          <I.filter size={13} /> 来源
        </button>
        <button className="tz-btn">
          <I.filter size={13} /> 已绑定
        </button>
        <button className="tz-btn">
          <I.filter size={13} /> 课程
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>共 142 位</span>
      </div>

      {/* 表格 */}
      <div className="tz-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr
              style={{
                background: "var(--paper-deep)",
                color: "var(--ink-3)",
                fontSize: 10.5,
                letterSpacing: "0.05em",
              }}
            >
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 400, width: 24 }}>
                <input type="checkbox" />
              </th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 400 }}>学员</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 400 }}>手机号</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 400 }}>来源</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 400 }}>加入</th>
              <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 400 }}>课时</th>
              <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 400 }}>
                播放分钟
              </th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 400 }}>
                最近活跃
              </th>
              <th
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  fontWeight: 400,
                  width: 80,
                }}
              ></th>
            </tr>
          </thead>
          <tbody>
            {members.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid var(--paper-line)" }}>
                <td style={{ padding: "11px 14px" }}>
                  <input type="checkbox" />
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 999,
                        flex: "0 0 auto",
                        background: r.anonymous ? "var(--paper-deep)" : "var(--accent-ink)",
                        color: r.anonymous ? "var(--ink-3)" : "#fff",
                        fontFamily: "var(--serif)",
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {r.anonymous ? "?" : r.name[0]}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: r.anonymous ? 400 : 500,
                          color: r.anonymous ? "var(--ink-3)" : "var(--ink)",
                        }}
                      >
                        {r.anonymous ? <i>访客 · 未绑定</i> : r.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td
                  style={{
                    padding: "11px 14px",
                    color: r.phone === "—" ? "var(--ink-4)" : "var(--ink-2)",
                    fontFamily: "var(--mono)",
                    fontSize: 11.5,
                  }}
                >
                  {r.phone}
                </td>
                <td style={{ padding: "11px 14px", color: "var(--ink-2)" }}>{r.source}</td>
                <td
                  style={{
                    padding: "11px 14px",
                    color: "var(--ink-2)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {r.joinedAt}
                </td>
                <td
                  style={{
                    padding: "11px 14px",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {r.courseCount}
                </td>
                <td
                  style={{
                    padding: "11px 14px",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {r.playbackMinutes}
                </td>
                <td style={{ padding: "11px 14px", color: "var(--ink-2)" }}>{r.lastActive}</td>
                <td style={{ padding: "11px 14px" }}>
                  {r.bound ? (
                    <span className="tz-chip is-accent" style={{ fontSize: 10 }}>
                      已绑定
                    </span>
                  ) : (
                    <span className="tz-chip" style={{ fontSize: 10 }}>
                      访客
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CreatorShell>
  );
}
