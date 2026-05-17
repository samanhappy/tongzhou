// 数据源 chip — 给页面右上角显示当前是 api 还是 mock
// 设计意图：开发期一眼判断,生产环境可以隐藏或挪到调试栏。

import type { Source } from "@/lib/source";

export function SourceChip({ source }: { source: Source }) {
  const isApi = source === "api";
  return (
    <span
      className="tz-chip"
      style={{
        fontFamily: "var(--mono)",
        background: isApi
          ? "color-mix(in oklch, var(--accent) 14%, #fff)"
          : "var(--paper-deep)",
        color: isApi ? "var(--accent-deep)" : "var(--ink-3)",
      }}
      title={
        isApi
          ? "数据来自 api/（Fastify + SQLite）"
          : "数据来自 lib/mock.ts — 设置环境变量 API_BASE 切换"
      }
    >
      数据源 · {source}
    </span>
  );
}
