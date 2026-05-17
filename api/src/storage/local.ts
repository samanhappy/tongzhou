// 同舟 · 本地磁盘 Storage（MVP）
//
// 文件直接落在 STORAGE_LOCAL_DIR；server.ts 会把这个目录挂成 /files 静态路由。
// 仅适合单机；正式环境用 ./tencent-cos.ts。

import fs from "node:fs/promises";
import path from "node:path";
import type { Storage, StorageObject, UploadCredential } from "./index.js";

export function createLocalStorage(opts: {
  dir: string;
  publicBase: string;
}): Storage {
  const root = path.resolve(opts.dir);

  async function ensureDirFor(key: string) {
    const abs = path.join(root, key);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    return abs;
  }

  return {
    driver: "local",

    async putObject({ key, body, mime }): Promise<StorageObject> {
      const abs = await ensureDirFor(key);
      await fs.writeFile(abs, body);
      return {
        key,
        url: `${opts.publicBase}/${key}`,
        size: body.length,
        mime,
      };
    },

    async sign({ key, mime, expiresSec = 600 }): Promise<UploadCredential> {
      // 本地适配器不做真正签名；让前端 POST 给 /api/uploads/local-put 即可
      return {
        method: "PUT",
        uploadUrl: `${opts.publicBase.replace(/\/files$/, "")}/api/uploads/local-put?key=${encodeURIComponent(
          key,
        )}`,
        headers: { "content-type": mime },
        finalUrl: `${opts.publicBase}/${key}`,
        key,
        expiresAt: Date.now() + expiresSec * 1000,
      };
    },

    async delete(key) {
      const abs = path.join(root, key);
      await fs.rm(abs, { force: true });
    },

    publicUrl(key) {
      return `${opts.publicBase}/${key}`;
    },

    async signedReadUrl(key) {
      return `${opts.publicBase}/${key}`;
    },
  };
}
