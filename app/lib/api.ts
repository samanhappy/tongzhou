// 同舟 · 前端 API 客户端
//
// 设计：服务器端 fetch（Next.js Server Components 调用）。
// 启动时若 `API_BASE` 未设置，调用方会回退到 lib/mock.ts（见 lib/source.ts）。

const BASE = process.env.API_BASE; // 例：http://localhost:4100
const TENANT_SLUG = process.env.TENANT_SLUG || "xingchunge";

export function apiEnabled() {
  return !!BASE;
}

export function tenantSlug() {
  return TENANT_SLUG;
}

async function call<T>(
  path: string,
  init: RequestInit & { tenantHeader?: boolean } = {},
): Promise<T> {
  if (!BASE) throw new Error("[api] API_BASE not set");
  const { tenantHeader = true, ...rest } = init;
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(rest.headers as Record<string, string> | undefined),
  };
  if (tenantHeader) headers["x-tenant-slug"] = TENANT_SLUG;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`[api] ${res.status} ${path}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

// ── 形状类型（与 api/ 返回 JSON 对齐） ──
export type ApiTenant = {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  theme_hue?: number;
  group_link?: string;
  plan: string;
};

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

export type ApiMember = {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  source: string;
  bound: number; // 0/1
  anonymous: number; // 0/1
  joined_at: string;
  last_active: string;
  course_count: number;
  playback_minutes: number;
};

export type ApiMeter = {
  key: "members.active_count" | "courses.count" | "storage.bytes" | "playback.minutes";
  name: string;
  value: number;
  max: number;
  unit: string;
  sub: string;
  sample: string;
};

// ── 调用 ──

// 创作者侧（需要 x-tenant-slug header）
export async function fetchTenant(): Promise<ApiTenant> {
  const { tenant } = await call<{ tenant: ApiTenant }>("/api/tenants/me");
  return tenant;
}

export async function fetchTracks(): Promise<ApiTrack[]> {
  const { tracks } = await call<{ tracks: ApiTrack[] }>("/api/tracks");
  return tracks;
}

export async function fetchTrack(id: string): Promise<{ track: ApiTrack; lessons: ApiLesson[] }> {
  return call<{ track: ApiTrack; lessons: ApiLesson[] }>(`/api/tracks/${id}`);
}

export async function fetchMembers(): Promise<{ members: ApiMember[]; activeCount: number }> {
  return call<{ members: ApiMember[]; activeCount: number }>("/api/members");
}

export async function fetchMeters(): Promise<ApiMeter[]> {
  const { meters } = await call<{ meters: ApiMeter[] }>("/api/usage/meters");
  return meters;
}

// 学员侧（公开，无需 tenant header）
export async function fetchPublicLanding(slug: string): Promise<{
  tenant: ApiTenant & { tagline: string; theme_hue: number; group_link: string };
  track: ApiTrack | null;
  lessons: ApiLesson[];
}> {
  return call(`/api/x/${slug}`, { tenantHeader: false });
}

export async function fetchPublicLesson(
  slug: string,
  lessonId: string,
): Promise<{ tenant: ApiTenant; lesson: ApiLesson }> {
  return call(`/api/x/${slug}/lessons/${lessonId}`, { tenantHeader: false });
}
