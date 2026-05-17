// 同舟 · 前端 API 客户端
//
// 设计：服务器端 fetch（Next.js Server Components 调用）。
// 启动时若 `API_BASE` 未设置，调用方会回退到 lib/mock.ts（见 lib/source.ts）。

import { headers } from "next/headers";
import type { AuthSession } from "./auth-shared";

const BASE = process.env.API_BASE; // 例：http://localhost:4100
const TENANT_SLUG = process.env.TENANT_SLUG || "xingchunge";

export function apiEnabled() {
  return !!BASE;
}

export function getApiRuntimeConfig() {
  return {
    base: BASE ?? null,
    tenantSlug: TENANT_SLUG,
  };
}

export function tenantSlug() {
  return TENANT_SLUG;
}

async function cookieHeader() {
  try {
    const requestHeaders = await headers();
    return requestHeaders.get("cookie") ?? "";
  } catch {
    return "";
  }
}

async function call<T>(
  path: string,
  init: RequestInit & { tenantHeader?: boolean } = {},
): Promise<T> {
  if (!BASE) throw new Error("[api] API_BASE not set");
  const { tenantHeader = true, ...rest } = init;
  const requestHeaders: Record<string, string> = {
    "content-type": "application/json",
    ...(rest.headers as Record<string, string> | undefined),
  };
  const cookies = await cookieHeader();
  if (cookies && !requestHeaders.cookie) requestHeaders.cookie = cookies;
  if (tenantHeader) requestHeaders["x-tenant-slug"] = TENANT_SLUG;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: requestHeaders,
    cache: "no-store",
    credentials: "include",
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
  key:
    | "members.active_count"
    | "courses.count"
    | "storage.bytes"
    | "playback.minutes";
  name: string;
  value: number;
  max: number;
  unit: string;
  sub: string;
  sample: string;
};

export type ApiAuthSession = AuthSession;

export type ApiUpload = {
  id: string;
  tenant_id: string;
  filename: string;
  mime: string;
  size_bytes: number;
  storage_driver: string;
  storage_key: string;
  url: string;
  phase: "uploading" | "transcoding" | "ready" | "failed";
  progress: number;
  duration_sec: number | null;
  meta: string | null;
  created_at: number;
  updated_at: number;
};

// ── 调用 ──

export async function fetchAuthMe(): Promise<ApiAuthSession | null> {
  if (!BASE) return null;
  try {
    return await call<ApiAuthSession>("/api/auth/me");
  } catch {
    return null;
  }
}

// 创作者侧（需要 x-tenant-slug header）
export async function fetchTenant(): Promise<ApiTenant> {
  const { tenant } = await call<{ tenant: ApiTenant }>("/api/tenants/me");
  return tenant;
}

export async function fetchTracks(): Promise<ApiTrack[]> {
  const { tracks } = await call<{ tracks: ApiTrack[] }>("/api/tracks");
  return tracks;
}

export async function fetchTrack(
  id: string,
): Promise<{ track: ApiTrack; lessons: ApiLesson[] }> {
  return call<{ track: ApiTrack; lessons: ApiLesson[] }>(`/api/tracks/${id}`);
}

export async function fetchMembers(): Promise<{
  members: ApiMember[];
  activeCount: number;
}> {
  return call<{ members: ApiMember[]; activeCount: number }>("/api/members");
}

export async function fetchMeters(): Promise<ApiMeter[]> {
  const { meters } = await call<{ meters: ApiMeter[] }>("/api/usage/meters");
  return meters;
}

export async function fetchUploads(): Promise<ApiUpload[]> {
  const { uploads } = await call<{ uploads: ApiUpload[] }>("/api/uploads");
  return uploads;
}

// 学员侧（公开，无需 tenant header）
export async function fetchPublicLanding(slug: string): Promise<{
  tenant: ApiTenant & {
    tagline: string;
    theme_hue: number;
    group_link: string;
  };
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

export type ApiLessonPlayOk = {
  playUrl: string;
  mime: string;
  durationSec: number | null;
  expiresAt: number;
};

/**
 * 播放接口的状态机:页面据此决定显示视频 / 登录遮罩 / 未就绪文案 / 无视频文案。
 *   ok            → 200,合法签名 URL
 *   login_required → 401,需要学员登录(微信)
 *   not_ready     → 409,upload phase 还没 ready(转码中)
 *   no_video      → 404,lesson 没绑 upload,或 upload 找不到
 *   error         → 其他(网络 / 5xx)
 */
export type PlayResult =
  | ({ kind: "ok" } & ApiLessonPlayOk)
  | { kind: "login_required" }
  | { kind: "not_ready" }
  | { kind: "no_video" }
  | { kind: "error" };

export async function fetchPublicLessonPlay(
  slug: string,
  lessonId: string,
): Promise<PlayResult> {
  if (!BASE) return { kind: "error" };
  try {
    const cookies = await cookieHeader();
    const res = await fetch(
      `${BASE}/api/x/${slug}/lessons/${lessonId}/play`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          ...(cookies ? { cookie: cookies } : {}),
        },
        cache: "no-store",
        credentials: "include",
      },
    );
    if (res.status === 200) {
      const body = (await res.json()) as ApiLessonPlayOk;
      return { kind: "ok", ...body };
    }
    if (res.status === 401) return { kind: "login_required" };
    if (res.status === 409) return { kind: "not_ready" };
    if (res.status === 404) return { kind: "no_video" };
    return { kind: "error" };
  } catch {
    return { kind: "error" };
  }
}

export type ApiStudentMember = {
  id: string;
  name: string;
  phone: string;
  bound: number;
  wechat_nickname: string | null;
  wechat_avatar: string | null;
};

export async function fetchStudentMe(
  slug: string,
): Promise<ApiStudentMember | null> {
  if (!BASE) return null;
  try {
    const body = await call<{ member: ApiStudentMember }>(
      `/api/x/${slug}/auth/me`,
      { tenantHeader: false },
    );
    return body.member;
  } catch {
    return null;
  }
}
