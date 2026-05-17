// PhoneFrame — 桌面预览时给学员 H5 套一个 iOS 边框
// 移动端默认全屏。

"use client";

import { useEffect, useState, type ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const update = () =>
      setIsWide(window.matchMedia("(min-width: 720px)").matches);
    update();
    const mq = window.matchMedia("(min-width: 720px)");
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!isWide) return <>{children}</>;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 50% 0%, oklch(0.96 0.014 80), var(--paper-deep))",
        padding: 40,
      }}
    >
      <div
        style={{
          width: 390,
          height: 844,
          borderRadius: 44,
          background: "#000",
          padding: 10,
          boxShadow:
            "0 30px 60px -20px rgba(40,30,20,0.25), 0 0 0 1px rgba(40,30,20,0.15)",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 34,
            overflow: "auto",
            background: "var(--paper)",
            position: "relative",
          }}
        >
          {/* 状态栏 */}
          <div
            style={{
              height: 44,
              padding: "0 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: "system-ui",
              fontWeight: 600,
              fontSize: 14,
              color: "var(--ink)",
              position: "sticky",
              top: 0,
              zIndex: 10,
              background: "var(--paper)",
            }}
          >
            <span>9:41</span>
            <div
              style={{
                width: 100,
                height: 28,
                borderRadius: 999,
                background: "#000",
                position: "absolute",
                left: "50%",
                top: 10,
                transform: "translateX(-50%)",
              }}
            />
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <svg width="17" height="11" viewBox="0 0 17 11">
                <rect
                  x="0"
                  y="7"
                  width="3"
                  height="4"
                  rx="0.5"
                  fill="currentColor"
                />
                <rect
                  x="4.5"
                  y="5"
                  width="3"
                  height="6"
                  rx="0.5"
                  fill="currentColor"
                />
                <rect
                  x="9"
                  y="2.5"
                  width="3"
                  height="8.5"
                  rx="0.5"
                  fill="currentColor"
                />
                <rect
                  x="13.5"
                  y="0"
                  width="3"
                  height="11"
                  rx="0.5"
                  fill="currentColor"
                />
              </svg>
              <svg width="25" height="11" viewBox="0 0 25 11">
                <rect
                  x="0.5"
                  y="0.5"
                  width="21"
                  height="10"
                  rx="2.5"
                  stroke="currentColor"
                  fill="none"
                />
                <rect
                  x="2"
                  y="2"
                  width="18"
                  height="7"
                  rx="1.5"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
