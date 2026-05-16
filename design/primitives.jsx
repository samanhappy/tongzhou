// 同舟 · 共享原子：图标、骨架、模拟数据
// 全部内联 SVG。线条描粗 1.6，端点圆，颜色用 currentColor。

const Icon = ({ d, size = 16, sw = 1.6, fill = "none", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
       stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
       style={{ flex: "0 0 auto", ...style }}>
    {d}
  </svg>
);

const I = {
  // 导航 / 通用
  home:    (p) => <Icon {...p} d={<><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></>} />,
  course:  (p) => <Icon {...p} d={<><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 9h18"/></>} />,
  member:  (p) => <Icon {...p} d={<><circle cx="9" cy="9" r="3.2"/><path d="M3 19c.6-3.4 3-5 6-5s5.4 1.6 6 5"/><circle cx="17" cy="8" r="2.4"/><path d="M15 14.5c2.7-.6 5.5.8 6 4.5"/></>} />,
  usage:   (p) => <Icon {...p} d={<><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 15v-4"/><path d="M12 15V7"/><path d="M16 15v-6"/></>} />,
  cog:     (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="2.6"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4"/></>} />,
  library: (p) => <Icon {...p} d={<><rect x="3" y="4" width="14" height="16" rx="1.4"/><path d="M7 4v16"/><rect x="17" y="6" width="4" height="14" rx="1"/></>} />,
  bell:    (p) => <Icon {...p} d={<><path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 004 0"/></>} />,
  search:  (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="6.2"/><path d="M16 16l4 4"/></>} />,
  plus:    (p) => <Icon {...p} d={<><path d="M12 5v14M5 12h14"/></>} />,
  grip:    (p) => <Icon {...p} d={<><circle cx="9" cy="6" r=".9" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r=".9" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r=".9" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r=".9" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r=".9" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r=".9" fill="currentColor" stroke="none"/></>} />,
  play:    (p) => <Icon {...p} d={<><path d="M8 5l11 7-11 7z" fill="currentColor" stroke="none"/></>} />,
  playC:   (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" stroke="currentColor"/></>} />,
  pause:   (p) => <Icon {...p} d={<><rect x="7" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="13" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/></>} />,
  check:   (p) => <Icon {...p} d={<path d="M5 12l4 4 10-10"/>} />,
  chevR:   (p) => <Icon {...p} d={<path d="M9 5l7 7-7 7"/>} />,
  chevL:   (p) => <Icon {...p} d={<path d="M15 5l-7 7 7 7"/>} />,
  chevD:   (p) => <Icon {...p} d={<path d="M5 9l7 7 7-7"/>} />,
  link:    (p) => <Icon {...p} d={<><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/></>} />,
  upload:  (p) => <Icon {...p} d={<><path d="M12 4v12"/><path d="M8 8l4-4 4 4"/><path d="M5 20h14"/></>} />,
  video:   (p) => <Icon {...p} d={<><rect x="3" y="6" width="13" height="12" rx="1.5"/><path d="M16 10l5-3v10l-5-3z"/></>} />,
  csv:     (p) => <Icon {...p} d={<><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 9h6M9 13h6M9 17h4"/></>} />,
  share:   (p) => <Icon {...p} d={<><circle cx="18" cy="5" r="2.4"/><circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="19" r="2.4"/><path d="M8 11l8-5M8 13l8 5"/></>} />,
  qr:      (p) => <Icon {...p} d={<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h2v2M20 14v3M14 18h3M17 20v1"/></>} />,
  trash:   (p) => <Icon {...p} d={<><path d="M5 7h14M10 7V5a1 1 0 011-1h2a1 1 0 011 1v2"/><path d="M7 7v12a1 1 0 001 1h8a1 1 0 001-1V7"/><path d="M10 11v6M14 11v6"/></>} />,
  edit:    (p) => <Icon {...p} d={<><path d="M4 20h4l11-11-4-4L4 16z"/><path d="M14 6l4 4"/></>} />,
  warn:    (p) => <Icon {...p} d={<><path d="M12 3l10 17H2z"/><path d="M12 10v4M12 17v.5"/></>} />,
  info:    (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 8v.5"/></>} />,
  clock:   (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></>} />,
  user:    (p) => <Icon {...p} d={<><circle cx="12" cy="9" r="3.4"/><path d="M5 19c1-3.4 3.6-5 7-5s6 1.6 7 5"/></>} />,
  copy:    (p) => <Icon {...p} d={<><rect x="8" y="8" width="12" height="12" rx="1.5"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/></>} />,
  mail:    (p) => <Icon {...p} d={<><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 7l9 7 9-7"/></>} />,
  sparkle: (p) => <Icon {...p} d={<><path d="M12 4l1.6 4.2L18 10l-4.4 1.8L12 16l-1.6-4.2L6 10l4.4-1.8z"/><path d="M19 4l.6 1.4L21 6l-1.4.6L19 8l-.6-1.4L17 6l1.4-.6z"/></>} />,
  cloud:   (p) => <Icon {...p} d={<><path d="M7 18a4 4 0 010-8 5 5 0 0110-1 4 4 0 011 8z"/></>} />,
  fullscr: (p) => <Icon {...p} d={<><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></>} />,
  vol:     (p) => <Icon {...p} d={<><path d="M4 10v4h3l4 3V7L7 10z"/><path d="M14 9a4 4 0 010 6"/></>} />,
  back:    (p) => <Icon {...p} d={<path d="M15 5l-7 7 7 7"/>} />,
  filter:  (p) => <Icon {...p} d={<><path d="M3 5h18l-7 9v6l-4-2v-4z"/></>} />,
};

// 同舟 brand mark — 篆刻印章感
const TZMark = ({ size = 24, color }) => (
  <div style={{
    width: size, height: size, borderRadius: 4,
    background: color || "var(--ink)", color: "var(--paper)",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--serif)", fontWeight: 600, fontSize: size * 0.5,
    letterSpacing: 0, lineHeight: 1,
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
  }}>舟</div>
);

// 醒春阁印 — 用于学员 H5
const XCMark = ({ size = 24, color }) => (
  <div style={{
    width: size, height: size, borderRadius: 4,
    background: color || "var(--seal)", color: "#fff",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--serif)", fontWeight: 600, fontSize: size * 0.46,
    lineHeight: 1,
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
  }}>春</div>
);

// 占位图：暖灰条纹 + 等宽文字说明
const Placeholder = ({ w = "100%", h = 120, label = "封面", radius = 8, dark = false, children }) => (
  <div style={{
    width: w, height: h, borderRadius: radius, position: "relative", overflow: "hidden",
    background: dark
      ? "repeating-linear-gradient(135deg, #1a1a1a 0 8px, #232323 8px 16px)"
      : "repeating-linear-gradient(135deg, oklch(0.94 0.012 80) 0 8px, oklch(0.92 0.014 80) 8px 16px)",
    color: dark ? "rgba(255,255,255,.55)" : "var(--ink-3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.04em",
    border: dark ? "1px solid #2a2a2a" : "1px solid var(--paper-edge)",
  }}>
    {children || label}
  </div>
);

// 进度条
const Bar = ({ value, max = 100, color = "var(--accent)", height = 6, danger }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const c = danger && pct > 80 ? "var(--danger)" : (pct > 80 ? "var(--warn)" : color);
  return (
    <div style={{
      height, width: "100%", background: "var(--paper-deep)",
      borderRadius: 999, overflow: "hidden",
    }}>
      <div style={{
        height: "100%", width: pct + "%",
        background: c, borderRadius: 999,
        transition: "width .3s ease",
      }} />
    </div>
  );
};

// Sparkline (mini chart)
const Sparkline = ({ values, w = 120, h = 32, color = "var(--accent)" }) => {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => [i * step, h - ((v - min) / span) * (h - 4) - 2]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const dArea = d + ` L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <path d={dArea} fill={color} opacity="0.12"/>
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// Watermark overlay — diagonal repeating
const WatermarkLayer = ({ text }) => (
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none",
    overflow: "hidden", opacity: 0.18,
    transform: "rotate(-22deg)",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gridAutoRows: "70px",
    alignContent: "center", justifyItems: "center",
    color: "#fff", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.05em",
    padding: "60px 0",
  }}>
    {Array.from({ length: 16 }).map((_, i) => <span key={i}>{text}</span>)}
  </div>
);

// 区块标题（带印章 + 副标）
const SectionLabel = ({ stamp, title, sub, right }) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      {stamp && <span className="tz-stamp" style={{ alignSelf: "center" }}>{stamp}</span>}
      <h3 className="tz-serif" style={{ margin: 0, fontSize: 16, fontWeight: 500, color: "var(--ink)" }}>{title}</h3>
      {sub && <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{sub}</span>}
    </div>
    {right}
  </div>
);

// 暴露到 window
Object.assign(window, {
  Icon, I, TZMark, XCMark, Placeholder, Bar, Sparkline, WatermarkLayer, SectionLabel,
});
