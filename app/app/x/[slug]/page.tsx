// 学员 H5 · 落地页（分享链接进来后的第一屏）
// 来自 design/student-h5.jsx · H5Landing
// /x/[slug] — slug 对应 Tenant.slug

import Link from "next/link";
import { notFound } from "next/navigation";
import { PhoneFrame } from "@/components/phone-frame";
import { H5Brand } from "@/components/h5-brand";
import { I } from "@/components/icons";
import { Bar } from "@/components/primitives";
import { studentLessons, tenant, tracks } from "@/lib/mock";

export default async function StudentLanding({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug !== tenant.slug) notFound();

  const track = tracks[0];
  const continueLesson = studentLessons.find((l) => l.status === "playing");
  const doneCount = studentLessons.filter((l) => l.status === "done").length;

  return (
    <PhoneFrame>
      <div className="tz-paper" style={{ minHeight: "100%", paddingBottom: 100 }}>
        <H5Brand />

        <div style={{ padding: "0 18px" }}>
          {/* 课程卡 */}
          <div
            style={{
              position: "relative",
              background:
                "linear-gradient(180deg, var(--accent-ink) 0%, oklch(0.32 0.05 162) 100%)",
              color: "#fff",
              borderRadius: 12,
              padding: "20px 18px",
              overflow: "hidden",
            }}
          >
            <div
              className="tz-vt"
              style={{
                position: "absolute",
                right: 12,
                top: 14,
                bottom: 14,
                fontSize: 11,
                color: "rgba(255,255,255,0.32)",
                letterSpacing: "0.6em",
              }}
            >
              七日成长
            </div>

            <span
              className="tz-chip is-seal"
              style={{
                background: "rgba(255,255,255,0.14)",
                color: "#fff",
                border: 0,
              }}
            >
              <I.sparkle size={10} /> 限定 · 第 3 期
            </span>
            <h1
              className="tz-serif"
              style={{
                margin: "12px 0 8px",
                fontSize: 22,
                fontWeight: 500,
                lineHeight: 1.3,
                maxWidth: "85%",
              }}
            >
              {track.title}
              <br />
              <span style={{ fontSize: 16, opacity: 0.78 }}>· {track.subtitle} ·</span>
            </h1>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 12,
                opacity: 0.8,
                maxWidth: "78%",
                lineHeight: 1.65,
              }}
            >
              {track.oneLine}
            </p>
            <div style={{ display: "flex", gap: 16, fontSize: 11, opacity: 0.8 }}>
              <span>
                <b style={{ fontVariantNumeric: "tabular-nums" }}>
                  {track.lessons.length}
                </b>{" "}
                节
              </span>
              <span>
                <b style={{ fontVariantNumeric: "tabular-nums" }}>
                  {track.totalMinutes}
                </b>{" "}
                分钟
              </span>
              <span>
                <b style={{ fontVariantNumeric: "tabular-nums" }}>
                  {track.cumulativeViewers}
                </b>{" "}
                位同伴在学
              </span>
            </div>
          </div>

          {/* 继续上次 */}
          {continueLesson && (
            <Link
              href={`/x/${tenant.slug}/play/${continueLesson.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 14,
                background: "#fff",
                border: "1px solid var(--paper-edge)",
                borderRadius: 8,
                padding: "12px 14px",
                color: "inherit",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--ink-3)",
                    marginBottom: 3,
                  }}
                >
                  继续从上次的地方
                </div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{continueLesson.t}</div>
                <div style={{ marginTop: 8 }}>
                  <Bar value={continueLesson.progress ?? 0} />
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  border: 0,
                  background: "var(--accent-ink)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 auto",
                }}
              >
                <I.play size={16} />
              </div>
            </Link>
          )}

          {/* 课时列表 */}
          <div style={{ marginTop: 22 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <h3
                className="tz-serif"
                style={{ margin: 0, fontSize: 16, fontWeight: 500 }}
              >
                课时
              </h3>
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
                共 {studentLessons.length} 节 · 已完成 {doneCount}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {studentLessons.map((l) => {
                const inner = (
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid var(--paper-edge)",
                      borderRadius: 10,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      opacity: l.status === "locked" ? 0.45 : 1,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        flex: "0 0 auto",
                        borderRadius: 999,
                        background:
                          l.status === "playing"
                            ? "var(--accent-ink)"
                            : l.status === "done"
                              ? "var(--paper-deep)"
                              : l.status === "locked"
                                ? "var(--paper-deep)"
                                : "var(--accent-soft)",
                        color:
                          l.status === "playing"
                            ? "#fff"
                            : l.status === "done"
                              ? "var(--accent)"
                              : l.status === "locked"
                                ? "var(--ink-4)"
                                : "var(--accent-deep)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                      }}
                    >
                      {l.status === "done" ? (
                        <I.check size={14} />
                      ) : l.status === "playing" ? (
                        <I.play size={11} />
                      ) : l.status === "locked" ? (
                        <I.lock size={12} />
                      ) : (
                        String(l.n).padStart(2, "0")
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: l.status === "playing" ? 500 : 400,
                          color:
                            l.status === "playing"
                              ? "var(--accent-deep)"
                              : "var(--ink)",
                        }}
                      >
                        {l.t}
                      </div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: "var(--ink-3)",
                          marginTop: 3,
                          fontFamily: "var(--mono)",
                        }}
                      >
                        {l.status === "locked" ? "未开放" : l.d}
                        {l.status === "playing" && ` · 已看 ${l.progress}%`}
                      </div>
                    </div>
                    {l.status !== "locked" && (
                      <I.chevR size={14} style={{ color: "var(--ink-4)" }} />
                    )}
                  </div>
                );
                return l.status === "locked" ? (
                  <div key={l.n}>{inner}</div>
                ) : (
                  <Link
                    key={l.n}
                    href={`/x/${tenant.slug}/play/${l.id}`}
                    style={{ color: "inherit" }}
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 加群联系 */}
          <div style={{ marginTop: 26 }}>
            <a
              href={tenant.groupLink}
              target="_blank"
              rel="noreferrer"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 10,
                background: "var(--paper-deep)",
                border: "1px solid var(--paper-edge)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--ink)",
              }}
            >
              <I.qr size={15} />
              加群联系老师
            </a>
            <div
              style={{
                textAlign: "center",
                fontSize: 10.5,
                color: "var(--ink-3)",
                marginTop: 10,
                lineHeight: 1.7,
              }}
            >
              由 <b style={{ color: "var(--ink-2)" }}>同舟</b> 提供轻量化课程交付 · v0.3
            </div>
            <div style={{ textAlign: "center", marginTop: 6 }}>
              <Link
                href={`/x/${tenant.slug}/me`}
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  textDecoration: "underline",
                }}
              >
                我的（绑定手机号 · 跨设备同步）
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
