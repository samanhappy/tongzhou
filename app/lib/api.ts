// 同舟 · 前端 API 客户端
//
// 设计：服务器端 fetch（Next.js Server Components 调用）。
// 启动时若 `API_BASE` 未设置，调用方会回退到 lib/mock.ts（见 lib/source.ts）。

const BASE = process.env.API_BASE; // 例：http://localhost:4100
const TENANT_SLUG = process.env.TENANT_SLUG || "xingchunge";

export function apiEnabled() {
  return !!BASE;
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!BASE) throw new Error("[api] API_BASE not set");
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "x-tenant-slug": TENANT_SLUG,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[api] ${res.status} ${path}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

// ── 形状类型（与 api/ 返回 JSON 对齐） ──
export type ApiTrack = {
  id: string;
  tenant_id: string;
  slug: string;
  title: string;
  subtitle: string;
  one_line: string;
  cover_url: string | null;
  status: "draft" | "published" | "archived";
  total_minutes: number;
  cumulative_viewers: number;
  completion_rate: number;
  position: number;
};

export type ApiLesson = {
  id: string;
  tenant_id: string;
  track_id: string;
  title: string;
  summary: string;
  position: number;
  duration_sec: number | null;
  duration_text: string;
  status: "draft" | "uploading" | "transcoding" | "published" | "failed";
  views: number;
  progress: number | null;
};

// ── 调用 ──
export async function fetchTracks(): Promise<ApiTrack[]> {
  const { tracks } = await call<{ tracks: ApiTrack[] }>("/api/tracks");
  return tracks;
}

export async function fetchTrack(id: string): Promise<{ track: ApiTrack; lessons: ApiLesson[] }> {
  return call<{ track: ApiTrack; lessons: ApiLesson[] }>(`/api/tracks/${id}`);
}
