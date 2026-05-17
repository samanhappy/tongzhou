// 同舟 · MVP Mock 数据层
//
// 占位语义：未来接入真实后端时，这里替换为 API 调用即可。
// 数据形状参考 roadmap/02-数据模型.md 与 07-V0范围与计量模型.md。

export type LessonStatus =
  | "published"
  | "draft"
  | "uploading"
  | "transcoding"
  | "failed";

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  durationSec?: number; // 已发布课时
  durationText: string; // "08:24" 或 "—"
  status: LessonStatus;
  views?: number;
  progress?: number; // 上传/转码进度 0-100
};

export type Track = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  oneLine: string;
  status: "published" | "draft";
  totalMinutes: number;
  cumulativeViewers: number;
  completionRate: number; // 0-100
  lessons: Lesson[];
};

export type Member = {
  id: string;
  name: string; // "李 ·· 茜" 隐藏中间字
  phone: string; // "138****2204" 或 "—"
  source: string; // CSV · 知识星球 / 单加 / 邀请短链
  joinedAt: string; // "5/02"
  courseCount: number;
  playbackMinutes: number;
  lastActive: string;
  bound: boolean;
  anonymous?: boolean;
};

export type UsageMeter = {
  key: string;
  name: string;
  value: number;
  max: number;
  unit: string;
  sub: string;
  sample: string;
};

export type Activity = {
  who: string;
  what: string;
  t: string;
};

export type Tenant = {
  slug: string; // xingchunge
  name: string; // 醒春阁
  tagline: string;
  themeHue: number; // 162 墨青
  groupLink: string; // 加群联系老师
  plan: "free" | "pro" | "custom";
};

// ─────────────────────────────────────────────
// 当前 Tenant（演示创作者）
// ─────────────────────────────────────────────
export const tenant: Tenant = {
  slug: "xingchunge",
  name: "醒春阁",
  tagline: "七天清晨的写作陪跑 · 一念一札，从见我到见今。",
  themeHue: 162,
  groupLink: "https://work.weixin.qq.com/kfid/xingchunge",
  plan: "free",
};

// ─────────────────────────────────────────────
// Tracks（课程）
// ─────────────────────────────────────────────
export const tracks: Track[] = [
  {
    id: "trk_qrqt",
    slug: "qrqt",
    title: "七天成长计划",
    subtitle: "习作启蒙",
    oneLine: "在七个清晨，从「见我」走到「见今」。每日 10 分钟，写一张札。",
    status: "published",
    totalMinutes: 62,
    cumulativeViewers: 96,
    completionRate: 54,
    lessons: [
      {
        id: "s1",
        title: "开篇·一支笔之外",
        summary: "写作不是技巧，是看世界的方式。",
        durationText: "08:24",
        status: "published",
        views: 38,
      },
      {
        id: "s2",
        title: "第一日·见我",
        summary: "从一个清晨开始，把第一念落到纸上。",
        durationText: "09:12",
        status: "published",
        views: 31,
      },
      {
        id: "s3",
        title: "第二日·见物",
        summary: "练习观察一件物，把它写成一篇 300 字短札。",
        durationText: "11:02",
        status: "published",
        views: 24,
      },
      {
        id: "s4",
        title: "第三日·见人",
        summary: "把今日遇到的一个人写下来——不评价，只描述。",
        durationText: "—",
        status: "uploading",
        progress: 64,
      },
      {
        id: "s5",
        title: "第四日·见事",
        summary: "今日的一件事，从五个角度复写。",
        durationText: "—",
        status: "transcoding",
        progress: 38,
      },
      {
        id: "s6",
        title: "第五日·见念",
        summary: "心里冒出来的一念，捕住它，落墨。",
        durationText: "10:30",
        status: "draft",
        views: 0,
      },
      {
        id: "s7",
        title: "第六日·见旧",
        summary: "重读一年前的自己——只写感受，不改。",
        durationText: "—",
        status: "failed",
      },
      {
        id: "s8",
        title: "第七日·见今",
        summary: "把这七日写成一封给自己的信。",
        durationText: "12:45",
        status: "draft",
        views: 0,
      },
    ],
  },
];

export function getTrack(id: string): Track | undefined {
  return tracks.find((t) => t.id === id || t.slug === id);
}

// ─────────────────────────────────────────────
// 学员名单
// ─────────────────────────────────────────────
export const members: Member[] = [
  {
    id: "m1",
    name: "李 ·· 茜",
    phone: "138****2204",
    source: "CSV · 知识星球",
    joinedAt: "5/02",
    courseCount: 6,
    playbackMinutes: 482,
    lastActive: "刚刚",
    bound: true,
  },
  {
    id: "m2",
    name: "周 ·· 屿",
    phone: "—",
    source: "邀请短链",
    joinedAt: "5/12",
    courseCount: 3,
    playbackMinutes: 192,
    lastActive: "12 分钟前",
    bound: false,
  },
  {
    id: "m3",
    name: "陈 ·· 鹿",
    phone: "139****8810",
    source: "单加",
    joinedAt: "5/03",
    courseCount: 5,
    playbackMinutes: 391,
    lastActive: "26 分钟前",
    bound: true,
  },
  {
    id: "m4",
    name: "吴 ·· 默",
    phone: "186****4119",
    source: "CSV · 小报童",
    joinedAt: "5/01",
    courseCount: 7,
    playbackMinutes: 612,
    lastActive: "1 小时前",
    bound: true,
  },
  {
    id: "m5",
    name: "苏 ·· 砚",
    phone: "—",
    source: "邀请短链",
    joinedAt: "5/16",
    courseCount: 1,
    playbackMinutes: 12,
    lastActive: "2 小时前",
    bound: false,
  },
  {
    id: "m6",
    name: "顾 ·· 行",
    phone: "135****0327",
    source: "单加",
    joinedAt: "4/28",
    courseCount: 6,
    playbackMinutes: 540,
    lastActive: "今早",
    bound: true,
  },
  {
    id: "m7",
    name: "卫 ·· 棠",
    phone: "151****6620",
    source: "CSV · 知识星球",
    joinedAt: "5/06",
    courseCount: 4,
    playbackMinutes: 268,
    lastActive: "昨日",
    bound: true,
  },
  {
    id: "m8",
    name: "—",
    phone: "—",
    source: "邀请短链 · 未绑定",
    joinedAt: "5/15",
    courseCount: 2,
    playbackMinutes: 38,
    lastActive: "昨日",
    bound: false,
    anonymous: true,
  },
  {
    id: "m9",
    name: "金 ·· 砚",
    phone: "153****0044",
    source: "单加",
    joinedAt: "4/22",
    courseCount: 8,
    playbackMinutes: 720,
    lastActive: "3 日前",
    bound: true,
  },
];

