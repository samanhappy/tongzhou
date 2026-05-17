// 数据源开关：API_BASE 设置时走真后端,否则走 mock
//
// 规约：
// - 每个 page 用一个 getXxxData() 入口拿到自己需要的所有数据
// - 返回的 shape 与原 mock 对齐,page 渲染逻辑保持不变
// - 不能从 API 派生的字段(如 trend / recentActivities)在 API 模式用占位策略,
//   不会让页面崩；并打上 source 标记给页面提示

import {
  apiEnabled,
  fetchMembers,
  fetchMeters,
  fetchPublicLanding,
  fetchPublicLesson,
  fetchTenant,
  fetchTrack,
  fetchTracks,
  fetchUploads,
  tenantSlug,
  type ApiLesson,
  type ApiMember,
  type ApiMeter,
  type ApiTrack,
  type ApiUpload,
} from "./api";
import {
  courseWatchRows as mockCourseWatchRows,
  dashboardStats as mockDashboardStats,
  members as mockMembers,
  recentActivities as mockActivities,
  studentLessons as mockStudentLessons,
  tenant as mockTenant,
  tracks as mockTracks,
  usageMeters as mockMeters,
  type Activity,
  type Lesson,
  type StudentLesson,
  type Tenant,
  type Track,
  watermarkPhone as mockWatermark,
} from "./mock";

export type Source = "api" | "mock";

export function getSourceLabel(): Source {
  return apiEnabled() ? "api" : "mock";
}

// ─────────────────────────────────────────────
// Tenant
// ─────────────────────────────────────────────

export async function getTenant(): Promise<Tenant> {
  if (apiEnabled()) {
    const t = await fetchTenant();
    return {
      slug: t.slug,
      name: t.name,
      tagline: t.tagline ?? "",
      themeHue: t.theme_hue ?? 162,
      groupLink: t.group_link ?? "",
      plan: (t.plan as Tenant["plan"]) ?? "free",
    };
  }
  return mockTenant;
}

// ─────────────────────────────────────────────
// Tracks 列表（旧接口保留）
// ─────────────────────────────────────────────

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
  source: Source;
};

function listFromApi(t: ApiTrack, lessons: ApiLesson[] = []): ListTrack {
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

function listFromMock(t: Track): ListTrack {
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
    return list.map((t) => listFromApi(t, []));
  }
  return mockTracks.map(listFromMock);
}

// ─────────────────────────────────────────────
// 单 Track 详情(含 lessons)
// ─────────────────────────────────────────────

export type DetailLesson = Lesson & { source: Source };
export type DetailTrack = ListTrack & { lessons: DetailLesson[] };

function lessonFromApi(l: ApiLesson): DetailLesson {
  return {
    id: l.id,
    title: l.title,
    summary: l.summary,
    durationText: l.duration_text,
    status: l.status,
    views: l.views,
    progress: l.progress ?? undefined,
    source: "api",
  };
}

function lessonFromMock(l: Lesson): DetailLesson {
  return { ...l, source: "mock" };
}

export async function getTrack(id: string): Promise<DetailTrack | null> {
  if (apiEnabled()) {
    try {
      const { track, lessons } = await fetchTrack(id);
      return {
        ...listFromApi(track, lessons),
        lessons: lessons.map(lessonFromApi),
      };
    } catch {
      return null;
    }
  }
  const t = mockTracks.find((x) => x.id === id || x.slug === id);
  if (!t) return null;
  return {
    ...listFromMock(t),
    lessons: t.lessons.map(lessonFromMock),
  };
}

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────

export type DashboardStat = {
  label: string;
  value: string;
  unit?: string;
  delta?: number;
  trend?: readonly number[];
  foot?: string;
};

export type QuotaRow = {
  label: string;
  value: number;
  max: number;
  unit: string;
  color?: string;
};

export type CourseWatchRow = {
  name: string;
  view: number;
  mins: number;
  complete: number;
};

export type DashboardData = {
  stats: readonly DashboardStat[];
  quotas: readonly QuotaRow[];
  courseWatch: readonly CourseWatchRow[];
  activities: readonly Activity[];
  source: Source;
};

function synthTrend(end: number): number[] {
  // API 模式无历史数据 → 用一条线性 ramp 表示
  if (end <= 0) return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const n = 12;
  return Array.from({ length: n }, (_, i) =>
    Math.round((end * (i + 1)) / n * 100) / 100,
  );
}

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

function durationTextToSec(s: string): number {
  const m = /^(\d+):(\d+)$/.exec(s);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
}

