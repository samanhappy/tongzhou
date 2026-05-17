// 同舟 · 腾讯云 COS Storage 适配器
//
// 依赖：cos-nodejs-sdk-v5
// 必需 env：COS_SECRET_ID, COS_SECRET_KEY, COS_BUCKET, COS_REGION
// 可选：COS_CDN_DOMAIN（推荐：CDN 加速 + 防盗链）
//
// 直传流程(推荐生产用法)：
//   1. 前端 POST /api/uploads/sign { filename, mime }
//   2. 后端 sign() 返回 PUT URL + headers
//   3. 前端 PUT 文件到 COS（带签名 URL,绕过本服务流量）
//   4. 前端拿 finalUrl,POST /api/uploads/complete 把元数据落库
//
// 服务端中转(MVP 兼容,适合小文件 / 调试)：
//   /api/uploads → multipart → putObject() → 落库
//
// 防盗链：在 COS 控制台开 Referer 防盗链 + CDN URL 鉴权,本代码生成的 url 是 CDN 域。

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore  cos-nodejs-sdk-v5 没有完整类型,我们用最小手写类型替代
import COS from "cos-nodejs-sdk-v5";
import type { Storage, StorageObject, UploadCredential } from "./index.js";

type CosConfig = {
  secretId?: string;
  secretKey?: string;
  bucket?: string;
  region?: string;
  cdnDomain?: string;
};

// 最小类型(SDK 没出官方 d.ts 时用)
type COSClient = {
  putObject: (params: {
    Bucket: string;
    Region: string;
    Key: string;
    Body: Buffer;
    ContentType?: string;
  }) => Promise<{ Location: string; ETag: string }>;
  getObjectUrl: (
    params: {
      Bucket: string;
      Region: string;
      Key: string;
      Method?: "GET" | "PUT";
      Sign?: boolean;
      Expires?: number;
    },
    cb?: (err: unknown, data: { Url: string }) => void,
  ) => string | void;
  deleteObject: (params: {
    Bucket: string;
    Region: string;
    Key: string;
  }) => Promise<unknown>;
};

export function createTencentCosStorage(cos: CosConfig): Storage {
  const must = (v: string | undefined, name: string): string => {
    if (!v) throw new Error(`[storage/tencent-cos] missing ${name}`);
    return v;
  };
  const bucket = must(cos.bucket, "COS_BUCKET");
  const region = must(cos.region, "COS_REGION");

  const client = new COS({
    SecretId: must(cos.secretId, "COS_SECRET_ID"),
    SecretKey: must(cos.secretKey, "COS_SECRET_KEY"),
  }) as unknown as COSClient;

  // 学员访问 URL：优先 CDN 域(防盗链 + 缓存),退化到 COS 直链
  function publicUrlFor(key: string): string {
    if (cos.cdnDomain) {
      const d = cos.cdnDomain.replace(/\/$/, "");
      return `${d}/${key}`;
    }
    return `https://${bucket}.cos.${region}.myqcloud.com/${key}`;
  }

  return {
    driver: "tencent-cos",

    async putObject({ key, body, mime }): Promise<StorageObject> {
      await client.putObject({
        Bucket: bucket,
        Region: region,
        Key: key,
        Body: body,
        ContentType: mime,
      });
      return { key, url: publicUrlFor(key), size: body.length, mime };
    },

    async sign({ key, mime, expiresSec = 600 }): Promise<UploadCredential> {
      // getObjectUrl 同时支持 Sync 返回值和 callback；新版返回 string
      const url = await new Promise<string>((resolve, reject) => {
        const ret = client.getObjectUrl(
          {
            Bucket: bucket,
            Region: region,
            Key: key,
            Method: "PUT",
            Sign: true,
            Expires: expiresSec,
          },
          (err, data) => (err ? reject(err) : resolve(data.Url)),
        );
        if (typeof ret === "string" && ret.length) resolve(ret); // 兼容同步返回
      });
      return {
        method: "PUT",
        uploadUrl: url,
        headers: { "content-type": mime },
        finalUrl: publicUrlFor(key),
        key,
        expiresAt: Date.now() + expiresSec * 1000,
      };
    },

    async delete(key) {
      await client.deleteObject({ Bucket: bucket, Region: region, Key: key });
    },

    publicUrl(key) {
      return publicUrlFor(key);
    },

    async signedReadUrl(key, expiresSec = 6 * 3600): Promise<string> {
      // 私有桶下,学员端需要带签名才能 GET 到媒资。
      // 这里走 COS 直签 URL；后续切 CDN URL 鉴权时,改成走 CDN domain + 签名拼接。
      return new Promise<string>((resolve, reject) => {
        const ret = client.getObjectUrl(
          {
            Bucket: bucket,
            Region: region,
            Key: key,
            Method: "GET",
            Sign: true,
            Expires: expiresSec,
          },
          (err, data) => (err ? reject(err) : resolve(data.Url)),
        );
        if (typeof ret === "string" && ret.length) resolve(ret);
      });
    },
  };
}
