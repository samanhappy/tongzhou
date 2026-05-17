// 同舟 · 腾讯云 COS Storage（口子 · 未实现）
//
// 待办（V0.5）：
//   1. npm i cos-nodejs-sdk-v5
//   2. sign() 用 cos.getAuth() / cos.getObjectUrl() 返回临时直传 URL
//      - 前端 PUT 后,通过 STS 上传完成回调通知后端 ready
//   3. putObject() 用 cos.putObject({ Bucket, Region, Key, Body })
//   4. publicUrl() 拼 CDN_DOMAIN/key
//   5. 删除 cos.deleteObject
//
// 关键约束：
//   - 视频转码：用 COS 触发函数 / 数据处理（CI），完成后写 webhook 调本服务
//     的 /api/uploads/:id/transcoded 把 uploads.phase 改为 ready
//   - 防盗链：COS Referer 防盗链 + 临时签名 URL（6h playAuth 红线）
//   - CDN：建议另接 CDN（不是必须）。学员观看走 CDN_DOMAIN

import type { Storage } from "./index.js";

type CosConfig = {
  secretId?: string;
  secretKey?: string;
  bucket?: string;
  region?: string;
  cdnDomain?: string;
};

export function createTencentCosStorage(_cos: CosConfig): Storage {
  throw new Error(
    "[storage/tencent-cos] not implemented yet. 用 STORAGE_DRIVER=local 即可。" +
      " 实现指南见 api/src/storage/tencent-cos.ts 头部注释。",
  );
}
