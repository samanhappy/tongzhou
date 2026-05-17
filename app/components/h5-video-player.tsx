"use client";

// 学员 H5 · 真·视频播放器
// - 包一层 <video> 元素 + 自绘控件（与设计稿风格一致）
// - 复用 WatermarkLayer 做手机号水印
// - 上传完成后 lesson 拿到 uploads.url 直接喂 <video src>；
//   V0.5 切到 tencent-vod 后只需把 src 换成 playAuth 签名 URL,组件不动。

import { useCallback, useRef, useState } from "react";
import { I } from "./icons";
import { Placeholder, WatermarkLayer } from "./primitives";

type LockState = "login_required" | "not_ready" | "no_video" | null;

type Props = {
  src: string | null;
  mime?: string;
  watermarkText: string;
  posterLabel?: string;
  fallbackDurationText?: string;
  /** 锁定态(优先于 src):login_required / not_ready / no_video */
  lockState?: LockState;
  /** login_required 时点击「微信登录」按钮跳转的 URL */
  loginHref?: string;
};

const SPEEDS = [1, 1.25, 1.5, 2];

export function H5VideoPlayer({
  src,
  mime,
  watermarkText,
  posterLabel = "封面",
  fallbackDurationText,
  lockState = null,
  loginHref,
}: Props) {
  // 锁定态下完全不渲染 <video>;走 Placeholder + 文案/CTA。
  const locked = lockState !== null;
  const effectiveSrc = locked ? null : src;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch((err) => setLoadError(String(err?.message ?? err)));
    } else {
      el.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  }, []);

  const cycleSpeed = useCallback(() => {
    const next = (speedIdx + 1) % SPEEDS.length;
    const el = videoRef.current;
    if (el) el.playbackRate = SPEEDS[next]!;
    setSpeedIdx(next);
  }, [speedIdx]);

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = videoRef.current;
    if (!el || !duration) return;
    const next = (Number(e.target.value) / 100) * duration;
    el.currentTime = next;
    setCurrent(next);
  };

  const fullscreen = () => {
    const el = videoRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  };

  const progressPct = duration > 0 ? (current / duration) * 100 : 0;
  const durationLabel = duration > 0 ? fmt(duration) : (fallbackDurationText ?? "--:--");

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "16 / 10",
        overflow: "hidden",
        background: "#000",
      }}
    >
      {effectiveSrc ? (
        <video
          ref={videoRef}
          src={effectiveSrc}
          {...(mime ? { "data-mime": mime } : {})}
          playsInline
          preload="metadata"
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration || 0);
            setReady(true);
          }}
          onError={() => setLoadError("视频加载失败，请刷新重试")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            background: "#000",
          }}
        />
      ) : (
        <Placeholder w="100%" h="100%" radius={0} dark label={posterLabel} />
      )}

      {/* 水印 ——— 仅在能播放时显示 */}
      {!locked && <WatermarkLayer text={watermarkText} />}

      {/* 中央播放按钮 — 暂停时显示;锁定态不显示 */}
      {!locked && !playing && !loadError && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="播放"
          disabled={!effectiveSrc}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: 0,
            cursor: effectiveSrc ? "pointer" : "not-allowed",
            padding: 0,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff",
            }}
          >
            <I.play size={22} style={{ marginLeft: 3 }} />
          </div>
        </button>
      )}

      {/* 错误提示 */}
      {!locked && loadError && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 12,
            background: "rgba(0,0,0,0.55)",
            padding: 24,
            textAlign: "center",
          }}
        >
          {loadError}
        </div>
      )}

      {/* 锁定态遮罩 */}
      {locked && (
        <LockOverlay state={lockState!} loginHref={loginHref} />
      )}

      {/* 控件条(锁定态隐藏,纯遮罩) */}
      {!locked && <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "20px 14px 12px",
          background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.7))",
          color: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
            fontSize: 10.5,
            fontFamily: "var(--mono)",
          }}
        >
          <span>{fmt(current)}</span>
          <div style={{ flex: 1, position: "relative", height: 12 }}>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                transform: "translateY(-50%)",
                height: 3,
                background: "rgba(255,255,255,0.2)",
                borderRadius: 999,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: `${progressPct}%`,
                  height: "100%",
                  background: "#fff",
                  borderRadius: 999,
                }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progressPct}
              onChange={onSeek}
              disabled={!ready}
              aria-label="进度"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                opacity: 0,
                cursor: ready ? "pointer" : "default",
              }}
            />
          </div>
          <span style={{ opacity: 0.6 }}>{durationLabel}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "暂停" : "播放"}
            disabled={!effectiveSrc}
            style={iconBtnStyle}
          >
            {playing ? <I.pause size={18} /> : <I.play size={18} />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "取消静音" : "静音"}
            style={{ ...iconBtnStyle, opacity: muted ? 0.5 : 0.8 }}
          >
            <I.vol size={16} />
          </button>
          <button
            type="button"
            onClick={cycleSpeed}
            aria-label="倍速"
            style={{
              background: "transparent",
              color: "#fff",
              fontSize: 11,
              opacity: 0.8,
              padding: "2px 8px",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 4,
              fontFamily: "var(--mono)",
              cursor: "pointer",
            }}
          >
            {SPEEDS[speedIdx]}×
          </button>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={fullscreen}
            aria-label="全屏"
            style={{ ...iconBtnStyle, opacity: 0.8 }}
          >
            <I.fullscr size={16} />
          </button>
        </div>
      </div>}

      {/* 防盗链角标(锁定态不显示) */}
      {!locked && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 12,
            background: "rgba(0,0,0,0.6)",
            color: "rgba(255,255,255,0.8)",
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 10,
            fontFamily: "var(--mono)",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <I.clock size={11} /> 6h playAuth
        </div>
      )}
    </div>
  );
}

function LockOverlay({
  state,
  loginHref,
}: {
  state: "login_required" | "not_ready" | "no_video";
  loginHref?: string;
}) {
  if (state === "login_required") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          background: "rgba(0,0,0,0.6)",
          padding: 24,
          textAlign: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
          aria-hidden
        >
          🔒
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
          登录后可观看
          <br />
          <span style={{ opacity: 0.7, fontSize: 11.5 }}>
            仅老师已开通的学员可看
          </span>
        </div>
        {loginHref ? (
          <a
            href={loginHref}
            style={{
              padding: "9px 20px",
              background: "#1AAD19",
              color: "#fff",
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            微信一键登录
          </a>
        ) : null}
      </div>
    );
  }
  const label =
    state === "not_ready"
      ? "视频正在转码,请稍后再来"
      : "本课时暂无视频";
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.82)",
        background: "rgba(0,0,0,0.45)",
        fontSize: 12,
        textAlign: "center",
        padding: 24,
      }}
    >
      {label}
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: 0,
  color: "#fff",
  padding: 0,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

function fmt(sec: number) {
  if (!isFinite(sec) || sec < 0) return "00:00";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  if (m < 60) return `${String(m).padStart(2, "0")}:${ss}`;
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  return `${String(h).padStart(2, "0")}:${mm}:${ss}`;
}
