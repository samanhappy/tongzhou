// 创作者后台 · 课程编辑（V0：课时拖拽 + 上传/转码模拟）
//
// 数据来自 lib/mock.ts，但因为有交互（拖拽 + 上传模拟）整页是客户端组件。

import { notFound } from "next/navigation";
import { CreatorShell } from "@/components/shell";
import { I } from "@/components/icons";
import { Placeholder, SectionLabel } from "@/components/primitives";
import { getTrack } from "@/lib/mock";
import { CourseEditClient } from "./client";

export default async function TrackEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const track = getTrack(id);
  if (!track) notFound();

  return (
    <CreatorShell
      title={`${track.title} · ${track.subtitle}`}
      breadcrumb={["醒春阁", "课程", `${track.title} · ${track.subtitle}`]}
      actions={
        <>
          <button className="tz-btn">
            <I.share size={14} /> 分享
          </button>
          <button className="tz-btn tz-btn-primary">
            <I.check size={14} /> 发布修改
          </button>
        </>
      }
    >
      {/* 子导航 */}
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--paper-line)",
          marginBottom: 22,
          marginTop: -10,
        }}
      >
        {[
          { k: "overview", l: "概览" },
          { k: "sessions", l: "课时", active: true },
          { k: "enroll", l: "报名" },
          { k: "settings", l: "设置" },
        ].map((t) => (
          <button
            key={t.k}
            className="tz-btn tz-btn-ghost"
            style={{
              borderRadius: 0,
              padding: "8px 12px",
              color: t.active ? "var(--ink)" : "var(--ink-3)",
              borderBottom: t.active
                ? "2px solid var(--accent)"
                : "2px solid transparent",
              marginBottom: -1,
              fontWeight: t.active ? 500 : 400,
            }}
          >
            {t.l}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        {/* 主：课时列表 */}
        <div>
          {/* 概览条 */}
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: 14,
              marginBottom: 18,
              padding: 16,
              background: "#fff",
              border: "1px solid var(--paper-edge)",
              borderRadius: 10,
            }}
          >
            <Placeholder w={88} h={88} radius={6} label="课程封面" />
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <h2
                    className="tz-serif"
                    style={{ margin: 0, fontSize: 19, fontWeight: 500 }}
                  >
                    {track.title} · {track.subtitle}
                  </h2>
                  <span className="tz-chip is-accent">已发布</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "var(--ink-2)", maxWidth: 540 }}>
                  {track.oneLine}
                </p>
              </div>
              <div style={{ display: "flex", gap: 22, fontSize: 11.5 }}>
                <span>
                  <b style={{ fontVariantNumeric: "tabular-nums" }}>{track.lessons.length}</b>{" "}
                  <span style={{ color: "var(--ink-3)" }}>课时</span>
                </span>
                <span>
                  <b style={{ fontVariantNumeric: "tabular-nums" }}>{track.totalMinutes} min</b>{" "}
                  <span style={{ color: "var(--ink-3)" }}>总时长</span>
                </span>
                <span>
                  <b style={{ fontVariantNumeric: "tabular-nums" }}>
                    {track.cumulativeViewers}
                  </b>{" "}
                  <span style={{ color: "var(--ink-3)" }}>累计观看人</span>
                </span>
                <span>
                  <b style={{ fontVariantNumeric: "tabular-nums" }}>
                    {track.completionRate}%
                  </b>{" "}
                  <span style={{ color: "var(--ink-3)" }}>完播率</span>
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button className="tz-btn">
                <I.qr size={13} /> 海报二维码
              </button>
              <button className="tz-btn">
                <I.copy size={13} /> 复制链接
              </button>
            </div>
          </div>

          {/* 课时列表（含拖拽 + 上传模拟）— 客户端组件 */}
          <SectionLabel
            stamp="时"
            title="课时"
            sub={`共 ${track.lessons.length} 节 · 拖拽调整顺序`}
            right={
              <button className="tz-btn">
                <I.plus size={13} /> 新增课时
              </button>
            }
          />
          <CourseEditClient initial={track.lessons} />
        </div>

        {/* 侧栏：上传队列 + 防盗链 + V0 简化说明 */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <UploadQueueCard />
          <PlaybackProtectionCard />
          <V0NoticeCard />
        </aside>
      </div>
    </CreatorShell>
  );
}

