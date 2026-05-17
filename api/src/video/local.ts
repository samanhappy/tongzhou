// 同舟 · 本地 Video 适配器
//
// 桥接到 Storage(local 或 COS),不做转码,不做 playAuth。
// 学员直接拿 publicUrl 播。MVP / 演示用。
//
// V0.5 切到 tencent-vod 时,业务/前端无感知 — Video 接口形状不变。

import { newId } from "../lib/id.js";
import { getStorage } from "../storage/index.js";
import type { Video, VideoPlayInfo, VideoUploadResult } from "./index.js";

export function createLocalVideo(): Video {
  return {
    driver: "local",

    async upload({ filename, body, mime }): Promise<VideoUploadResult> {
      const storage = getStorage();
      const videoId = newId("vid");
      const key = `videos/local/${videoId}-${safeName(filename)}`;
      const obj = await storage.putObject({ key, body, mime });
      return {
        videoId,
        rawUrl: obj.url,
        sizeBytes: obj.size,
      };
    },

    async getPlayInfo(_videoId, opts): Promise<VideoPlayInfo> {
      // local 模式没有签名概念,直接给 storage 的 publicUrl;
      // 这里只是个占位:实际 videoId → 哪个 storage key 的映射由 lessons/uploads 表持有
      const expiresSec = opts?.expiresSec ?? 6 * 3600;
      return {
        playUrl: "<resolved-by-caller>",
        expiresAt: Date.now() + expiresSec * 1000,
      };
    },

    async delete(videoId) {
      // 同上:实际 key 由 uploads 表 → storage.delete 二段完成,
      // 这里仅作占位以保持接口完整。
      void videoId;
    },
  };
}

function safeName(name: string) {
  return name.replace(/[^\w.\-]/g, "_").slice(-120);
}
