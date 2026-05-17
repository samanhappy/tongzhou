// 同舟 · 腾讯云 VOD 适配器
//
// 依赖：tencentcloud-sdk-nodejs-vod
// 必需 env：VOD_SECRET_ID, VOD_SECRET_KEY, VOD_SUB_APP_ID(可选), VOD_KEY(playAuth 密钥)
//
// 三个操作：
//   upload      → 用 VOD ApplyUpload + 直传 COS + CommitUpload 流程(SDK 封装好了)
//   getPlayInfo → DescribeMediaInfos 拿到原始播放 URL + 用 VOD Key 防盗签 6h
//   delete      → DeleteMedia
//
// 6h playAuth 红线(roadmap)：
//   URL 拼接 ?t=<hex(expireTs)>&sign=md5(KEY+path+t)
//   见 https://cloud.tencent.com/document/product/266/14048 (Key 防盗链)
//
// ❗ MVP 阶段 SDK 调用是「按文档写法」实现,需要真账号 + 二次集成测试。
// 我把可执行的 happy path 写完整,具体 SDK 版本若 API 微调,按错误提示改即可。

import crypto from "node:crypto";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { newId } from "../lib/id.js";
import type { Video, VideoPlayInfo, VideoUploadResult } from "./index.js";

type VodConfig = {
  secretId?: string;
  secretKey?: string;
  region?: string;
  subAppId?: number;
  /** Key 防盗链密钥 — 在 VOD 控制台「分发播放设置」配置 */
  playKey?: string;
};

// 最小手写类型(SDK 类型很重,只挑用到的)
type VodMediaInfo = {
  FileId: string;
  BasicInfo: {
    Name: string;
    MediaUrl: string;
    Status: string;
    Size: number;
  };
  MetaData?: {
    Duration?: number;
    Size?: number;
  };
};

