// 数据源开关：API_BASE 设置时走真后端,否则走 mock
//
// 给页面用：import { getTracks } from "@/lib/source"。
// 类型上做了 normalize：API 返回 snake_case 字段 → 转成 mock 同形 camel-ish。

import { apiEnabled, fetchTracks, type ApiTrack, type ApiLesson } from "./api";
import { tracks as mockTracks, type Lesson, type Track } from "./mock";

export type ListTrack = {
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

function normalizeApi(t: ApiTrack, lessons: ApiLesson[] = []): ListTrack {
  const published = lessons.filter((l) => l.status === "published").length;
  return {
    id: t.id,
    slug: t.slug,
    title: t.title,
    subtitle: t.subtitle,
    oneLine: t.one_line,
    status: t.status,
    totalMinutes: t.total_minutes,
    cumulativeViewers: t.cumulative_viewers,
    completionRate: t.completion_rate,
    lessonsTotal: lessons.length,
    lessonsPublished: published,
    source: "api",
  };
}

function normalizeMock(t: Track): ListTrack {
  return {
    id: t.id,
    slug: t.slug,
    title: t.title,
    subtitle: t.subtitle,
    oneLine: t.oneLine,
    status: t.status,
    totalMinutes: t.totalMinutes,
    cumulativeViewers: t.cumulativeViewers,
    completionRate: t.completionRate,
    lessonsTotal: t.lessons.length,
    lessonsPublished: t.lessons.filter((l: Lesson) => l.status === "published").length,
    source: "mock",
  };
}

export async function getTracks(): Promise<ListTrack[]> {
  if (apiEnabled()) {
    const list = await fetchTracks();
    // 列表页不需要完整 lessons —— 一次性少取，留 0
    return list.map((t) => normalizeApi(t, []));
  }
  return mockTracks.map(normalizeMock);
}

export function getSourceLabel(): "api" | "mock" {
  return apiEnabled() ? "api" : "mock";
}