function UploadQueueCard() {
  return (
    <div className="tz-card" style={{ padding: 14 }}>
      <SectionLabel title="上传队列" sub="2 进行中" />
      <UploadRow
        name="第三日·见人.mp4"
        size="412 MB"
        prog={64}
        phase="uploading"
        eta="2 min 余"
      />
      <UploadRow
        name="第四日·见事.mp4"
        size="528 MB"
        prog={38}
        phase="transcoding"
        eta="转码 · 约 3 min"
      />
      <UploadRow
        name="第六日·见旧.mp4"
        size="—"
        prog={100}
        phase="failed"
        eta="编码不兼容"
      />
    </div>
  );
}

function UploadRow({
  name,
  size,
  prog,
  phase,
  eta,
}: {
  name: string;
  size: string;
  prog: number;
  phase: "uploading" | "transcoding" | "failed";
  eta: string;
}) {
  const color =
    phase === "failed"
      ? "var(--danger)"
      : phase === "transcoding"
        ? "var(--warn)"
        : "var(--accent)";
  return (
    <div style={{ padding: "10px 0", borderTop: "1px solid var(--paper-line)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <I.video size={13} style={{ color: "var(--ink-3)" }} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontSize: 10.5,
            color: "var(--ink-3)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {size}
        </span>
      </div>
      <div style={{ marginTop: 7 }}>
        <div
          style={{
            height: 4,
            background: "var(--paper-deep)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${prog}%`,
              height: "100%",
              background: color,
              borderRadius: 999,
              transition: "width .3s ease",
            }}
          />
        </div>
      </div>
      <div
        style={{
          marginTop: 5,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10.5,
          color: "var(--ink-3)",
        }}
      >
        <span style={{ color }}>
          {phase === "uploading" && `上传中 · ${Math.round(prog)}%`}
          {phase === "transcoding" && `转码中 · ${Math.round(prog)}%`}
          {phase === "failed" && `失败 · 编码不兼容`}
        </span>
        <span>{eta}</span>
      </div>
    </div>
  );
}

function PlaybackProtectionCard() {
  return (
    <div className="tz-card" style={{ padding: 14 }}>
      <SectionLabel title="播放保护" />
      <Toggle label="限时 playAuth" desc="链接 6 小时失效" on />
      <Toggle label="学员手机号水印" desc="斜向 22°, 自动平铺" on />
      <Toggle label="禁右键 / 选择" desc="对常见盗录有限作用" on={false} />
      <div
        style={{
          marginTop: 8,
          paddingTop: 10,
          borderTop: "1px solid var(--paper-line)",
          fontSize: 11,
          color: "var(--ink-3)",
        }}
      >
        已对接 <b style={{ color: "var(--ink-2)" }}>阿里云 VOD</b> · 1080p 转码 · 边播边转
      </div>
    </div>
  );
}

function V0NoticeCard() {
  return (
    <div
      className="tz-card"
      style={{
        padding: 14,
        background: "var(--accent-soft)",
        border: "1px solid color-mix(in oklch, var(--accent) 20%, transparent)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          color: "var(--accent-deep)",
          fontSize: 11.5,
        }}
      >
        <I.sparkle size={14} style={{ marginTop: 1, flex: "0 0 auto" }} />
        <div>
          <b>V0 简化：</b> 课时直挂在课程下；到 V1 会启用「成长路径 · Stage」分组，
          已上传内容会自动归入"未分组"，无需迁移。
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, desc, on }: { label: string; desc: string; on: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 0",
        borderTop: "1px solid var(--paper-line)",
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 1 }}>{desc}</div>
      </div>
      <div
        style={{
          width: 30,
          height: 17,
          borderRadius: 999,
          padding: 2,
          background: on ? "var(--accent)" : "var(--ink-4)",
          display: "flex",
          alignItems: "center",
          justifyContent: on ? "flex-end" : "flex-start",
          transition: "background .15s",
        }}
      >
        <div style={{ width: 13, height: 13, borderRadius: 999, background: "#fff" }} />
      </div>
    </div>
  );
}
