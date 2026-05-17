// 创作者后台 · 内容库（V0 占位）
// 数据模型中：所有上传过的视频汇总到这里，不论是否挂在课程下。

import { CreatorShell } from "@/components/shell";
import { I } from "@/components/icons";
import { SectionLabel } from "@/components/primitives";
import { SourceChip } from "@/components/source-chip";
import { getLibraryData } from "@/lib/source";

export default async function LibraryPage() {
  const { uploads, source } = await getLibraryData();

  return (
    <CreatorShell title="内容库" breadcrumb={["醒春阁", "交付"]}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          marginTop: -10,
          marginBottom: 14,
        }}
      >
        <SourceChip source={source} />
      </div>
      <SectionLabel
        stamp="库"
        title="所有视频"
        sub="V0：可挂到任意课程下复用"
      />
      {uploads.length === 0 ? (
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
          <I.video
            size={28}
            style={{ color: "var(--ink-4)", marginBottom: 12 }}
          />
          <div>还没有上传过视频。</div>
          <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 4 }}>
            去课程编辑页上传后，这里会自动汇总所有内容素材。
          </div>
        </div>
      ) : (
        <div className="tz-card" style={{ overflow: "hidden" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12.5,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--paper-deep)",
                  color: "var(--ink-3)",
                  fontSize: 10.5,
                  letterSpacing: "0.05em",
                }}
              >
                <th
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontWeight: 400,
                  }}
                >
                  文件名
                </th>
                <th
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontWeight: 400,
                  }}
                >
                  状态
                </th>
                <th
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontWeight: 400,
                  }}
                >
                  大小
                </th>
                <th
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontWeight: 400,
                  }}
                >
                  上传时间
                </th>
                <th
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontWeight: 400,
                  }}
                >
                  来源
                </th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => (
                <tr
                  key={upload.id}
                  style={{ borderTop: "1px solid var(--paper-line)" }}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <I.video size={14} style={{ color: "var(--ink-3)" }} />
                      <span style={{ fontWeight: 500 }}>{upload.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span
                      className={`tz-chip${upload.phase === "ready" ? " is-accent" : ""}`}
                    >
                      {upload.phase === "ready"
                        ? "已就绪"
                        : upload.phase === "failed"
                          ? "失败"
                          : upload.phase}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "var(--ink-2)",
                      fontFamily: "var(--mono)",
                    }}
                  >
                    {upload.sizeText}
                  </td>
                  <td style={{ padding: "12px 14px", color: "var(--ink-2)" }}>
                    {upload.createdAtLabel}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span className="tz-chip">{upload.source}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CreatorShell>
  );
}
