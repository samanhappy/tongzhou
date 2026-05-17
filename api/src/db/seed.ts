// 同舟 · 演示数据 seed
// 与 app/lib/mock.ts 对齐 — 醒春阁 + 七天成长计划。
// 重复执行幂等：先按 slug 看是否已存在。
//
// PG 模式：脚本运行没有 request scope,所以全程走 default pool
// → 对 RLS 表的写入需要先 SET app.tenant_id。
// 为保持脚本简单,推荐用 SUPERUSER 账户跑 seed(超管不受 RLS 限制)。
// 或者：写完后用 set_config 手动测试 RLS 是否生效。

import { initDb, getDb, requestScope } from "./index.js";
import * as tenantsRepo from "../modules/tenants/repo.js";
import * as tracksRepo from "../modules/tracks/repo.js";
import * as lessonsRepo from "../modules/lessons/repo.js";
import * as membersRepo from "../modules/members/repo.js";
import * as uploadsRepo from "../modules/uploads/repo.js";
import * as usageRepo from "../modules/usage/repo.js";

const TENANT = {
  slug: "xingchunge",
  name: "醒春阁",
  tagline: "七天清晨的写作陪跑 · 一念一札，从见我到见今。",
  themeHue: 162,
  groupLink: "https://work.weixin.qq.com/kfid/xingchunge",
};

const TRACK = {
  slug: "qrqt",
  title: "七天成长计划",
  subtitle: "习作启蒙",
  oneLine: "在七个清晨，从「见我」走到「见今」。每日 10 分钟，写一张札。",
};

type LessonSeed = {
  title: string;
  summary: string;
  durationText: string;
  durationSec?: number;
  status: "published" | "draft" | "uploading" | "transcoding" | "failed";
  views?: number;
  progress?: number;
};

const LESSONS: LessonSeed[] = [
  {
    title: "开篇·一支笔之外",
    summary: "写作不是技巧，是看世界的方式。",
    durationText: "08:24",
    durationSec: 504,
    status: "published",
    views: 38,
  },
  {
    title: "第一日·见我",
    summary: "从一个清晨开始，把第一念落到纸上。",
    durationText: "09:12",
    durationSec: 552,
    status: "published",
    views: 31,
  },
  {
    title: "第二日·见物",
    summary: "练习观察一件物，把它写成一篇 300 字短札。",
    durationText: "11:02",
    durationSec: 662,
    status: "published",
    views: 24,
  },
  {
    title: "第三日·见人",
    summary: "把今日遇到的一个人写下来——不评价，只描述。",
    durationText: "—",
    status: "uploading",
    progress: 64,
  },
  {
    title: "第四日·见事",
    summary: "今日的一件事，从五个角度复写。",
    durationText: "—",
    status: "transcoding",
    progress: 38,
  },
  {
    title: "第五日·见念",
    summary: "心里冒出来的一念，捕住它，落墨。",
    durationText: "10:30",
    durationSec: 630,
    status: "draft",
    views: 0,
  },
  {
    title: "第六日·见旧",
    summary: "重读一年前的自己——只写感受，不改。",
    durationText: "—",
    status: "failed",
  },
  {
    title: "第七日·见今",
    summary: "把这七日写成一封给自己的信。",
    durationText: "12:45",
    durationSec: 765,
    status: "draft",
    views: 0,
  },
];

const MEMBERS = [
  {
    name: "李 ·· 茜",
    phone: "138****2204",
    source: "CSV · 知识星球",
    bound: true,
    joinedAt: "5/02",
  },
  {
    name: "周 ·· 屿",
    phone: "—",
    source: "邀请短链",
    bound: false,
    joinedAt: "5/12",
  },
  {
    name: "陈 ·· 鹿",
    phone: "139****8810",
    source: "单加",
    bound: true,
    joinedAt: "5/03",
  },
  {
    name: "吴 ·· 默",
    phone: "186****4119",
    source: "CSV · 小报童",
    bound: true,
    joinedAt: "5/01",
  },
  {
    name: "苏 ·· 砚",
    phone: "—",
    source: "邀请短链",
    bound: false,
    joinedAt: "5/16",
  },
  {
    name: "顾 ·· 行",
    phone: "135****0327",
    source: "单加",
    bound: true,
    joinedAt: "4/28",
  },
  {
    name: "卫 ·· 棠",
    phone: "151****6620",
    source: "CSV · 知识星球",
    bound: true,
    joinedAt: "5/06",
  },
  {
    name: "金 ·· 砚",
    phone: "153****0044",
    source: "单加",
    bound: true,
    joinedAt: "4/22",
  },
];

