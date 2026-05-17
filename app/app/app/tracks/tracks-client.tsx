"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { I } from "@/components/icons";
import { Bar, Placeholder, SectionLabel } from "@/components/primitives";
import { useAuthSession } from "@/components/auth-session-context";
import { createTrack, suggestSlug } from "@/lib/creator-client";

type ListTrack = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  oneLine: string;
  status: string;
  totalMinutes: number;
  cumulativeViewers: number;
  completionRate: number;
  lessonsTotal: number;
  lessonsPublished: number;
  source: "api" | "mock";
};

export function TracksClient({
  initialTracks,
  source,
}: {
  initialTracks: ListTrack[];
  source: "api" | "mock";
}) {
  const router = useRouter();
  const { apiBase } = useAuthSession();
  const [tracks, setTracks] = useState(initialTracks);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [oneLine, setOneLine] = useState("");
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const createDisabled = useMemo(
    () => !title.trim() || !suggestSlug(slug || title),
    [slug, title],
  );

  async function handleCreate() {
    setBusy(true);
    setError(null);
    setNotice(null);

    const nextSlug = suggestSlug(slug || title);
    if (!title.trim() || !nextSlug) {
      setBusy(false);
      setError("课程标题和 slug 不能为空。");
      return;
    }

    try {
      if (!apiBase) {
        const mockId = `mock-${Date.now()}`;
        setTracks((current) => [
          {
            id: mockId,
            slug: nextSlug,
            title: title.trim(),
            subtitle: subtitle.trim(),
            oneLine: oneLine.trim(),
            status: "draft",
            totalMinutes: 0,
            cumulativeViewers: 0,
            completionRate: 0,
            lessonsTotal: 0,
            lessonsPublished: 0,
            source: "mock",
          },
          ...current,
        ]);
        setNotice("离线演示模式：课程已临时创建在当前页面。真正落库请接上 API_BASE。");
        setShowCreate(false);
        return;
      }

      const { track } = await createTrack(apiBase, {
        slug: nextSlug,
        title: title.trim(),
        subtitle: subtitle.trim(),
        oneLine: oneLine.trim(),
      });
      router.push(`/app/tracks/${track.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败，请稍后再试。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SectionLabel
        stamp="课"
        title="全部课程"
        sub={`共 ${tracks.length} 门 · 含草稿`}
        right={
          <button className="tz-btn tz-btn-primary" type="button" onClick={() => setShowCreate((current) => !current)}>
            <I.plus size={14} /> 新建课程
          </button>
        }
      />

      {showCreate && (
        <div className="tz-card" style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 10, marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
              课程标题
              <input className="tz-input" value={title} onChange={(event) => {
                const nextTitle = event.target.value;
                setTitle(nextTitle);
                if (!slug) setSlug(suggestSlug(nextTitle));
              }} placeholder="例如：七天成长计划" />
            </label>
            <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
              副标题
              <input className="tz-input" value={subtitle} onChange={(event) => setSubtitle(event.target.value)} placeholder="例如：习作启蒙" />
            </label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 10, marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
              一句话简介
              <input className="tz-input" value={oneLine} onChange={(event) => setOneLine(event.target.value)} placeholder="学员页会展示这句简介" />
            </label>
            <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
              slug
              <input className="tz-input" value={slug} onChange={(event) => setSlug(suggestSlug(event.target.value))} placeholder="qitian-chengzhang" />
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>
              创建后会直接进入课程编辑页，继续上传视频和整理课时。
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="tz-btn" type="button" onClick={() => setShowCreate(false)} disabled={busy}>取消</button>
              <button className="tz-btn tz-btn-primary" type="button" onClick={handleCreate} disabled={busy || createDisabled}>
                {busy ? "创建中…" : "创建课程"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="tz-card" style={{ padding: 12, marginBottom: 12, color: "var(--danger)" }}>{error}</div>}
      {notice && <div className="tz-card" style={{ padding: 12, marginBottom: 12, color: "var(--accent-deep)" }}>{notice}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {tracks.map((track) => (
          <Link
            key={track.id}
            href={`/app/tracks/${track.id}`}
            className="tz-card"
            style={{
              padding: 18,
              display: "flex",
              gap: 18,
              alignItems: "stretch",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Placeholder w={120} h={80} radius={6} label="封面" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <h3 className="tz-serif" style={{ margin: 0, fontSize: 17, fontWeight: 500 }}>
                  {track.title} · {track.subtitle || "未命名副标题"}
                </h3>
                {track.status === "published" ? (
                  <span className="tz-chip is-accent">
                    <I.check size={10} /> 已发布
                  </span>
                ) : (
                  <span className="tz-chip">草稿</span>
                )}
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--ink-2)", maxWidth: 640 }}>
                {track.oneLine || "还没有填写课程简介，进去补一笔吧。"}
              </p>
              <div style={{ display: "flex", gap: 22, fontSize: 11.5, color: "var(--ink-3)", flexWrap: "wrap" }}>
                <span>
                  <b style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{track.lessonsTotal}</b> 课时
                  （{track.lessonsPublished} 发布 / {track.lessonsTotal - track.lessonsPublished} 草稿）
                </span>
                <span>
                  <b style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{track.totalMinutes}</b> min 总时长
                </span>
                <span>
                  <b style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{track.cumulativeViewers}</b> 累计观看人
                </span>
                <span className="tz-chip">{track.source === "api" ? "API" : "Mock"}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, minWidth: 120 }}>
              <span style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.05em" }}>完播率</span>
              <div className="tz-serif" style={{ fontSize: 22, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                {track.completionRate}%
              </div>
              <div style={{ width: 100 }}>
                <Bar value={track.completionRate} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {tracks.length === 0 && (
        <div className="tz-card" style={{ padding: 48, textAlign: "center", color: "var(--ink-3)", marginTop: 12 }}>
          还没有课程，先创建第一门吧。
        </div>
      )}
    </>
  );
}
