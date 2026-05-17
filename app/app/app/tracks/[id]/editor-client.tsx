"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/components/auth-session-context";
import { I } from "@/components/icons";
import { Bar, Placeholder, SectionLabel } from "@/components/primitives";
import {
  createLesson,
  deleteLesson,
  fileNameToTitle,
  reorderLessons,
  suggestSlug,
  updateLesson,
  updateTrack,
  uploadFile,
} from "@/lib/creator-client";

type LessonItem = {
  id: string;
  title: string;
  summary: string;
  durationText: string;
  status: "published" | "draft" | "uploading" | "transcoding" | "failed";
  views?: number;
  progress?: number;
  source: "api" | "mock";
};

type UploadItem = {
  id: string;
  name: string;
  phase: "uploading" | "transcoding" | "ready" | "failed";
  sizeText: string;
  createdAtLabel: string;
  url?: string;
  source: "api" | "mock";
};

type TrackEditorData = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  oneLine: string;
  status: string;
  totalMinutes: number;
  cumulativeViewers: number;
  completionRate: number;
  lessons: LessonItem[];
  source: "api" | "mock";
};

type LessonDraft = {
  title: string;
  summary: string;
  status: LessonItem["status"];
};

function emptyDraft(): LessonDraft {
  return {
    title: "",
    summary: "",
    status: "draft",
  };
}

function uploadLabel(phase: UploadItem["phase"]) {
  switch (phase) {
    case "ready":
      return "已就绪";
    case "failed":
      return "失败";
    case "transcoding":
      return "转码中";
    default:
      return "上传中";
  }
}

