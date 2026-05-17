// 课程编辑 · 客户端组件
// 课时拖拽排序 + 上传/转码进度模拟（来自 design/creator-course-edit.jsx）

"use client";

import { useEffect, useState } from "react";
import { I } from "@/components/icons";
import { Bar, Placeholder } from "@/components/primitives";
import type { Lesson } from "@/lib/mock";

export function CourseEditClient({ initial }: { initial: Lesson[] }) {
  const [items, setItems] = useState<Lesson[]>(initial);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const onDragStart = (e: React.DragEvent, i: number) => {
    setDragIdx(i);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    setOverIdx(i);
  };
  const onDrop = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx == null || dragIdx === i) return;
    const next = [...items];
    const [m] = next.splice(dragIdx, 1);
    next.splice(i, 0, m);
    setItems(next);
    setDragIdx(null);
    setOverIdx(null);
  };

  // 模拟上传 / 转码进度
  useEffect(() => {
    const id = setInterval(() => {
      setItems((arr) =>
        arr.map((it) => {
          if (it.status === "uploading" && (it.progress ?? 0) < 100) {
            return { ...it, progress: Math.min(100, (it.progress ?? 0) + 1.2) };
          }
          if (it.status === "transcoding" && (it.progress ?? 0) < 100) {
            return { ...it, progress: Math.min(100, (it.progress ?? 0) + 0.4) };
          }
          return it;
        }),
      );
    }, 220);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* 表头 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "20px 64px 1fr 90px 140px 60px",
          gap: 14,
          padding: "0 14px 6px",
          fontSize: 10.5,
          color: "var(--ink-3)",
          letterSpacing: "0.08em",
        }}
      >
        <span></span>
        <span>视频</span>
        <span>标题 / 简介</span>
        <span style={{ textAlign: "right" }}>观看</span>
        <span>状态</span>
        <span></span>
      </div>

      {items.map((it, i) => (
        <LessonRow
          key={it.id}
          idx={i}
          item={it}
          dragging={dragIdx === i}
          dropTarget={overIdx === i && dragIdx !== null && dragIdx !== i}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
      ))}

      {/* Drop zone */}
      <div
        style={{
          marginTop: 6,
          padding: "20px 16px",
          border: "1.5px dashed var(--paper-edge)",
          borderRadius: 8,
          background: "var(--paper-deep)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          color: "var(--ink-2)",
          fontSize: 12.5,
        }}
      >
        <I.upload size={16} style={{ color: "var(--accent)" }} />
        <span>把视频拖到这里上传 · 单文件 ≤ 2 GB · OSS 直传</span>
        <span style={{ color: "var(--ink-4)" }}>—</span>
        <button
          className="tz-btn"
          style={{ padding: "5px 10px", fontSize: 12 }}
        >
          选择文件
        </button>
      </div>
    </>
  );
}

function LessonRow({
  idx,
  item,
  dragging,
  dropTarget,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  idx: number;
  item: Lesson;
  dragging: boolean;
  dropTarget: boolean;
  onDragStart: (e: React.DragEvent, i: number) => void;
  onDragOver: (e: React.DragEvent, i: number) => void;
  onDrop: (e: React.DragEvent, i: number) => void;
}) {
  const status = item.status;
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, idx)}
      onDragOver={(e) => onDragOver(e, idx)}
      onDrop={(e) => onDrop(e, idx)}
      style={{
        display: "grid",
        gridTemplateColumns: "20px 64px 1fr 90px 140px 60px",
        gap: 14,
        alignItems: "center",
        padding: "12px 14px",
        background: dragging
          ? "#fff"
          : dropTarget
            ? "var(--accent-soft)"
            : "#fff",
        border: dropTarget
          ? "1px dashed var(--accent)"
          : "1px solid var(--paper-edge)",
        borderRadius: 8,
        marginBottom: 8,
        opacity: dragging ? 0.5 : 1,
        cursor: "default",
        transition: "background .12s",
      }}
    >
      <span
        style={{
          color: "var(--ink-4)",
          cursor: "grab",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <I.grip size={16} />
      </span>
      <div style={{ position: "relative" }}>
        <Placeholder w={64} h={40} radius={4} label="" />
        {status === "uploading" || status === "transcoding" ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 4,
              background: "rgba(20,18,15,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <I.upload size={12} />
          </div>
        ) : status === "draft" ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 4,
              background: "rgba(20,18,15,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 9,
              letterSpacing: "0.1em",
            }}
          >
            未发布
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              left: 4,
              bottom: 3,
              padding: "1px 4px",
              borderRadius: 2,
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              fontSize: 9,
              fontFamily: "var(--mono)",
              lineHeight: 1.2,
            }}
          >
            {item.durationText}
          </div>
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 500,
            marginBottom: 2,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10.5,
              color: "var(--ink-3)",
            }}
          >
            {String(idx + 1).padStart(2, "0")}
          </span>
          {item.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--ink-3)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.summary}
        </div>
      </div>
      <div
        style={{
          fontSize: 11.5,
          color: "var(--ink-2)",
          fontVariantNumeric: "tabular-nums",
          textAlign: "right",
        }}
      >
        {status === "published" ? `观看 ${item.views}` : "—"}
      </div>
      <div>
        {status === "published" && (
          <span className="tz-chip is-accent">
            <I.check size={10} /> 已发布
          </span>
        )}
        {status === "draft" && <span className="tz-chip">草稿</span>}
        {status === "uploading" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontSize: 10.5,
                color: "var(--accent-deep)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              上传中 · {Math.round(item.progress ?? 0)}%
            </span>
            <Bar value={item.progress ?? 0} height={4} />
          </div>
        )}
        {status === "transcoding" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontSize: 10.5,
                color: "var(--warn)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              转码中 · {Math.round(item.progress ?? 0)}%
            </span>
            <Bar value={item.progress ?? 0} height={4} color="var(--warn)" />
          </div>
        )}
        {status === "failed" && (
          <span
            className="tz-chip"
            style={{
              color: "var(--danger)",
              background: "color-mix(in oklch, var(--danger) 10%, #fff)",
            }}
          >
            转码失败
          </span>
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          color: "var(--ink-3)",
        }}
      >
        <button className="tz-btn tz-btn-ghost" style={{ padding: 6 }}>
          <I.edit size={13} />
        </button>
        <button className="tz-btn tz-btn-ghost" style={{ padding: 6 }}>
          <I.trash size={13} />
        </button>
      </div>
    </div>
  );
}
