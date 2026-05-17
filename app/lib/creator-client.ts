export type CreatorTenant = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  theme_hue: number;
  group_link: string;
  plan: string;
};

export type CreatorTrack = {
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

export type CreatorLesson = {
  id: string;
  tenant_id: string;
  track_id: string;
  title: string;
  summary: string;
  position: number;
  duration_sec: number | null;
  duration_text: string;
  video_id: string | null;
  status: "draft" | "uploading" | "transcoding" | "published" | "failed";
  views: number;
  progress: number | null;
};

export type CreatorMember = {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  source: string;
  bound: number;
  anonymous: number;
  joined_at: string;
  last_active: string;
  course_count: number;
  playback_minutes: number;
};

export type CreatorUpload = {
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

export type TenantPatchInput = {
  slug?: string;
  name?: string;
  tagline?: string;
  themeHue?: number;
  groupLink?: string;
};

export type TrackInput = {
  slug: string;
  title: string;
  subtitle?: string;
  oneLine?: string;
};

export type TrackPatchInput = Partial<TrackInput> & {
  status?: "draft" | "published" | "archived";
};

export type LessonInput = {
  title: string;
  summary?: string;
  durationSec?: number;
  durationText?: string;
  videoId?: string;
  status?: "draft" | "uploading" | "transcoding" | "published" | "failed";
};

export type LessonPatchInput = Partial<LessonInput> & {
  progress?: number;
};

function isFormData(body: BodyInit | null | undefined): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

async function request<T>(
  base: string,
  path: string,
  init: RequestInit,
): Promise<T> {
  const requestHeaders = new Headers(init.headers ?? {});
  if (!isFormData(init.body) && !requestHeaders.has("content-type")) {
    requestHeaders.set("content-type", "application/json");
  }

  const res = await fetch(`${base}${path}`, {
    ...init,
    credentials: "include",
    headers: requestHeaders,
  });

  if (!res.ok) {
    let message = `请求失败 (${res.status})`;
    try {
      const json = (await res.json()) as {
        error?: { message?: string } | string;
        message?: string;
      };
      if (typeof json.error === "string") {
        message = json.error;
      } else {
        message = json.error?.message || json.message || message;
      }
    } catch {
      const text = await res.text().catch(() => "");
      if (text) message = text;
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export function suggestSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function fileNameToTitle(name: string) {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]+/g, " ")
      .trim() || "未命名课时"
  );
}

export async function updateTenant(base: string, input: TenantPatchInput) {
  return request<{ tenant: CreatorTenant }>(base, "/api/tenants/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function createMember(
  base: string,
  input: { name?: string; phone?: string; source?: string },
) {
  return request<{ member: CreatorMember }>(base, "/api/members", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function importMembersCsv(
  base: string,
  input: { csv: string; source?: string },
) {
  return request<{ imported: number }>(base, "/api/members/import-csv", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createTrack(base: string, input: TrackInput) {
  return request<{ track: CreatorTrack }>(base, "/api/tracks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTrack(
  base: string,
  id: string,
  input: TrackPatchInput,
) {
  return request<{ track: CreatorTrack }>(base, `/api/tracks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function createLesson(
  base: string,
  trackId: string,
  input: LessonInput,
) {
  return request<{ lesson: CreatorLesson }>(
    base,
    `/api/tracks/${trackId}/lessons`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function updateLesson(
  base: string,
  id: string,
  input: LessonPatchInput,
) {
  return request<{ lesson: CreatorLesson }>(base, `/api/lessons/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteLesson(base: string, id: string) {
  return request<{ ok: boolean }>(base, `/api/lessons/${id}`, {
    method: "DELETE",
  });
}

export async function reorderLessons(
  base: string,
  trackId: string,
  orderedIds: string[],
) {
  return request<{ ok: boolean; lessons: CreatorLesson[] }>(
    base,
    `/api/tracks/${trackId}/lessons/reorder`,
    {
      method: "POST",
      body: JSON.stringify({ orderedIds }),
    },
  );
}

export async function uploadFile(base: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return request<{ upload: CreatorUpload }>(base, "/api/uploads", {
    method: "POST",
    body: form,
  });
}
