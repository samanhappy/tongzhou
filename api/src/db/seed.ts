// 同舟 · 演示数据 seed
// 与 app/lib/mock.ts 对齐 — 醒春阁 + 七天成长计划。
// 重复执行幂等：先按 slug 看是否已存在。

import { initDb } from "./index.js";
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
  { title: "开篇·一支笔之外", summary: "写作不是技巧，是看世界的方式。", durationText: "08:24", durationSec: 504, status: "published", views: 38 },
  { title: "第一日·见我", summary: "从一个清晨开始，把第一念落到纸上。", durationText: "09:12", durationSec: 552, status: "published", views: 31 },
  { title: "第二日·见物", summary: "练习观察一件物，把它写成一篇 300 字短札。", durationText: "11:02", durationSec: 662, status: "published", views: 24 },
  { title: "第三日·见人", summary: "把今日遇到的一个人写下来——不评价，只描述。", durationText: "—", status: "uploading", progress: 64 },
  { title: "第四日·见事", summary: "今日的一件事，从五个角度复写。", durationText: "—", status: "transcoding", progress: 38 },
  { title: "第五日·见念", summary: "心里冒出来的一念，捕住它，落墨。", durationText: "10:30", durationSec: 630, status: "draft", views: 0 },
  { title: "第六日·见旧", summary: "重读一年前的自己——只写感受，不改。", durationText: "—", status: "failed" },
  { title: "第七日·见今", summary: "把这七日写成一封给自己的信。", durationText: "12:45", durationSec: 765, status: "draft", views: 0 },
];

const MEMBERS = [
  { name: "李 ·· 茜", phone: "138****2204", source: "CSV · 知识星球", bound: true, joinedAt: "5/02" },
  { name: "周 ·· 屿", phone: "—", source: "邀请短链", bound: false, joinedAt: "5/12" },
  { name: "陈 ·· 鹿", phone: "139****8810", source: "单加", bound: true, joinedAt: "5/03" },
  { name: "吴 ·· 默", phone: "186****4119", source: "CSV · 小报童", bound: true, joinedAt: "5/01" },
  { name: "苏 ·· 砚", phone: "—", source: "邀请短链", bound: false, joinedAt: "5/16" },
  { name: "顾 ·· 行", phone: "135****0327", source: "单加", bound: true, joinedAt: "4/28" },
  { name: "卫 ·· 棠", phone: "151****6620", source: "CSV · 知识星球", bound: true, joinedAt: "5/06" },
  { name: "金 ·· 砚", phone: "153****0044", source: "单加", bound: true, joinedAt: "4/22" },
];

async function main() {
  await initDb();

  let tenant = tenantsRepo.getBySlug(TENANT.slug);
  if (!tenant) {
    tenant = tenantsRepo.create(TENANT);
    console.log(`[seed] tenant created: ${tenant.slug} (${tenant.id})`);
  } else {
    console.log(`[seed] tenant exists: ${tenant.slug}`);
  }

  let track = tracksRepo.getBySlug(tenant.id, TRACK.slug);
  if (!track) {
    track = tracksRepo.create(tenant.id, TRACK);
    tracksRepo.update(tenant.id, track.id, { status: "published" });
    console.log(`[seed] track created: ${track.slug}`);
  } else {
    console.log(`[seed] track exists: ${track.slug}`);
  }

  const existing = lessonsRepo.listByTrack(tenant.id, track.id);
  if (!existing.length) {
    LESSONS.forEach((l, i) => {
      lessonsRepo.create(tenant!.id, track!.id, {
        title: l.title,
        summary: l.summary,
        position: i,
        durationSec: l.durationSec,
        durationText: l.durationText,
        status: l.status,
      });
      // 已发布课时塞一个假 upload 让 storage.bytes 不为 0
      if (l.status === "published" && l.durationSec) {
        uploadsRepo.create(tenant!.id, {
          filename: `${l.title}.mp4`,
          mime: "video/mp4",
          // 320 MB 平均
          sizeBytes: 320 * 1024 * 1024,
          storageDriver: "local",
          storageKey: `videos/${tenant!.id}/seed-${i}.mp4`,
          url: `http://localhost:4100/files/videos/${tenant!.id}/seed-${i}.mp4`,
        });
      }
    });
    // 写回 views（mock 演示用）
    lessonsRepo.listByTrack(tenant.id, track.id).forEach((row, i) => {
      const src = LESSONS[i];
      if (src?.views) lessonsRepo.update(tenant!.id, row.id, { views: src.views });
    });
    tracksRepo.recomputeStats(tenant.id, track.id);
    console.log(`[seed] lessons created: ${LESSONS.length}`);
  } else {
    console.log(`[seed] lessons exist: ${existing.length}`);
  }

  // 演示用 completion_rate（mock 演示一致）
  tracksRepo.update(tenant.id, track.id, { position: 0 });

  const mCount = membersRepo.listByTenant(tenant.id).length;
  if (mCount === 0) {
    for (const m of MEMBERS) membersRepo.create(tenant.id, m);
    console.log(`[seed] members created: ${MEMBERS.length}`);
  } else {
    console.log(`[seed] members exist: ${mCount}`);
  }

  // 给 playback.minutes 注入一些事件，让用量看板有数
  // 累计 1284 分钟 = mock 中显示的值
  usageRepo.recordEvent({
    tenantId: tenant.id,
    metricKey: "playback.minutes",
    delta: 1284,
    refKind: "snapshot",
    meta: { reason: "seed-backfill" },
  });
  usageRepo.recomputeMonth(tenant.id);

  console.log(`[seed] done.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
