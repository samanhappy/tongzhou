"use client";

// 学员退出登录
// POST 到 API 的 /api/x/:slug/auth/logout 后强制刷新当前页,
// SSR 会重新拉 /auth/me 拿到 401,降级为访客态。

import { useCallback, useState } from "react";

export function StudentLogoutButton({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false);

  const onClick = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetch(`/api/x/${encodeURIComponent(slug)}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // 无声忽略,登出失败不阻塞 UI
    } finally {
      if (typeof window !== "undefined") window.location.reload();
    }
  }, [busy, slug]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      style={{
        background: "transparent",
        border: "1px solid var(--paper-edge)",
        color: "var(--ink-3)",
        fontSize: 11.5,
        padding: "5px 10px",
        borderRadius: 6,
        cursor: busy ? "default" : "pointer",
        flex: "0 0 auto",
      }}
    >
      {busy ? "…" : "退出登录"}
    </button>
  );
}
