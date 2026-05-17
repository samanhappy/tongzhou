// 同舟 · Storage 适配器门面（视频 / 海报 / Logo）
//
// 关键决策：
// - 真生产用「直传」流程：前端拿临时凭证 → 直传到 COS → 回调通知后端
//   接口刻意支持这条路径：sign() 给前端凭证、register() 让后端落库
// - MVP 用「服务器中转」：前端 POST multipart 给 API，API 落本地盘
//   走 putObject() 一把流式存
//
// V0.5 切 COS 时只换 ./tencent-cos.ts 实现，业务/前端不动。

export type StorageObject = {
  /** 存储 key（业务无关）— "videos/tenant_xxx/abc.mp4" */
  key: string;
  /** 学员侧可访问 URL（CDN 后域名 或 localhost） */
  url: string;
  /** 大小、mime 由调用方传入或服务端探测 */
  size: number;
  mime: string;
};

export interface UploadCredential {
  /** 上传地址（前端直接 POST 到这里） */
  uploadUrl: string;
  method: "PUT" | "POST";
  /** 需要随请求带上的 header / form 字段 */
  headers?: Record<string, string>;
  /** 期望的最终 url（前端用来 callback / 拼装） */
  finalUrl: string;
  key: string;
  expiresAt: number;
}

export interface Storage {
  driver: string;

  /** 服务端中转 PUT：把 buffer/Stream 落到底层存储。 */
  putObject(args: {
    key: string;
    body: Buffer;
    mime: string;
  }): Promise<StorageObject>;

  /** 颁发直传凭证（V0.5 起前端用，MVP 也能返回，但 local 适配器实现简化） */
  sign(args: {
    key: string;
    mime: string;
    expiresSec?: number;
  }): Promise<UploadCredential>;

  /** 删除对象（创作者删除视频时调用） */
  delete(key: string): Promise<void>;

  /** 根据 key 拼出对外访问 url（CDN 域名 / 本地路径） */
  publicUrl(key: string): string;
}

let _storage: Storage | null = null;

export function setStorage(s: Storage) {
  _storage = s;
}

export function getStorage(): Storage {
  if (!_storage) throw new Error("[storage] not initialized.");
  return _storage;
}

export async function initStorage(): Promise<Storage> {
  const { config } = await import("../env.js");
  if (config.storage.driver === "local") {
    const { createLocalStorage } = await import("./local.js");
    const s = createLocalStorage({
      dir: config.storage.localDir,
      publicBase: config.storage.publicBase,
    });
    setStorage(s);
    return s;
  }
  if (config.storage.driver === "tencent-cos") {
    const { createTencentCosStorage } = await import("./tencent-cos.js");
    const s = createTencentCosStorage(config.storage.cos);
    setStorage(s);
    return s;
  }
  throw new Error(`[storage] unknown driver: ${config.storage.driver}`);
}
