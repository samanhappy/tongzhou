// 同舟 · 通用原子组件
// 来源：design/primitives.jsx

import type { CSSProperties, ReactNode } from "react";

// ─────────────────────────────────────────────
// 品牌印 — 同舟
// ─────────────────────────────────────────────
export function TZMark({ size = 24, color }: { size?: number; color?: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        background: color || "var(--ink)",
        color: "var(--paper)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--serif)",
        fontWeight: 600,
        fontSize: size * 0.5,
        letterSpacing: 0,
        lineHeight: 1,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
        flex: "0 0 auto",
      }}
    >
      舟
    </div>
  );
}

// 演示创作者：醒春阁
export function XCMark({ size = 24, color }: { size?: number; color?: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        background: color || "var(--seal)",
        color: "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--serif)",
        fontWeight: 600,
        fontSize: size * 0.46,
        lineHeight: 1,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
        flex: "0 0 auto",
      }}
    >
      春
    </div>
  );
}

// ─────────────────────────────────────────────
// 占位图：暖灰条纹 + 等宽文字说明
// ─────────────────────────────────────────────
export function Placeholder({
  w = "100%",
  h = 120,
  label = "封面",
  radius = 8,
  dark = false,
  children,
}: {
  w?: number | string;
  h?: number | string;
  label?: string;
  radius?: number;
  dark?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        position: "relative",
        overflow: "hidden",
        background: dark
          ? "repeating-linear-gradient(135deg, #1a1a1a 0 8px, #232323 8px 16px)"
          : "repeating-linear-gradient(135deg, oklch(0.94 0.012 80) 0 8px, oklch(0.92 0.014 80) 8px 16px)",
        color: dark ? "rgba(255,255,255,.55)" : "var(--ink-3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--mono)",
        fontSize: 10,
        letterSpacing: "0.04em",
        border: dark ? "1px solid #2a2a2a" : "1px solid var(--paper-edge)",
        flex: "0 0 auto",
      }}
    >
      {children || label}
    </div>
  );
}

// ─────────────────────────────────────────────
// 进度条
// ─────────────────────────────────────────────
export function Bar({
  value,
  max = 100,
  color = "var(--accent)",
  height = 6,
  danger,
}: {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  danger?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const c = danger && pct > 80 ? "var(--danger)" : pct > 80 ? "var(--warn)" : color;
  return (
    <div
      style={{
        height,
        width: "100%",
        background: "var(--paper-deep)",
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: pct + "%",
          background: c,
          borderRadius: 999,
          transition: "width .3s ease",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// 极简折线图
// ─────────────────────────────────────────────
export function Sparkline({
  values,
  w = 120,
  h = 32,
  color = "var(--accent)",
}: {
  values: number[];
  w?: number;
  h?: number;
  color?: string;
}) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map<[number, number]>((v, i) => [i * step, h - ((v - min) / span) * (h - 4) - 2]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const dArea = d + ` L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <path d={dArea} fill={color} opacity="0.12" />
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// 水印层：斜向重复
// ─────────────────────────────────────────────
export function WatermarkLayer({ text }: { text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        opacity: 0.18,
        transform: "rotate(-22deg)",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridAutoRows: "70px",
        alignContent: "center",
        justifyItems: "center",
        color: "#fff",
        fontFamily: "var(--mono)",
        fontSize: 11,
        letterSpacing: "0.05em",
        padding: "60px 0",
      }}
    >
      {Array.from({ length: 16 }).map((_, i) => (
        <span key={i}>{text}</span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// 区块标题
// ─────────────────────────────────────────────
export function SectionLabel({
  stamp,
  title,
  sub,
  right,
}: {
  stamp?: string;
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        {stamp && <span className="tz-stamp" style={{ alignSelf: "center" }}>{stamp}</span>}
        <h3 className="tz-serif" style={{ margin: 0, fontSize: 16, fontWeight: 500, color: "var(--ink)" }}>{title}</h3>
        {sub && <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{sub}</span>}
      </div>
      {right}
    </div>
  );
}

// 通用 Heading 标记（书卷标签）
export function Heading({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: "var(--ink-3)",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 8,
        ...style,
      }}
    >
      <span style={{ width: 16, height: 1, background: "var(--ink-4)" }} />
      {children}
    </div>
  );
}