// ─────────────────────────────────────────────
// Freemium quota 与本月用量（占位数值，roadmap Q1-Q2 待定）
// ─────────────────────────────────────────────
export const usageMeters: UsageMeter[] = [
  {
    key: "members.active_count",
    name: "月活学员",
    value: 142,
    max: 200,
    unit: "人",
    sub: "学员任意一次访问即视为本月活跃 · 月底清零去重",
    sample: "访问事件 / 实时",
  },
  {
    key: "courses.count",
    name: "发布课程",
    value: 6,
    max: 10,
    unit: "门",
    sub: "status = published 的课程数 · 取本月最大值",
    sample: "课程状态变更 / 实时",
  },
  {
    key: "storage.bytes",
    name: "视频存储",
    value: 3.8,
    max: 5,
    unit: "GB",
    sub: "OSS bucket 用量 · 每日 03:00 快照 · 月内取平均",
    sample: "OSS 用量快照 / 每日",
  },
  {
    key: "playback.minutes",
    name: "播放分钟",
    value: 1284,
    max: 1500,
    unit: "分钟",
    sub: "播放器 30 秒心跳累加 · 当月加总",
    sample: "心跳事件 / 30 秒",
  },
];

// 顶部 4 维度统计 (Dashboard 用，含 trend)
export const dashboardStats = [
  {
    label: "月活学员",
    value: "142",
    unit: "人",
    delta: 12,
    trend: [20, 28, 35, 41, 52, 68, 84, 92, 108, 124, 131, 142],
    foot: "本月 +18 · 含 7 位绑定手机号",
  },
  {
    label: "已发布课程",
    value: "6",
    unit: "门",
    delta: 0,
    trend: [2, 2, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6],
    foot: "2 门草稿中",
  },
  {
    label: "累计播放",
    value: "1,284",
    unit: "分钟",
    delta: 24,
    trend: [40, 60, 80, 120, 180, 240, 320, 420, 580, 740, 980, 1284],
    foot: "均时长 9.0 分钟 / 次",
  },
  {
    label: "视频存储",
    value: "3.8",
    unit: "GB",
    delta: 6,
    trend: [0.4, 0.8, 1.0, 1.4, 1.8, 2.1, 2.5, 2.8, 3.1, 3.4, 3.6, 3.8],
    foot: "共 12 个视频 · 平均 320 MB",
  },
] as const;

// 课程观看（Dashboard）
export const courseWatchRows = [
  { name: "习作十讲 · 第一章", view: 38, mins: 482, complete: 72 },
  { name: "习作十讲 · 第二章", view: 31, mins: 312, complete: 58 },
  { name: "晨课 · 春分", view: 24, mins: 178, complete: 64 },
  { name: "晨课 · 谷雨", view: 19, mins: 142, complete: 52 },
  { name: "夜读 · 蒹葭", view: 12, mins: 88, complete: 41 },
] as const;

// 最近活动（Dashboard）
export const recentActivities: Activity[] = [
  { who: "李 ·· 茜", what: "看完《晨课 · 春分》", t: "刚刚" },
  { who: "周 ·· 屿", what: "进入《习作十讲》第二章", t: "12 分钟前" },
  { who: "陈 ·· 鹿", what: "绑定了手机号", t: "26 分钟前" },
  { who: "吴 ·· 默", what: "看完《习作十讲》第一章", t: "1 小时前" },
  { who: "苏 ·· 砚", what: "首次进入醒春阁", t: "2 小时前" },
];

// 学员侧 H5：lessons 状态枚举（与课程数据 join）
export type StudentLessonStatus = "done" | "playing" | "available" | "locked";

export type StudentLesson = {
  n: number;
  id: string;
  t: string;
  d: string;
  status: StudentLessonStatus;
  progress?: number;
};

export const studentLessons: StudentLesson[] = [
  { n: 0, id: "s1", t: "开篇 · 一支笔之外", d: "08:24", status: "done" },
  { n: 1, id: "s2", t: "第一日 · 见我", d: "09:12", status: "done" },
  {
    n: 2,
    id: "s3",
    t: "第二日 · 见物",
    d: "11:02",
    status: "playing",
    progress: 64,
  },
  { n: 3, id: "s4", t: "第三日 · 见人", d: "—", status: "locked" },
  { n: 4, id: "s5", t: "第四日 · 见事", d: "—", status: "locked" },
  { n: 5, id: "s6", t: "第五日 · 见念", d: "10:30", status: "available" },
  { n: 6, id: "s7", t: "第六日 · 见旧", d: "—", status: "locked" },
  { n: 7, id: "s8", t: "第七日 · 见今", d: "12:45", status: "locked" },
];

export const watermarkPhone = "138****2204";
