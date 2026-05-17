// 同舟 · Video 适配器门面
//
// 为什么和 Storage 分开？
//   - Storage 关注的是字节(海报、Logo、文件下载)
//   - Video 关注的是「可播放对象」:转码、自适应、playAuth 签名、点播 SDK
//   - 腾讯云 VOD 有专门的媒资 ID(fileId),不是 COS 的 object key
//   - 学员 H5 拿到的是 playAuth-protected URL,不是裸 OSS URL
//
// 两个实现：
//   local      — 沿用 Storage(COS / 本地盘),getPlayInfo 直接给 publicUrl,无 playAuth
//   tencent-vod — 真实点播：上传 → 媒资 ID → 拉媒资信息 → 生成 playAuth-signed URL
//
// V0 默认走 local 模式(零成本)；V0.5 起切 tencent-vod 上线 6h playAuth 红线。

export type VideoUploadResult = {
  /** 媒资 ID(VOD)或上传 ID(local) */
  videoId: string;
  /** 原始 URL — 无鉴权,仅用于内部 */
  rawUrl: string;
  /** 大小、时长(从转码回调里拿) */
  sizeBytes: number;
  durationSec?: number;
};

export type VideoPlayInfo = {
  /** 学员端播放 URL（local 是 publicUrl；VOD 是带 t=&sign= 的 key 防盗签名 URL） */
  playUrl: string;
  /** URL 有效期 */
  expiresAt: number;
  /** 自适应清晰度（VOD 才有） */
  variants?: Array<{ label: string; url: string; bitrate?: number }>;
};

export interface Video {
  driver: string;

  /** 服务端中转上传(MVP / 小文件) */
  upload(args: {
    filename: string;
    body: Buffer;
    mime: string;
  }): Promise<VideoUploadResult>;

  /** 颁发直传凭证(V0.5 起前端用) */
  sign?(args: {
    filename: string;
    mime: string;
    expiresSec?: number;
  }): Promise<{
    uploadUrl: string;
    method: string;
    key: string;
    expiresAt: number;
  }>;

  /** 取播放信息(带 playAuth 时效签名) */
  getPlayInfo(
    videoId: string,
    opts?: { expiresSec?: number },
  ): Promise<VideoPlayInfo>;

  /** 删除媒资 */
  delete(videoId: string): Promise<void>;
}

let _video: Video | null = null;

export function setVideo(v: Video) {
  _video = v;
}

export function getVideo(): Video {
  if (!_video) throw new Error("[video] not initialized.");
  return _video;
}

export async function initVideo(): Promise<Video> {
  const { config } = await import("../env.js");
  if (config.video.driver === "local") {
    const { createLocalVideo } = await import("./local.js");
    const v = createLocalVideo();
    setVideo(v);
    return v;
  }
  if (config.video.driver === "tencent-vod") {
    const { createTencentVodVideo } = await import("./tencent-vod.js");
    const v = createTencentVodVideo(config.video.vod);
    setVideo(v);
    return v;
  }
  throw new Error(`[video] unknown driver: ${config.video.driver}`);
}
