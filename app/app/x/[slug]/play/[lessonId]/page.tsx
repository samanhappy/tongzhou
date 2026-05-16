// 学员 H5 · 播放页（含手机号水印）
// V0 红线：水印来自 V0 文档「视频防盗链 + 学员手机号水印」
// 来自 design/student-h5.jsx · H5Player

import Link from "next/link";
import { notFound } from "next/navigation";
import { PhoneFrame } from "@/components/phone-frame";
import { I } from "@/components/icons";
import { Placeholder, WatermarkLayer } from "@/components/primitives";
import { studentLessons, tenant, watermarkPhone } from "@/lib/mock";

export default async function StudentPlayer({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  if (slug !== tenant.slug) notFound();

  const idx = studentLessons.findIndex((l) => l.id === lessonId);
  if (idx < 0) notFound();
  const lesson = studentLessons[idx];
  const prev = idx > 0 ? studentLessons[idx - 1] : null;
  const next = idx < studentLessons.length - 1 ? studentLessons[idx + 1] : null;

  return (
    <PhoneFrame>
      <div style={{ minHeight: "100%", background: "#0e0e0c", color: "#f0eee9" }}>
        {/* 顶部导航 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 16px",
            gap: 12,
            position: "relative",
            zIndex: 2,
          }}
        >
          <Link
            href={`/x/${slug}`}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: 0,
              borderRadius: 999,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f0eee9",
              flex: "0 0 auto",
            }}
          >
            <I.back size={15} />
          </Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {lesson.t}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
              {tenant.name} · 七天成长计划
            </div>
          </div>
          <button
            style={{ background: "transparent", border: 0, color: "#f0eee9" }}
          >
            <I.share size={16} />
          </button>
        </div>

        {/* 视频区 */}
        <div
          style={{
            position: "relative",
            aspectRatio: "16 / 10",
            overflow: "hidden",
            background: "#000",
          }}
        >
          <Placeholder w="100%" h="100%" radius={0} dark label="封面 · 春日小院" />

          {/* 水印 ——— V0 红线 */}
          <WatermarkLayer text={`${watermarkPhone} · ${tenant.name}`} />

          {/* 中央播放按钮 */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 999,
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
              }}
            >
              <I.play size={22} style={{ marginLeft: 3 }} />
            </div>
          </div>

          {/* 控件 */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              padding: "20px 14px 12px",
              background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.7))",
              color: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                fontSize: 10.5,
                fontFamily: "var(--mono)",
              }}
            >
              <span>07:08</span>
              <div
                style={{
                  flex: 1,
                  height: 3,
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: 999,
                }}
              >
                <div
                  style={{
                    width: "64%",
                    height: "100%",
                    background: "#fff",
                    borderRadius: 999,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: -5,
                      top: -3,
                      width: 9,
                      height: 9,
                      background: "#fff",
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
              <span style={{ opacity: 0.6 }}>11:02</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <I.pause size={18} />
              <I.vol size={16} style={{ opacity: 0.8 }} />
              <div
                style={{
                  fontSize: 11,
                  opacity: 0.7,
                  padding: "2px 8px",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 4,
                  fontFamily: "var(--mono)",
                }}
              >
                1.0×
              </div>
              <div style={{ flex: 1 }} />
              <div
                style={{
                  fontSize: 10.5,
                  opacity: 0.75,
                  fontFamily: "var(--mono)",
                }}
              >
                1080p
              </div>
              <I.fullscr size={16} style={{ opacity: 0.8 }} />
            </div>
          </div>

          {/* 防盗链 */}
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 12,
              background: "rgba(0,0,0,0.6)",
              color: "rgba(255,255,255,0.8)",
              padding: "4px 8px",
              borderRadius: 4,
              fontSize: 10,
              fontFamily: "var(--mono)",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <I.clock size={11} /> 6h playAuth
          </div>
        </div>

        {/* 下方内容 */}
        <div
          style={{
            padding: "20px 18px 100px",
            background: "var(--paper)",
            color: "var(--ink)",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            marginTop: -12,
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span className="tz-chip is-accent" style={{ fontSize: 10 }}>
              第{lesson.n}日 · {String(idx + 1).padStart(2, "0")} /{" "}
              {String(studentLessons.length).padStart(2, "0")}
            </span>
            <span
              style={{
                fontSize: 10.5,
                color: "var(--ink-3)",
                fontFamily: "var(--mono)",
              }}
            >
              5/16 · 已看 {lesson.progress ?? 0}%
            </span>
          </div>

          <h2
            className="tz-serif"
            style={{ margin: "0 0 6px", fontSize: 19, fontWeight: 500 }}
          >
            见物 · 把一件物写到能闻见
          </h2>
          <p
            style={{
              margin: "0 0 16px",
              fontSize: 12.5,
              color: "var(--ink-2)",
              lineHeight: 1.7,
            }}
          >
            今日的练习是：选一件你今早遇到的、并不起眼的物件——一杯水、一把椅子、窗边一束光——
            用 300 字把它写到能闻见、能摸到、能听到声音。
            <i>不评价，只描述。</i>
          </p>

          <div
            style={{
              padding: "10px 12px",
              background: "var(--paper-deep)",
              border: "1px solid var(--paper-edge)",
              borderRadius: 6,
              fontSize: 10.5,
              color: "var(--ink-3)",
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <I.info size={12} style={{ marginTop: 1, flex: "0 0 auto" }} />
            <span>
              视频带有你的<b style={{ color: "var(--ink-2)" }}>手机号水印</b>
              用于版权保护 · 链接 6 小时后将自动失效，可随时回到本页重启。
            </span>
          </div>

          {/* 上下课时 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 18,
            }}
          >
            <PrevNextButton type="prev" item={prev} slug={slug} />
            <PrevNextButton type="next" item={next} slug={slug} />
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function PrevNextButton({
  type,
  item,
  slug,
}: {
  type: "prev" | "next";
  item: (typeof studentLessons)[number] | null;
  slug: string;
}) {
  const isNext = type === "next";
  const disabled = !item || item.status === "locked";
  const baseStyle: React.CSSProperties = {
    padding: 12,
    border: isNext ? "0" : "1px solid var(--paper-edge)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: isNext ? "var(--ink)" : "#fff",
    color: isNext ? "#fff" : "var(--ink)",
    textAlign: isNext ? "right" : "left",
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    textDecoration: "none",
  };

  const inner = (
    <>
      {!isNext && <I.chevL size={14} style={{ color: "var(--ink-3)" }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: "var(--ink-3)", opacity: isNext ? 0.6 : 1 }}>
          {isNext ? "下一课时" : "上一课时"}
        </div>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item?.t || "—"}
        </div>
      </div>
      {isNext && <I.chevR size={14} style={{ opacity: 0.6 }} />}
    </>
  );

  if (disabled || !item) {
    return <button style={baseStyle} disabled>{inner}</button>;
  }
  return (
    <Link href={`/x/${slug}/play/${item.id}`} style={baseStyle}>
      {inner}
    </Link>
  );
}