export async function getDashboardData(): Promise<DashboardData> {
  if (apiEnabled()) {
    const [meters, tracksList] = await Promise.all([fetchMeters(), fetchTracks()]);
    const byKey = Object.fromEntries(meters.map((m) => [m.key, m] as const));
    const trk = tracksList[0];
    const trackLessons = trk ? (await fetchTrack(trk.id)).lessons : [];

    const m = (k: ApiMeter["key"]) => byKey[k];
    const active = m("members.active_count");
    const courses = m("courses.count");
    const playback = m("playback.minutes");
    const storage = m("storage.bytes");

    const stats: DashboardStat[] = [
      {
        label: "月活学员",
        value: fmt(active?.value ?? 0),
        unit: active?.unit,
        trend: synthTrend(active?.value ?? 0),
        foot: `配额 ${active?.max ?? 0} ${active?.unit ?? ""}`,
      },
      {
        label: "已发布课程",
        value: fmt(courses?.value ?? 0),
        unit: courses?.unit,
        trend: synthTrend(courses?.value ?? 0),
        foot: `配额 ${courses?.max ?? 0} 门`,
      },
      {
        label: "累计播放",
        value: fmt(Math.round(playback?.value ?? 0)),
        unit: playback?.unit,
        trend: synthTrend(playback?.value ?? 0),
        foot: trackLessons.length
          ? `${trackLessons.length} 节中累计`
          : "—",
      },
      {
        label: "视频存储",
        value: (storage?.value ?? 0).toFixed(2),
        unit: storage?.unit,
        trend: synthTrend(storage?.value ?? 0),
        foot: `共 ${trackLessons.length} 个课时`,
      },
    ];

    const quotas: QuotaRow[] = [
      {
        label: "月活学员",
        value: active?.value ?? 0,
        max: active?.max ?? 1,
        unit: active?.unit ?? "人",
        color: "var(--accent)",
      },
      {
        label: "发布课程",
        value: courses?.value ?? 0,
        max: courses?.max ?? 1,
        unit: courses?.unit ?? "门",
        color: "var(--accent)",
      },
      {
        label: "视频存储",
        value: storage?.value ?? 0,
        max: storage?.max ?? 1,
        unit: storage?.unit ?? "GB",
        color: "var(--warn)",
      },
      {
        label: "播放分钟",
        value: playback?.value ?? 0,
        max: playback?.max ?? 1,
        unit: playback?.unit ?? "分钟",
        color: "var(--warn)",
      },
    ];

    // 课程观看表用真实 lessons.views
    const courseWatch: CourseWatchRow[] = trackLessons
      .filter((l) => l.status === "published")
      .slice(0, 5)
      .map((l) => ({
        name: `${trk?.title ?? "课程"} · ${l.title}`,
        view: l.views,
        mins: l.views * Math.round(durationTextToSec(l.duration_text) / 60),
        complete: l.views ? Math.min(100, 40 + l.views) : 0,
      }));

    return {
      stats,
      quotas,
      courseWatch,
      activities: [], // V0 暂无事件流 → 等接 events 表后填充
      source: "api",
    };
  }

  // mock fallback
  const quotas: QuotaRow[] = [
    { label: "月活学员", value: 142, max: 200, unit: "人", color: "var(--accent)" },
    { label: "发布课程", value: 6, max: 10, unit: "门", color: "var(--accent)" },
    { label: "视频存储", value: 3.8, max: 5, unit: "GB", color: "var(--warn)" },
    { label: "播放分钟", value: 1284, max: 1500, unit: "分钟", color: "var(--warn)" },
  ];
  return {
    stats: mockDashboardStats,
    quotas,
    courseWatch: mockCourseWatchRows,
    activities: mockActivities,
    source: "mock",
  };
}

// ─────────────────────────────────────────────
// Usage 页
// ─────────────────────────────────────────────

export type UsageMeterRow = {
  key: string;
  name: string;
  value: number;
  max: number;
  unit: string;
  sub: string;
  sample: string;
};

export type UsageData = {
  meters: readonly UsageMeterRow[];
  totalPct: number;
  source: Source;
};

function meterToRow(m: ApiMeter | UsageMeterRow): UsageMeterRow {
  // 两个 shape 一致
  return {
    key: m.key,
    name: m.name,
    value: m.value,
    max: m.max,
    unit: m.unit,
    sub: m.sub,
    sample: m.sample,
  };
}

export async function getUsageData(): Promise<UsageData> {
  if (apiEnabled()) {
    const ms = (await fetchMeters()).map(meterToRow);
    const totalPct = Math.round(
      (ms.reduce((acc, m) => acc + Math.min(1, m.max ? m.value / m.max : 0), 0) /
        Math.max(1, ms.length)) *
        100,
    );
    return { meters: ms, totalPct, source: "api" };
  }
  const ms = mockMeters.map(meterToRow);
  const totalPct = Math.round(
    (ms.reduce((acc, m) => acc + Math.min(1, m.max ? m.value / m.max : 0), 0) /
      Math.max(1, ms.length)) *
      100,
  );
  return { meters: ms, totalPct, source: "mock" };
}