async function main() {
  await initDb();
  const db = getDb();

  let tenant = await tenantsRepo.getBySlug(TENANT.slug);
  if (!tenant) {
    tenant = await tenantsRepo.create(TENANT);
    console.log(`[seed] tenant created: ${tenant.slug} (${tenant.id})`);
  } else {
    console.log(`[seed] tenant exists: ${tenant.slug}`);
  }

  // PG 模式下,后续所有插入都涉及 RLS 表 → 给当前会话挂上 app.tenant_id
  if (db.driver === "postgres") {
    // 用 ALS 包一段,模拟 request scope；这里只是设个 GUC,不开 BEGIN
    // (脚本应当用 SUPERUSER 跑,绕过 RLS；如果非 SUPERUSER 则需要此设置)
    await db.exec(`SELECT set_config('app.tenant_id', '${tenant.id}', false)`);
    console.log(`[seed] PG: app.tenant_id set to ${tenant.id}`);
  }

  await seedContent(tenant.id);
  console.log(`[seed] done.`);
}

async function seedContent(tenantId: string) {
  let track = await tracksRepo.getBySlug(tenantId, TRACK.slug);
  if (!track) {
    track = await tracksRepo.create(tenantId, TRACK);
    await tracksRepo.update(tenantId, track.id, { status: "published" });
    console.log(`[seed] track created: ${track.slug}`);
  } else {
    console.log(`[seed] track exists: ${track.slug}`);
  }

  const existing = await lessonsRepo.listByTrack(tenantId, track.id);
  if (!existing.length) {
    for (let i = 0; i < LESSONS.length; i++) {
      const l = LESSONS[i]!;
      const lesson = await lessonsRepo.create(tenantId, track.id, {
        title: l.title,
        summary: l.summary,
        position: i,
        durationSec: l.durationSec,
        durationText: l.durationText,
        status: l.status,
      });
      if (l.views)
        await lessonsRepo.update(tenantId, lesson.id, { views: l.views });

      if (l.status === "published" && l.durationSec) {
        await uploadsRepo.create(tenantId, {
          filename: `${l.title}.mp4`,
          mime: "video/mp4",
          sizeBytes: 320 * 1024 * 1024,
          storageDriver: "local",
          storageKey: `videos/${tenantId}/seed-${i}.mp4`,
          url: `http://localhost:4100/files/videos/${tenantId}/seed-${i}.mp4`,
        });
      }
    }
    await tracksRepo.recomputeStats(tenantId, track.id);
    console.log(`[seed] lessons created: ${LESSONS.length}`);
  } else {
    console.log(`[seed] lessons exist: ${existing.length}`);
  }

  const mCount = (await membersRepo.listByTenant(tenantId)).length;
  if (mCount === 0) {
    for (const m of MEMBERS) await membersRepo.create(tenantId, m);
    console.log(`[seed] members created: ${MEMBERS.length}`);
  } else {
    console.log(`[seed] members exist: ${mCount}`);
  }

  await usageRepo.recordEvent({
    tenantId,
    metricKey: "playback.minutes",
    delta: 1284,
    refKind: "snapshot",
    meta: { reason: "seed-backfill" },
  });
  await usageRepo.recomputeMonth(tenantId);
}

main()
  .then(async () => {
    const db = getDb();
    await db.close();
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

// Suppress unused warning - exported for future API
void requestScope;
