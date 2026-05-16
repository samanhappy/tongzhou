// 学员 H5 通用品牌头（来自 design/student-h5.jsx · H5Brand）

import { XCMark } from "./primitives";

export function H5Brand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <XCMark size={22} />
        <span className="tz-serif" style={{ fontSize: 15, fontWeight: 500 }}>醒春阁</span>
      </div>
    );
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: "36px 0 22px",
      }}
    >
      <XCMark size={56} />
      <div style={{ textAlign: "center" }}>
        <div
          className="tz-serif"
          style={{ fontSize: 22, fontWeight: 500, letterSpacing: "0.05em" }}
        >
          醒春阁
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--ink-3)",
            marginTop: 5,
            letterSpacing: "0.1em",
          }}
        >
          XING · CHUN · GE
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-2)",
            marginTop: 14,
            padding: "0 32px",
            lineHeight: 1.6,
          }}
        >
          七天清晨的写作陪跑 ——
          <br />
          一念一札，从见我到见今。
        </div>
      </div>
    </div>
  );
}