// ─────────────────────────────────────────────
// Members 页
// ─────────────────────────────────────────────

export type MemberRow = {
  id: string;
  name: string;
  phone: string;
  source: string; // 渠道
  joinedAt: string;
  courseCount: number;
  playbackMinutes: number;
  lastActive: string;
  bound: boolean;
  anonymous: boolean;
};

export type MembersData = {
  members: readonly MemberRow[];
  activeCount: number;
  quotaMax: number;
  source: Source;
};

function memberFromApi(m: ApiMember): MemberRow {
  return {
    id: m.id,
    name: m.name,
    phone: m.phone,
    source: m.source,
    joinedAt: m.joined_at,
    courseCount: m.course_count,
    playbackMinutes: m.playback_minutes,
    lastActive: m.last_active || "—",
    bound: !!m.bound,
    anonymous: !!m.anonymous,
  };
}

// ─────────────────────────────────────────────
// 内容库
// ─────────────────────────────────────────────

export type LibraryItem = {
  id: string;
  name: string;
  phase: "uploading" | "transcoding" | "ready" | "failed";
  sizeText: string;
  createdAtLabel: string;
  url?: string;
  source: Source;
};

export type LibraryData = {
  uploads: readonly LibraryItem[];
  source: Source;
};

function formatBytes(size: number) {
  if (size >= 1024 * 1024 * 1024) return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (size >= 1024 * 1024) return `${Math.round(size / (1024 * 1024))} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

function uploadFromApi(upload: ApiUpload): LibraryItem {
  return {
    id: upload.id,
    name: upload.filename,
    phase: upload.phase,
    sizeText: formatBytes(upload.size_bytes),
    createdAtLabel: new Date(upload.created_at).toLocaleDateString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    url: upload.url,
    source: "api",
  };
}

export async function getLibraryData(): Promise<LibraryData> {
  if (apiEnabled()) {
    const uploads = await fetchUploads();
    return {
      uploads: uploads.map(uploadFromApi),
      source: "api",
    };
  }

  const uploads: LibraryItem[] = mockTracks.flatMap((track) =>
    track.lessons.map((lesson, index) => ({
      id: `${track.id}-${lesson.id}`,
      name: `${lesson.title}.mp4`,
      phase:
        lesson.status === "published"
          ? "ready"
          : lesson.status === "uploading"
            ? "uploading"
            : lesson.status === "transcoding"
              ? "transcoding"
              : lesson.status === "failed"
                ? "failed"
                : "ready",
      sizeText: `${220 + index * 48} MB`,
      createdAtLabel: `5/${String(2 + index).padStart(2, "0")}`,
      source: "mock" as const,
    })),
  );

  return {
    uploads,
    source: "mock",
  };
}

export async function getMembersData(): Promise<MembersData> {
  if (apiEnabled()) {
    const { members, activeCount } = await fetchMembers();
    const meters = await fetchMeters();
    const max = meters.find((x) => x.key === "members.active_count")?.max ?? 200;
    return {
      members: members.map(memberFromApi),
      activeCount,
      quotaMax: max,
      source: "api",
    };
  }
  return {
    members: mockMembers.map((m) => ({
      id: m.id,
      name: m.name,
      phone: m.phone,
      source: m.source,
      joinedAt: m.joinedAt,
      courseCount: m.courseCount,
      playbackMinutes: m.playbackMinutes,
      lastActive: m.lastActive,
      bound: m.bound,
      anonymous: !!m.anonymous,
    })),
    activeCount: 142,
    quotaMax: 200,
    source: "mock",
  };
}

// ─────────────────────────────────────────────
// 学员 H5
// ─────────────────────────────────────────────

export type StudentLandingData = {
  tenant: Tenant;
  track: {
    id: string;
    title: string;
    subtitle: string;
    oneLine: string;
    totalMinutes: number;
    cumulativeViewers: number;
  } | null;
  lessons: readonly StudentLesson[];
  continueLessonId?: string;
  source: Source;
  /** API 模式因为没有 per-student 状态,所以 "done/playing" 都不会出现 — 给页面一个提示 */
  noStudentSessionYet: boolean;
};

function publicLessonsToStudent(lessons: ApiLesson[]): StudentLesson[] {
  return lessons.map((l, i) => ({
    n: i,
    id: l.id,
    t: l.title,
    d: l.duration_text,
    status: l.status === "published" ? "available" : "locked",
  }));
}

export async function getStudentLanding(slug: string): Promise<StudentLandingData | null> {
  if (apiEnabled()) {
    try {
      const { tenant, track, lessons } = await fetchPublicLanding(slug);
      if (!track) {
        return {
          tenant: {
            slug: tenant.slug,
            name: tenant.name,
            tagline: tenant.tagline ?? "",
            themeHue: tenant.theme_hue ?? 162,
            groupLink: tenant.group_link ?? "",
            plan: "free",
          },
          track: null,
          lessons: [],
          source: "api",
          noStudentSessionYet: true,
        };
      }
      return {
        tenant: {
          slug: tenant.slug,
          name: tenant.name,
          tagline: tenant.tagline ?? "",
          themeHue: tenant.theme_hue ?? 162,
          groupLink: tenant.group_link ?? "",
          plan: "free",
        },
        track: {
          id: track.id,
          title: track.title,
          subtitle: track.subtitle,
          oneLine: track.one_line,
          totalMinutes: track.total_minutes,
          cumulativeViewers: track.cumulative_viewers,
        },
        lessons: publicLessonsToStudent(lessons),
        source: "api",
        noStudentSessionYet: true,
      };
    } catch {
      return null;
    }
  }
  // mock
  if (slug !== mockTenant.slug) return null;
  const t = mockTracks[0]!;
  return {
    tenant: mockTenant,
    track: {
      id: t.id,
      title: t.title,
      subtitle: t.subtitle,
      oneLine: t.oneLine,
      totalMinutes: t.totalMinutes,
      cumulativeViewers: t.cumulativeViewers,
    },
    lessons: mockStudentLessons,
    continueLessonId: mockStudentLessons.find((l) => l.status === "playing")?.id,
    source: "mock",
    noStudentSessionYet: false,
  };
}

// 学员播放页
export type StudentLessonData = {
  tenant: Tenant;
  lesson: { id: string; n: number; t: string; d: string; progress?: number };
  prev: { id: string; t: string; status: string } | null;
  next: { id: string; t: string; status: string } | null;
  watermarkPhone: string;
  source: Source;
};

export async function getStudentLesson(
  slug: string,
  lessonId: string,
): Promise<StudentLessonData | null> {
  if (apiEnabled()) {
    try {
      const [{ tenant }, { lessons }] = await Promise.all([
        fetchPublicLesson(slug, lessonId),
        fetchPublicLanding(slug),
      ]);
      const idx = lessons.findIndex((l) => l.id === lessonId);
      if (idx < 0) return null;
      const cur = lessons[idx]!;
      const prevL = idx > 0 ? lessons[idx - 1]! : null;
      const nextL = idx < lessons.length - 1 ? lessons[idx + 1]! : null;
      return {
        tenant: {
          slug: tenant.slug,
          name: tenant.name,
          tagline: "",
          themeHue: 162,
          groupLink: "",
          plan: "free",
        },
        lesson: { id: cur.id, n: idx, t: cur.title, d: cur.duration_text },
        prev: prevL ? { id: prevL.id, t: prevL.title, status: prevL.status } : null,
        next: nextL ? { id: nextL.id, t: nextL.title, status: nextL.status } : null,
        // V0.5 起接公众号 OAuth2 后才有真实手机号,这里给占位
        watermarkPhone: "138****0000",
        source: "api",
      };
    } catch {
      return null;
    }
  }
  // mock
  if (slug !== mockTenant.slug) return null;
  const idx = mockStudentLessons.findIndex((l) => l.id === lessonId);
  if (idx < 0) return null;
  const cur = mockStudentLessons[idx]!;
  const prev = idx > 0 ? mockStudentLessons[idx - 1]! : null;
  const next = idx < mockStudentLessons.length - 1 ? mockStudentLessons[idx + 1]! : null;
  return {
    tenant: mockTenant,
    lesson: { id: cur.id, n: cur.n, t: cur.t, d: cur.d, progress: cur.progress },
    prev: prev ? { id: prev.id, t: prev.t, status: prev.status } : null,
    next: next ? { id: next.id, t: next.t, status: next.status } : null,
    watermarkPhone: mockWatermark,
    source: "mock",
  };
}

export async function getStudentMe(slug: string): Promise<{
  tenant: Tenant;
  source: Source;
} | null> {
  if (apiEnabled()) {
    try {
      const { tenant } = await fetchPublicLanding(slug);
      return {
        tenant: {
          slug: tenant.slug,
          name: tenant.name,
          tagline: tenant.tagline ?? "",
          themeHue: tenant.theme_hue ?? 162,
          groupLink: tenant.group_link ?? "",
          plan: "free",
        },
        source: "api",
      };
    } catch {
      return null;
    }
  }
  if (slug !== mockTenant.slug) return null;
  return { tenant: mockTenant, source: "mock" };
}

// 工具：当前 tenant slug（前端路由用）
export { tenantSlug as getCurrentTenantSlug };
