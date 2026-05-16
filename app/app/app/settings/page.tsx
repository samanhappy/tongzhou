// 创作者后台 · 设置 · 品牌
// 来自 design/creator-other.jsx · CreatorSettings

import { CreatorShell } from "@/components/shell";
import { I } from "@/components/icons";
import { SectionLabel, XCMark } from "@/components/primitives";
import type { ReactNode } from "react";

function Field({
  label,
  desc,
  children,
}: {
  label: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <CreatorShell title="设置 · 品牌" breadcrumb={["醒春阁", "系统"]}>
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 22,
          borderBottom: "1px solid var(--paper-line)",
          marginTop: -10,
        }}
      >
        {[
          { k: "brand", l: "品牌", active: true },
          { k: "domain", l: "域名" },
          { k: "team", l: "团队成员", soon: true },
          { k: "wechat", l: "微信", soon: true },
          { k: "api", l: "API Key", soon: true },
        ].map((t) => (
          <button
            key={t.k}
            className="tz-btn tz-btn-ghost"
            style={{
              borderRadius: 0,
              padding: "8px 14px",
              color: t.active
                ? "var(--ink)"
                : t.soon
                  ? "var(--ink-4)"
                  : "var(--ink-3)",
              borderBottom: t.active
                ? "2px solid var(--accent)"
                : "2px solid transparent",
              marginBottom: -1,
              fontWeight: t.active ? 500 : 400,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {t.l}
            {t.soon && (
              <span
                style={{
                  fontSize: 9.5,
                  color: "var(--ink-4)",
                  letterSpacing: "0.06em",
                }}
              >
                V1
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <Field label="Logo" desc="正方形 · 推荐 240 × 240 · PNG / SVG">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <XCMark size={64} />
              <div>
                <button className="tz-btn">替换</button>
                <button className="tz-btn tz-btn-ghost" style={{ marginLeft: 4 }}>
                  移除
                </button>
              </div>
            </div>
          </Field>

          <Field label="空间名称" desc="将显示在学员 H5 页头与浏览器标签">
            <input className="tz-input" defaultValue="醒春阁" />
          </Field>

          <Field label="一句话简介" desc="学员落地页副标 · ≤ 40 字">
            <input
              className="tz-input"
              defaultValue="七天清晨的写作陪跑 · 一念一札，从见我到见今。"
            />
          </Field>

          <Field label="主题色" desc="将应用于学员 H5 主按钮与重点色">
            <div style={{ display: "flex", gap: 8 }}>
              {(
                [
                  ["#1a4d4a", true, "墨青"],
                  ["#7a2e1f", false, "胭脂"],
                  ["#1e3a8a", false, "藏蓝"],
                  ["#0c0c0c", false, "墨"],
                  ["#c2410c", false, "丹"],
                ] as const
              ).map(([c, on, n]) => (
                <button
                  key={c}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: 6,
                    borderRadius: 6,
                    border: on
                      ? "1px solid var(--ink)"
                      : "1px solid var(--paper-edge)",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      background: c,
                    }}
                  />
                  <span style={{ fontSize: 10.5, color: "var(--ink-2)" }}>{n}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="子域名" desc="学员可通过此地址访问">
            <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
              <input
                className="tz-input"
                defaultValue="xingchunge"
                style={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  flex: 1,
                }}
              />
              <div
                style={{
                  background: "var(--paper-deep)",
                  border: "1px solid var(--paper-edge)",
                  borderLeft: 0,
                  borderRadius: "0 6px 6px 0",
                  padding: "0 12px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: 12,
                  color: "var(--ink-2)",
                  fontFamily: "var(--mono)",
                }}
              >
                .tongzhou.app
              </div>
            </div>
            <div style={{ fontSize: 10.5, color: "var(--accent)", marginTop: 4 }}>✓ 可用</div>
          </Field>

          <Field label="加群链接" desc="学员页底部「加群联系老师」按钮指向">
            <input
              className="tz-input"
              defaultValue="https://work.weixin.qq.com/kfid/xingchunge"
            />
          </Field>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="tz-btn tz-btn-primary">保存修改</button>
            <button className="tz-btn">取消</button>
          </div>
        </div>

        {/* 实时预览 */}
        <div style={{ position: "sticky", top: 0 }}>
          <SectionLabel title="预览 · 学员落地页" />
          <div
            style={{
              border: "1px solid var(--paper-edge)",
              borderRadius: 14,
              overflow: "hidden",
              background: "#fff",
              aspectRatio: "9 / 16",
              maxHeight: 480,
              position: "relative",
            }}
          >
            <div style={{ padding: "30px 22px 12px", textAlign: "center" }}>
              <XCMark size={48} />
              <div
                className="tz-serif"
                style={{ fontSize: 18, fontWeight: 500, marginTop: 10 }}
              >
                醒春阁
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
                七天清晨的写作陪跑
              </div>
            </div>
            <div style={{ padding: "0 16px 16px" }}>
              <div
                className="tz-serif"
                style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}
              >
                七天成长计划 · 习作启蒙
              </div>
              <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginBottom: 12 }}>
                8 节 · 62 分钟
              </div>
              {["开篇·一支笔之外", "第一日·见我", "第二日·见物"].map((t, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 0",
                    borderTop: "1px solid var(--paper-line)",
                  }}
                >
                  <I.playC size={16} style={{ color: "#1a4d4a" }} />
                  <span style={{ fontSize: 12 }}>{t}</span>
                </div>
              ))}
              <button
                style={{
                  width: "100%",
                  marginTop: 14,
                  padding: "10px 14px",
                  background: "#1a4d4a",
                  color: "#fff",
                  border: 0,
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                加群联系老师
              </button>
            </div>
          </div>
        </div>
      </div>
    </CreatorShell>
  );
}
