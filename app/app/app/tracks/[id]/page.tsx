// 创作者后台 · 课程编辑（V0：课时拖拽 + 上传/转码模拟）
//
// 数据走 lib/source.ts（API_BASE 时读真后端）；交互部分(拖拽/上传模拟)在 client.tsx。

import { notFound } from "next/navigation";
import { CreatorShell } from "@/components/shell";
import { SourceChip } from "@/components/source-chip";
import { getLibraryData, getTrack } from "@/lib/source";
import { TrackEditorClient } from "./editor-client";

export default async function TrackEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [track, library] = await Promise.all([getTrack(id), getLibraryData()]);
  if (!track) notFound();

  return (
    <CreatorShell
      title={`${track.title} · ${track.subtitle}`}
      breadcrumb={["醒春阁", "课程", `${track.title} · ${track.subtitle}`]}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          marginTop: -10,
          marginBottom: 8,
        }}
      >
        <SourceChip source={track.source} />
      </div>

      <TrackEditorClient
        initialTrack={track}
        initialUploads={[...library.uploads]}
      />
    </CreatorShell>
  );
}
