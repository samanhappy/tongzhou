"use client";

// 复制学员分享链接按钮
// 点击时优先拼出绝对 URL（基于当前 window.location.origin），写入剪贴板。
// 浏览器不支持 Clipboard API 时回退到 document.execCommand("copy")。

import { useCallback, useState } from "react";
import { I } from "@/components/icons";

type State = "idle" | "ok" | "err";

export function CopyShareLinkButton({
  slug,
  label = "复制本期分享链接",
}: {
  slug: string;
  label?: string;
}) {
  const [state, setState] = useState<State>("idle");

  const onClick = useCallback(async () => {
    const path = `/x/${encodeURIComponent(slug)}`;
    const url =
      typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

    const ok = await writeClipboard(url);
    setState(ok ? "ok" : "err");
    window.setTimeout(() => setState("idle"), 2000);
  }, [slug]);

  const text =
    state === "ok" ? "已复制 ✓" : state === "err" ? "复制失败" : label;

  return (
    <button
      type="button"
      className="tz-btn"
      onClick={onClick}
      aria-live="polite"
    >
      <I.share size={14} /> {text}
    </button>
  );
}

async function writeClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through
    }
  }
  if (typeof document === "undefined") return false;
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
