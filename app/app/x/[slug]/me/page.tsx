// 学员 H5 · 「我的」抽屉
// 可选绑定手机号；不绑定时进度仅保存在本设备
// 来自 design/student-h5.jsx · H5Me

import Link from "next/link";
import { notFound } from "next/navigation";
import { PhoneFrame } from "@/components/phone-frame";
import { I } from "@/components/icons";
import { Bar, Placeholder } from "@/components/primitives";
import { tenant } from "@/lib/mock";

export default async function StudentMe({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== tenant.slug) notFound();

  return (
    <PhoneFrame>
      <div className="tz-paper" style={{ minHeight: "100%", paddingBottom: 100 }}>
        <div
          style={{
            padding: "20px 18px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Link
            href={`/x/${slug}`}
            style={{
              background: "transparent",
              border: 0,
              color: "var(--ink-2)",
              display: "inline-flex",
            }}
          >
            <I.back size={16} />
          </Link>
          <span className="tz-serif" style={{ fontSize: 15, fontWeight: 500 }}>
            我的
          </span>
        </div>

        {/* 当前身份 */}
        <div style={{ padding: "0 18px" }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid var(--paper-edge)",
              borderRadius: 12,
              padding: "18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 999,
                background: "var(--paper-deep)",
                color: "var(--ink-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--serif)",
                fontSize: 22,
                flex: "0 0 auto",
              }}
            >
              ?
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>访客身份</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>
                当前进度仅保存在本设备
              </div>
            </div>
          </div>

          {/* 绑定提示 */}
          <div
            style={{
              marginTop: 14,
              padding: "16px",
              background: "var(--accent-soft)",
              border: "1px solid color-mix(in oklch, var(--accent) 18%, transparent)",
              borderRadius: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <I.sparkle
                size={16}
                style={{ color: "var(--accent-deep)", marginTop: 1, flex: "0 0 auto" }}
              />
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--accent-deep)",
                  }}
                >
                  绑定手机号 · 跨设备同步
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--accent-deep)",
                    opacity: 0.85,
                    marginTop: 4,
                    lineHeight: 1.6,
                  }}
                >
                  绑定后，你的进度可以在手机、平板、桌面上继续看。完全可选。
                </div>
              </div>
            </div>
            <button
              style={{
                marginTop: 12,
                width: "100%",
                padding: "10px",
                background: "var(--accent-ink)",
                color: "#fff",
                border: 0,
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 500,
              }}
            >
              绑定手机号
            </button>
          </div>

          {/* 看过的 */}
          <div style={{ marginTop: 24 }}>
            <h3
              className="tz-serif"
              style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 500 }}
            >
              我看过的课程
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link
                href={`/x/${slug}`}
                style={{
                  background: "#fff",
                  border: "1px solid var(--paper-edge)",
                  borderRadius: 10,
                  padding: 12,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  color: "inherit",
                }}
              >
                <Placeholder w={60} h={60} radius={6} label="" />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      marginBottom: 3,
                    }}
                  >
                    七天成长计划 · 习作启蒙
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "var(--ink-3)",
                      marginBottom: 8,
                    }}
                  >
                    {tenant.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <Bar value={28} />
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        color: "var(--ink-2)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      28%
                    </span>
                  </div>
                </div>
              </Link>
              <div
                style={{
                  padding: "30px 12px",
                  textAlign: "center",
                  fontSize: 11.5,
                  color: "var(--ink-3)",
                  border: "1px dashed var(--paper-edge)",
                  borderRadius: 10,
                }}
              >
                通过分享链接打开更多课程
                <br />
                <span style={{ fontSize: 10.5, color: "var(--ink-4)" }}>
                  · V0 不支持课程目录浏览 ·
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              fontSize: 10.5,
              color: "var(--ink-4)",
              textAlign: "center",
              lineHeight: 1.8,
            }}
          >
            由 同舟 提供轻量化课程交付
            <br />
            隐私 · 服务条款 · 反馈
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