export function createTencentVodVideo(cfg: VodConfig): Video {
  const must = (v: string | undefined, name: string): string => {
    if (!v) throw new Error(`[video/tencent-vod] missing ${name}`);
    return v;
  };
  const secretId = must(cfg.secretId, "VOD_SECRET_ID");
  const secretKey = must(cfg.secretKey, "VOD_SECRET_KEY");
  const region = cfg.region ?? "ap-shanghai";
  const subAppId = cfg.subAppId;

  // 懒加载 SDK,避免缺包时也能 typecheck
  async function getClient() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore  SDK 没有完整 d.ts
    const mod = await import("tencentcloud-sdk-nodejs-vod");
    const VodClient = (mod as unknown as {
      vod: { v20180717: { Client: new (cfg: unknown) => unknown } };
    }).vod.v20180717.Client;
    return new VodClient({
      credential: { secretId, secretKey },
      region,
      profile: { httpProfile: { endpoint: "vod.tencentcloudapi.com" } },
    }) as unknown as {
      DescribeMediaInfos: (req: {
        FileIds: string[];
        Filters?: string[];
        SubAppId?: number;
      }) => Promise<{ MediaInfoSet: VodMediaInfo[] }>;
      DeleteMedia: (req: { FileId: string; SubAppId?: number }) => Promise<unknown>;
    };
  }

  // 上传需要专门的 VodUploadClient(走 ApplyUpload → COS 直传 → CommitUpload)
  // 这个 SDK 在 tencentcloud-sdk-nodejs-vod 里没有,腾讯单独发了一个 vod-node-sdk。
  // 为避免再加一个依赖,这里实现一个简化版:把 buffer 先落本地 tmp,再走 ApplyUpload + cos PUT。
  // 真生产推荐直接用 https://github.com/tencentyun/vod-node-sdk
  async function uploadViaApply(args: {
    filename: string;
    body: Buffer;
    mime: string;
  }): Promise<{ fileId: string; mediaUrl: string; size: number }> {
    // 落 tmp 文件以兼容某些 SDK 路径输入
    const tmp = path.join(os.tmpdir(), `tz-vod-${newId()}-${args.filename}`);
    await fs.writeFile(tmp, args.body);
    try {
      // ApplyUpload — 拿到上传 COS 签名
      const client = await getClient();
      const apply = (client as unknown as {
        ApplyUpload: (req: {
          MediaType: string;
          MediaName?: string;
          SubAppId?: number;
        }) => Promise<{
          VodSessionKey: string;
          MediaStoragePath: string;
          StorageBucket: string;
          StorageRegion: string;
          TempCertificate: {
            SecretId: string;
            SecretKey: string;
            Token: string;
            ExpiredTime: number;
          };
        }>;
      }).ApplyUpload;
      const mediaType = inferMediaType(args.filename);
      const applyRes = await apply({
        MediaType: mediaType,
        MediaName: args.filename,
        SubAppId: subAppId,
      });

      // 用临时凭证 PUT 到 COS
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const COS = (await import("cos-nodejs-sdk-v5")).default;
      const cos = new COS({
        SecretId: applyRes.TempCertificate.SecretId,
        SecretKey: applyRes.TempCertificate.SecretKey,
        SecurityToken: applyRes.TempCertificate.Token,
      }) as unknown as {
        putObject: (params: {
          Bucket: string;
          Region: string;
          Key: string;
          Body: Buffer;
        }) => Promise<unknown>;
      };
      await cos.putObject({
        Bucket: applyRes.StorageBucket,
        Region: applyRes.StorageRegion,
        Key: applyRes.MediaStoragePath,
        Body: args.body,
      });

      // CommitUpload — 提交转码
      const commit = (client as unknown as {
        CommitUpload: (req: {
          VodSessionKey: string;
          SubAppId?: number;
        }) => Promise<{ FileId: string; MediaUrl: string }>;
      }).CommitUpload;
      const commitRes = await commit({
        VodSessionKey: applyRes.VodSessionKey,
        SubAppId: subAppId,
      });

      return {
        fileId: commitRes.FileId,
        mediaUrl: commitRes.MediaUrl,
        size: args.body.length,
      };
    } finally {
      await fs.rm(tmp, { force: true });
    }
  }

  return {
    driver: "tencent-vod",

    async upload({ filename, body, mime }): Promise<VideoUploadResult> {
      void mime; // mime 由 ApplyUpload 自己探测
      const res = await uploadViaApply({ filename, body, mime });
      return {
        videoId: res.fileId,
        rawUrl: res.mediaUrl,
        sizeBytes: res.size,
      };
    },

    async getPlayInfo(videoId, opts): Promise<VideoPlayInfo> {
      const expiresSec = opts?.expiresSec ?? 6 * 3600;
      const client = await getClient();
      const r = await client.DescribeMediaInfos({
        FileIds: [videoId],
        Filters: ["basicInfo", "metaData"],
        SubAppId: subAppId,
      });
      const m = r.MediaInfoSet[0];
      if (!m) throw new Error(`[video/vod] media ${videoId} not found`);
      const rawUrl = m.BasicInfo.MediaUrl;
      const playUrl = cfg.playKey
        ? signKeyAntiTheft(rawUrl, cfg.playKey, expiresSec)
        : rawUrl;
      return {
        playUrl,
        expiresAt: Date.now() + expiresSec * 1000,
      };
    },

    async delete(videoId) {
      const client = await getClient();
      await client.DeleteMedia({ FileId: videoId, SubAppId: subAppId });
    },
  };
}

function inferMediaType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "mp4";
  // VOD 支持的视频类型
  const VIDEO_EXTS = ["mp4", "mov", "avi", "mkv", "flv", "wmv", "m3u8", "webm"];
  if (VIDEO_EXTS.includes(ext)) return ext;
  return "mp4";
}

/**
 * VOD Key 防盗链签名 (URL Token)
 * 算法: t=hex(expireTs); sign=md5(KEY + path + t)
 * https://cloud.tencent.com/document/product/266/14048
 */
function signKeyAntiTheft(url: string, key: string, expiresSec: number): string {
  const u = new URL(url);
  const path = u.pathname;
  const expireTs = Math.floor(Date.now() / 1000) + expiresSec;
  const t = expireTs.toString(16);
  const sign = crypto
    .createHash("md5")
    .update(`${key}${path}${t}`)
    .digest("hex");
  u.searchParams.set("t", t);
  u.searchParams.set("sign", sign);
  return u.toString();
}