export function TrackEditorClient({
  initialTrack,
  initialUploads,
}: {
  initialTrack: TrackEditorData;
  initialUploads: UploadItem[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { apiBase, session } = useAuthSession();
  const [track, setTrack] = useState({
    slug: initialTrack.slug,
    title: initialTrack.title,
    subtitle: initialTrack.subtitle,
    oneLine: initialTrack.oneLine,
    status: initialTrack.status as "draft" | "published" | "archived",
  });
  const [lessons, setLessons] = useState<LessonItem[]>(initialTrack.lessons);
  const [uploads, setUploads] = useState<UploadItem[]>(initialUploads);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lessonDrafts, setLessonDrafts] = useState<Record<string, LessonDraft>>({});
  const [newLesson, setNewLesson] = useState<LessonDraft>(emptyDraft());
  const [showNewLesson, setShowNewLesson] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shareLink = useMemo(() => {
    const slug = session?.tenant.slug ?? "xingchunge";
    return `${typeof window === "undefined" ? "" : window.location.origin}/x/${slug}`;
  }, [session?.tenant.slug]);

  function startEdit(lesson: LessonItem) {
    setEditingId(lesson.id);
    setLessonDrafts((current) => ({
      ...current,
      [lesson.id]: {
        title: lesson.title,
        summary: lesson.summary,
        status: lesson.status,
      },
    }));
  }

  function updateDraft(id: string, patch: Partial<LessonDraft>) {
    setLessonDrafts((current) => ({
      ...current,
      [id]: {
        title: current[id]?.title ?? "",
        summary: current[id]?.summary ?? "",
        status: current[id]?.status ?? "draft",
        ...patch,
      },
    }));
  }

  async function saveTrack(status = track.status) {
    setBusy(true);
    setError(null);
    setNotice(null);

    const payload = {
      slug: suggestSlug(track.slug) || initialTrack.slug,
      title: track.title.trim(),
      subtitle: track.subtitle.trim(),
      oneLine: track.oneLine.trim(),
      status,
    };

    try {
      if (!payload.title) throw new Error("课程标题不能为空。");

      if (!apiBase) {
        setTrack((current) => ({ ...current, ...payload }));
        setNotice("离线演示模式：课程内容已在当前页面更新。");
        return;
      }

      const { track: nextTrack } = await updateTrack(apiBase, initialTrack.id, payload);
      setTrack({
        slug: nextTrack.slug,
        title: nextTrack.title,
        subtitle: nextTrack.subtitle,
        oneLine: nextTrack.one_line,
        status: nextTrack.status,
      });
      setNotice(status === "published" ? "课程已发布。" : "课程修改已保存。");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败，请稍后再试。");
    } finally {
      setBusy(false);
    }
  }

  async function saveLesson(id: string) {
    const draft = lessonDrafts[id];
    if (!draft) return;

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (!draft.title.trim()) throw new Error("课时标题不能为空。");

      if (!apiBase) {
        setLessons((current) =>
          current.map((lesson) =>
            lesson.id === id
              ? {
                  ...lesson,
                  title: draft.title.trim(),
                  summary: draft.summary.trim(),
                  status: draft.status,
                }
              : lesson,
          ),
        );
        setEditingId(null);
        setNotice("离线演示模式：课时已在当前页面更新。");
        return;
      }

      const { lesson } = await updateLesson(apiBase, id, {
        title: draft.title.trim(),
        summary: draft.summary.trim(),
        status: draft.status,
      });
      setLessons((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                title: lesson.title,
                summary: lesson.summary,
                status: lesson.status,
                durationText: lesson.duration_text,
                progress: lesson.progress ?? undefined,
              }
            : item,
        ),
      );
      setEditingId(null);
      setNotice("课时已保存。");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存课时失败。");
    } finally {
      setBusy(false);
    }
  }

  async function removeLesson(id: string) {
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (!apiBase) {
        setLessons((current) => current.filter((lesson) => lesson.id !== id));
        setNotice("离线演示模式：课时已删除。");
        return;
      }

      await deleteLesson(apiBase, id);
      setLessons((current) => current.filter((lesson) => lesson.id !== id));
      setNotice("课时已删除。");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除课时失败。");
    } finally {
      setBusy(false);
    }
  }

  async function addLesson() {
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (!newLesson.title.trim()) throw new Error("请先填写课时标题。");

      if (!apiBase) {
        setLessons((current) => [
          ...current,
          {
            id: `mock-${Date.now()}`,
            title: newLesson.title.trim(),
            summary: newLesson.summary.trim(),
            status: newLesson.status,
            durationText: "—",
            source: "mock",
          },
        ]);
        setShowNewLesson(false);
        setNewLesson(emptyDraft());
        setNotice("离线演示模式：课时已添加。");
        return;
      }

      const { lesson } = await createLesson(apiBase, initialTrack.id, {
        title: newLesson.title.trim(),
        summary: newLesson.summary.trim(),
        status: newLesson.status,
      });
      setLessons((current) => [
        ...current,
        {
          id: lesson.id,
          title: lesson.title,
          summary: lesson.summary,
          durationText: lesson.duration_text,
          status: lesson.status,
          views: lesson.views,
          progress: lesson.progress ?? undefined,
          source: "api",
        },
      ]);
      setShowNewLesson(false);
      setNewLesson(emptyDraft());
      setNotice("新课时已创建。");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "新增课时失败。");
    } finally {
      setBusy(false);
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      for (const file of Array.from(files)) {
        const tempId = `pending-${file.name}-${Date.now()}`;
        setUploads((current) => [
          {
            id: tempId,
            name: file.name,
            phase: "uploading",
            sizeText: `${Math.round(file.size / 1024 / 1024) || 1} MB`,
            createdAtLabel: "正在上传…",
            source: apiBase ? "api" : "mock",
          },
          ...current,
        ]);

        if (!apiBase) {
          setUploads((current) =>
            current.map((upload) =>
              upload.id === tempId
                ? { ...upload, phase: "ready", createdAtLabel: "刚刚" }
                : upload,
            ),
          );
          setLessons((current) => [
            ...current,
            {
              id: `mock-upload-${Date.now()}`,
              title: fileNameToTitle(file.name),
              summary: `上传自 ${file.name}`,
              durationText: "—",
              status: "draft",
              source: "mock",
            },
          ]);
          continue;
        }

        const { upload } = await uploadFile(apiBase, file);
        setUploads((current) => [
          {
            id: upload.id,
            name: upload.filename,
            phase: upload.phase,
            sizeText: `${Math.round(upload.size_bytes / 1024 / 1024) || 1} MB`,
            createdAtLabel: "刚刚",
            url: upload.url,
            source: "api",
          },
          ...current.filter((item) => item.id !== tempId),
        ]);

        const { lesson } = await createLesson(apiBase, initialTrack.id, {
          title: fileNameToTitle(file.name),
          summary: `上传自 ${file.name}`,
          videoId: upload.id,
          status: "draft",
        });
        setLessons((current) => [
          ...current,
          {
            id: lesson.id,
            title: lesson.title,
            summary: lesson.summary,
            durationText: lesson.duration_text,
            status: lesson.status,
            views: lesson.views,
            progress: lesson.progress ?? undefined,
            source: "api",
          },
        ]);
      }

      setNotice("上传完成，已自动创建对应课时草稿。");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败，请稍后再试。");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const onDragStart = (event: React.DragEvent, index: number) => {
    setDragIdx(index);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    setOverIdx(index);
  };

  const onDrop = async (event: React.DragEvent, index: number) => {
    event.preventDefault();
    if (dragIdx == null || dragIdx === index) return;

    const next = [...lessons];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(index, 0, moved);
    setLessons(next);
    setDragIdx(null);
    setOverIdx(null);

    if (!apiBase) {
      setNotice("离线演示模式：顺序已在当前页面更新。");
      return;
    }

    try {
      await reorderLessons(apiBase, initialTrack.id, next.map((lesson) => lesson.id));
      setNotice("课时顺序已保存。");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "排序保存失败。");
    }
  };

  async function copyShareLink() {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setNotice("学员页链接已复制。");
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
      <div>
        <div className="tz-card" style={{ padding: 16, marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
            <Placeholder w={88} h={88} radius={6} label="课程封面" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  课程标题
                  <input className="tz-input" value={track.title} onChange={(event) => setTrack((current) => ({ ...current, title: event.target.value }))} />
                </label>
                <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  副标题
                  <input className="tz-input" value={track.subtitle} onChange={(event) => setTrack((current) => ({ ...current, subtitle: event.target.value }))} />
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 10, marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  一句话简介
                  <input className="tz-input" value={track.oneLine} onChange={(event) => setTrack((current) => ({ ...current, oneLine: event.target.value }))} />
                </label>
                <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  课程 slug
                  <input className="tz-input" value={track.slug} onChange={(event) => setTrack((current) => ({ ...current, slug: suggestSlug(event.target.value) }))} />
                </label>
              </div>
              <div style={{ display: "flex", gap: 22, fontSize: 11.5, marginBottom: 12, flexWrap: "wrap" }}>
                <span><b style={{ fontVariantNumeric: "tabular-nums" }}>{lessons.length}</b> <span style={{ color: "var(--ink-3)" }}>课时</span></span>
                <span><b style={{ fontVariantNumeric: "tabular-nums" }}>{initialTrack.totalMinutes} min</b> <span style={{ color: "var(--ink-3)" }}>总时长</span></span>
                <span><b style={{ fontVariantNumeric: "tabular-nums" }}>{initialTrack.cumulativeViewers}</b> <span style={{ color: "var(--ink-3)" }}>累计观看人</span></span>
                <span><b style={{ fontVariantNumeric: "tabular-nums" }}>{initialTrack.completionRate}%</b> <span style={{ color: "var(--ink-3)" }}>完播率</span></span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="tz-btn" type="button" onClick={() => saveTrack()} disabled={busy}>
                  <I.check size={13} /> 保存修改
                </button>
                <button
                  className="tz-btn tz-btn-primary"
                  type="button"
                  onClick={() => saveTrack(track.status === "published" ? "draft" : "published")}
                  disabled={busy}
                >
                  {track.status === "published" ? "转回草稿" : "发布课程"}
                </button>
                <button className="tz-btn" type="button" onClick={copyShareLink}>
                  <I.copy size={13} /> 复制学员页链接
                </button>
                <span className={`tz-chip${track.status === "published" ? " is-accent" : ""}`}>
                  {track.status === "published" ? "已发布" : "草稿"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="tz-card" style={{ padding: 12, marginBottom: 12, color: "var(--danger)" }}>{error}</div>}
        {notice && <div className="tz-card" style={{ padding: 12, marginBottom: 12, color: "var(--accent-deep)" }}>{notice}</div>}

        <SectionLabel
          stamp="时"
          title="课时"
          sub={`共 ${lessons.length} 节 · 拖拽可调整顺序`}
          right={
            <button className="tz-btn" type="button" onClick={() => setShowNewLesson((current) => !current)}>
              <I.plus size={13} /> 新增课时
            </button>
          }
        />

        {showNewLesson && (
          <div className="tz-card" style={{ padding: 14, marginBottom: 10 }}>
            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
                课时标题
                <input className="tz-input" value={newLesson.title} onChange={(event) => setNewLesson((current) => ({ ...current, title: event.target.value }))} />
              </label>
              <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
                简介
                <input className="tz-input" value={newLesson.summary} onChange={(event) => setNewLesson((current) => ({ ...current, summary: event.target.value }))} />
              </label>
              <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
                <select
                  className="tz-input"
                  value={newLesson.status}
                  onChange={(event) => setNewLesson((current) => ({ ...current, status: event.target.value as LessonItem["status"] }))}
                  style={{ maxWidth: 180 }}
                >
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                  <option value="uploading">上传中</option>
                  <option value="transcoding">转码中</option>
                  <option value="failed">失败</option>
                </select>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="tz-btn" type="button" onClick={() => setShowNewLesson(false)} disabled={busy}>取消</button>
                  <button className="tz-btn tz-btn-primary" type="button" onClick={addLesson} disabled={busy}>保存课时</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          {lessons.map((lesson, index) => {
            const draft = lessonDrafts[lesson.id] ?? {
              title: lesson.title,
              summary: lesson.summary,
              status: lesson.status,
            };
            const editing = editingId === lesson.id;
            return (
              <div
                key={lesson.id}
                draggable
                onDragStart={(event) => onDragStart(event, index)}
                onDragOver={(event) => onDragOver(event, index)}
                onDrop={(event) => void onDrop(event, index)}
                style={{
                  border: overIdx === index && dragIdx !== index ? "1px dashed var(--accent)" : "1px solid var(--paper-edge)",
                  borderRadius: 8,
                  background: "#fff",
                  padding: 14,
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "20px 64px 1fr 90px 150px 72px", gap: 14, alignItems: "center" }}>
                  <span style={{ color: "var(--ink-4)", cursor: "grab", display: "flex", justifyContent: "center" }}>
                    <I.grip size={16} />
                  </span>
                  <div style={{ position: "relative" }}>
                    <Placeholder w={64} h={40} radius={4} label="" />
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
                      {lesson.durationText}
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--ink-3)" }}>{String(index + 1).padStart(2, "0")}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{lesson.title}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lesson.summary || "未填写简介"}</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-2)", fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                    {lesson.status === "published" ? `观看 ${lesson.views ?? 0}` : "—"}
                  </div>
                  <div>
                    {lesson.status === "published" && <span className="tz-chip is-accent"><I.check size={10} /> 已发布</span>}
                    {lesson.status === "draft" && <span className="tz-chip">草稿</span>}
                    {lesson.status === "failed" && <span className="tz-chip">失败</span>}
                    {(lesson.status === "uploading" || lesson.status === "transcoding") && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 10.5, color: lesson.status === "uploading" ? "var(--accent-deep)" : "var(--warn)" }}>
                          {lesson.status === "uploading" ? "上传中" : "转码中"} · {Math.round(lesson.progress ?? 0)}%
                        </span>
                        <Bar value={lesson.progress ?? 0} height={4} color={lesson.status === "uploading" ? "var(--accent)" : "var(--warn)"} />
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <button className="tz-btn tz-btn-ghost" type="button" style={{ padding: 6 }} onClick={() => startEdit(lesson)}>
                      <I.edit size={13} />
                    </button>
                    <button className="tz-btn tz-btn-ghost" type="button" style={{ padding: 6 }} onClick={() => void removeLesson(lesson.id)}>
                      <I.trash size={13} />
                    </button>
                  </div>
                </div>

                {editing && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--paper-line)", display: "grid", gap: 10 }}>
                    <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      标题
                      <input className="tz-input" value={draft.title} onChange={(event) => updateDraft(lesson.id, { title: event.target.value })} />
                    </label>
                    <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      简介
                      <input className="tz-input" value={draft.summary} onChange={(event) => updateDraft(lesson.id, { summary: event.target.value })} />
                    </label>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <select className="tz-input" value={draft.status} onChange={(event) => updateDraft(lesson.id, { status: event.target.value as LessonItem["status"] })} style={{ maxWidth: 180 }}>
                        <option value="draft">草稿</option>
                        <option value="published">已发布</option>
                        <option value="uploading">上传中</option>
                        <option value="transcoding">转码中</option>
                        <option value="failed">失败</option>
                      </select>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="tz-btn" type="button" onClick={() => setEditingId(null)} disabled={busy}>取消</button>
                        <button className="tz-btn tz-btn-primary" type="button" onClick={() => void saveLesson(lesson.id)} disabled={busy}>保存</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

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
            flexWrap: "wrap",
          }}
        >
          <I.upload size={16} style={{ color: "var(--accent)" }} />
          <span>把视频拖到这里上传 · 单文件 ≤ 2 GB</span>
          <span style={{ color: "var(--ink-4)" }}>—</span>
          <button className="tz-btn" type="button" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => fileInputRef.current?.click()}>
            选择文件
          </button>
          <input ref={fileInputRef} type="file" accept="video/*" multiple hidden onChange={(event) => void handleFiles(event.target.files)} />
        </div>
      </div>

      <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="tz-card" style={{ padding: 14 }}>
          <SectionLabel title="上传队列" sub={`${uploads.length} 条记录`} />
          {uploads.length === 0 ? (
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>还没有上传记录，选个视频试试。</div>
          ) : (
            uploads.slice(0, 6).map((upload) => (
              <div key={upload.id} style={{ padding: "10px 0", borderTop: "1px solid var(--paper-line)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <I.video size={13} style={{ color: "var(--ink-3)" }} />
                  <span style={{ fontSize: 12, fontWeight: 500, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{upload.name}</span>
                  <span style={{ fontSize: 10.5, color: "var(--ink-3)", fontVariantNumeric: "tabular-nums" }}>{upload.sizeText}</span>
                </div>
                <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--ink-3)" }}>
                  <span style={{ color: upload.phase === "failed" ? "var(--danger)" : upload.phase === "ready" ? "var(--accent-deep)" : "var(--warn)" }}>{uploadLabel(upload.phase)}</span>
                  <span>{upload.createdAtLabel}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="tz-card" style={{ padding: 14 }}>
          <SectionLabel title="播放保护" />
          <Toggle label="限时 playAuth" desc="链接 6 小时失效" on />
          <Toggle label="学员手机号水印" desc="斜向 22°, 自动平铺" on />
          <Toggle label="禁右键 / 选择" desc="对常见盗录有限作用" on={false} />
          <div style={{ marginTop: 8, paddingTop: 10, borderTop: "1px solid var(--paper-line)", fontSize: 11, color: "var(--ink-3)" }}>
            V0 先保留简化保护策略；学员观看路径不受创作者侧编辑影响。
          </div>
        </div>

        <div className="tz-card" style={{ padding: 14, background: "var(--accent-soft)", border: "1px solid color-mix(in oklch, var(--accent) 20%, transparent)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, color: "var(--accent-deep)", fontSize: 11.5 }}>
            <I.sparkle size={14} style={{ marginTop: 1, flex: "0 0 auto" }} />
            <div>
              <b>现在这页已经是真编辑器了：</b> 课程信息、课时 CRUD、顺序和上传都会走后端；
              只是 V0 还没引入 Stage 分组和素材跨课程复用。
            </div>
          </div>
        </div>
      </aside>
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
        }}
      >
        <div style={{ width: 13, height: 13, borderRadius: 999, background: "#fff" }} />
      </div>
    </div>
  );
}
