// 学员 H5 · 播放页（含手机号水印）
// V0 红线：水印来自 V0 文档「视频防盗链 + 学员手机号水印」
// 来自 design/student-h5.jsx · H5Player
//
// 数据走 lib/source.ts

import Link from "next/link";
import { notFound } from "next/navigation";
import { I } from "@/components/icons";
import { H5VideoPlayer } from "@/components/h5-video-player";
import { SourceChip } from "@/components/source-chip";
import { getStudentLesson } from "@/lib/source";

export default async function StudentPlayer({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const data = await getStudentLesson(slug, lessonId);
  if (!data) notFound();

  const { tenant, lesson, prev, next, watermarkPhone, play, source } = data;

  const playUrl = play.kind === "ok" ? play.playUrl : null;
  const playMime = play.kind === "ok" ? play.mime : undefined;
  const lockState =
    play.kind === "ok" || play.kind === "error" ? null : play.kind;
  const loginHref = `/x/${slug}/login?next=${encodeURIComponent(
    `/x/${slug}/play/${lesson.id}`,
  )}`;

  return (
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
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.55)",
              marginTop: 2,
            }}
          >
            {tenant.name} · 七天成长计划
          </div>
        </div>
        <SourceChip source={source} />
        <button
          style={{ background: "transparent", border: 0, color: "#f0eee9" }}
        >
          <I.share size={16} />
        </button>
      </div>

      {/* 视频区 */}
      <H5VideoPlayer
        key={playUrl ?? `${lesson.id}:${play.kind}`}
        src={playUrl}
        mime={playMime}
        watermarkText={`${watermarkPhone} · ${tenant.name}`}
        posterLabel={`封面 · ${lesson.t}`}
        fallbackDurationText={lesson.d}
        lockState={lockState}
        loginHref={loginHref}
      />

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
            第{lesson.n}日
          </span>
          {lesson.progress != null && (
            <span
              style={{
                fontSize: 10.5,
                color: "var(--ink-3)",
                fontFamily: "var(--mono)",
              }}
            >
              已看 {lesson.progress}%
            </span>
          )}
        </div>

        <h2
          className="tz-serif"
          style={{ margin: "0 0 6px", fontSize: 19, fontWeight: 500 }}
        >
          {lesson.t}
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
          用 300 字把它写到能闻见、能摸到、能听到声音。<i>不评价，只描述。</i>
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
  );
}

function PrevNextButton({
  type,
  item,
  slug,
}: {
  type: "prev" | "next";
  item: { id: string; t: string; status: string } | null;
  slug: string;
}) {
  const isNext = type === "next";
  const disabled =
    !item ||
    item.status === "locked" ||
    item.status === "draft" ||
    item.status === "failed";
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
        <div
          style={{
            fontSize: 10,
            color: "var(--ink-3)",
            opacity: isNext ? 0.6 : 1,
          }}
        >
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
    return (
      <button style={baseStyle} disabled>
        {inner}
      </button>
    );
  }
  return (
    <Link href={`/x/${slug}/play/${item.id}`} style={baseStyle}>
      {inner}
    </Link>
  );
}
