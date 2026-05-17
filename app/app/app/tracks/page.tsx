// 创作者后台 · 课程列表（V0 极简版）
//
// 数据源：环境变量 API_BASE 设置时走真后端（api/ Fastify + SQLite）,
// 否则回退到 lib/mock.ts。
// roadmap 中"课程"= Track。V0 隐藏 Stage 层，UI 只展示 Course / Lesson。

import Link from "next/link";
import { CreatorShell } from "@/components/shell";
import { SourceChip } from "@/components/source-chip";
import { getSourceLabel, getTracks } from "@/lib/source";
import { TracksClient } from "./tracks-client";

export default async function TracksPage() {
  const tracks = await getTracks();
  const source = getSourceLabel();

  return (
    <CreatorShell title="课程" breadcrumb={["醒春阁", "交付"]}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: -10, marginBottom: 14 }}>
        <SourceChip source={source} />
      </div>

      <TracksClient initialTracks={tracks} source={source} />
    </CreatorShell>
  );
}
