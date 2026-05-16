// 创作者后台 · 内容库（V0 占位）
// 数据模型中：所有上传过的视频汇总到这里，不论是否挂在课程下。

import { CreatorShell } from "@/components/shell";
import { I } from "@/components/icons";
import { SectionLabel } from "@/components/primitives";

export default function LibraryPage() {
  return (
    <CreatorShell title="内容库" breadcrumb={["醒春阁", "交付"]}>
      <SectionLabel stamp="库" title="所有视频" sub="V0：可挂到任意课程下复用" />
      <div
        className="tz-card"
        style={{
          padding: 48,
          textAlign: "center",
          color: "var(--ink-3)",
          fontSize: 13,
          lineHeight: 1.8,
        }}
      >
        <I.video size={28} style={{ color: "var(--ink-4)", marginBottom: 12 }} />
        <div>暂未实现 — V0 上传后视频默认归到课程</div>
        <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 4 }}>
          V1 起将开放跨课程引用与素材库管理
        </div>
      </div>
    </CreatorShell>
  );
}
