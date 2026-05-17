// Onboarding 客户端逻辑：5 步状态机
//
// 设计稿用并排展示 5 屏；这里转为真实的单屏向导，仍保留所有视觉。

"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { I } from "@/components/icons";
import { Bar, TZMark, XCMark } from "@/components/primitives";
import { registerAuth } from "@/lib/auth-client";
import {
  createLesson,
  createTrack,
  fileNameToTitle,
  suggestSlug,
  updateTenant,
  updateTrack,
  uploadFile,
} from "@/lib/creator-client";
import { tenant } from "@/lib/mock";

const STEPS = [
  { title: "开通空间", time: "2 min" },
  { title: "设置品牌", time: "3 min" },
  { title: "上传第一个视频", time: "15 min" },
  { title: "组织成课程并发布", time: "6 min" },
  { title: "拿到分享链接 · 完成", time: "4 min" },
] as const;

type Step1Form = {
  email: string;
  password: string;
  name: string;
  slug: string;
};

type Step2Form = {
  slug: string;
  themeHue: number;
};

type UploadedVideo = {
  id: string;
  name: string;
  sizeText: string;
  phase: "uploading" | "transcoding" | "ready" | "failed";
};

type Step4Form = {
  title: string;
  oneLine: string;
  slug: string;
};

const STEP2_THEMES = [
  ["#1a4d4a", 162],
  ["#7a2e1f", 28],
  ["#1e3a8a", 268],
  ["#0c0c0c", 60],
  ["#c2410c", 38],
] as const;

export function OnboardingClient({ apiBase }: { apiBase: string | null }) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Step1Form>({
    email: "hello@xingchunge.com",
    password: "",
    name: tenant.name,
    slug: tenant.slug,
  });
  const [tenantDraft, setTenantDraft] = useState({
    name: tenant.name,
    slug: tenant.slug,
  });
  const [brandForm, setBrandForm] = useState<Step2Form>({
    slug: tenant.slug,
    themeHue: tenant.themeHue,
  });
  const [uploads, setUploads] = useState<UploadedVideo[]>([]);
  const [trackForm, setTrackForm] = useState<Step4Form>({
    title: "七天成长计划",
    oneLine: "七个清晨，从见我到见今。",
    slug: "qitian-chengzhang",
  });
  const [createdTrack, setCreatedTrack] = useState<{
    id: string;
    slug: string;
  } | null>(null);

  async function handleNext() {
    setError(null);
    if (step === 1) {
      setTenantDraft({
        name: form.name || tenant.name,
        slug: form.slug || tenant.slug,
      });

      if (!apiBase) {
        setBrandForm((current) => ({
          ...current,
          slug: form.slug || tenant.slug,
        }));
        setStep(2);
        return;
      }

      setBusy(true);
      try {
        const session = await registerAuth(apiBase, form);
        setTenantDraft({
          name: session.tenant.name,
          slug: session.tenant.slug,
        });
        setBrandForm({
          slug: session.tenant.slug,
          themeHue: tenant.themeHue,
        });
        setStep(2);
      } catch (err) {
        setError(err instanceof Error ? err.message : "注册失败，请稍后再试");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (step === 2) {
      setBusy(true);
      try {
        const nextSlug = suggestSlug(brandForm.slug) || tenantDraft.slug;
        if (apiBase) {
          await updateTenant(apiBase, {
            slug: nextSlug,
            themeHue: brandForm.themeHue,
          });
        }
        setTenantDraft((current) => ({ ...current, slug: nextSlug }));
        setStep(3);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "保存品牌失败，请稍后再试",
        );
      } finally {
        setBusy(false);
      }
      return;
    }

    if (step === 3) {
      setStep(4);
      return;
    }

    if (step === 4) {
      setBusy(true);
      try {
        const nextSlug =
          suggestSlug(trackForm.slug || trackForm.title) || "first-course";
        if (!apiBase) {
          setCreatedTrack({ id: "mock-first-track", slug: nextSlug });
          setStep(5);
          return;
        }

        const currentTrack = createdTrack
          ? {
              track: {
                id: createdTrack.id,
                slug: createdTrack.slug,
              },
            }
          : await createTrack(apiBase, {
              slug: nextSlug,
              title: trackForm.title.trim(),
              oneLine: trackForm.oneLine.trim(),
              subtitle: "习作启蒙",
            });

        if (!createdTrack) {
          for (const upload of uploads.filter(
            (item) => item.phase === "ready",
          )) {
            await createLesson(apiBase, currentTrack.track.id, {
              title: fileNameToTitle(upload.name),
              summary: `上传自 ${upload.name}`,
              videoId: upload.id,
              status: "draft",
            });
          }
        }

        await updateTrack(apiBase, currentTrack.track.id, {
          slug: nextSlug,
          title: trackForm.title.trim(),
          oneLine: trackForm.oneLine.trim(),
          status: "published",
        });
        setCreatedTrack({ id: currentTrack.track.id, slug: nextSlug });
        setStep(5);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "创建课程失败，请稍后再试",
        );
      } finally {
        setBusy(false);
      }
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const pendingId = `pending-${file.name}-${Date.now()}`;
        setUploads((current) => [
          {
            id: pendingId,
            name: file.name,
            sizeText: `${Math.round(file.size / 1024 / 1024) || 1} MB`,
            phase: "uploading",
          },
          ...current,
        ]);

        if (!apiBase) {
          setUploads((current) =>
            current.map((item) =>
              item.id === pendingId ? { ...item, phase: "ready" } : item,
            ),
          );
          continue;
        }

        const { upload } = await uploadFile(apiBase, file);
        setUploads((current) => [
          {
            id: upload.id,
            name: upload.filename,
            sizeText: `${Math.round(upload.size_bytes / 1024 / 1024) || 1} MB`,
            phase: upload.phase,
          },
          ...current.filter((item) => item.id !== pendingId),
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败，请稍后再试");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="tz-paper"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 460 }}>
        {/* 顶部说明 */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <h1
            className="tz-serif"
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 500,
            }}
          >
            创作者 30 分钟链路
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 12,
              color: "var(--ink-3)",
            }}
          >
            注册 → 品牌 → 上传 → 发布 → 拿到分享链接 · 全过程 ≤ 30
            分钟（含转码）
          </p>
        </div>

        <StepCard
          step={step}
          total={STEPS.length}
          title={STEPS[step - 1].title}
          time={STEPS[step - 1].time}
        >
          {step === 1 && (
            <Step1
              apiBase={apiBase}
              busy={busy}
              error={error}
              form={form}
              setForm={setForm}
            />
          )}
          {step === 2 && (
            <Step2
              tenantName={tenantDraft.name}
              form={brandForm}
              setForm={setBrandForm}
            />
          )}
          {step === 3 && (
            <Step3
              apiBase={apiBase}
              uploads={uploads}
              onFilesSelected={handleFiles}
              busy={busy}
            />
          )}
          {step === 4 && (
            <Step4
              form={trackForm}
              setForm={setTrackForm}
              uploads={uploads}
              busy={busy}
            />
          )}
          {step === 5 && <Step5 tenantSlug={tenantDraft.slug} />}

          {step < 5 ? (
            <button
              className="tz-btn tz-btn-primary"
              onClick={handleNext}
              disabled={busy}
              style={{
                width: "100%",
                marginTop: 16,
                justifyContent: "center",
                opacity: busy ? 0.8 : 1,
              }}
            >
              {step === 1 && (busy ? "正在创建空间…" : "创建我的空间")}
              {step === 2 && "下一步 · 上传视频"}
              {step === 3 && "下一步 · 组织成课程"}
              {step === 4 && (
                <>
                  <I.check size={13} /> 发布课程
                </>
              )}
            </button>
          ) : (
            <Link
              href="/app/dashboard"
              className="tz-btn tz-btn-primary"
              style={{
                width: "100%",
                marginTop: 16,
                justifyContent: "center",
                display: "inline-flex",
              }}
            >
              进入后台
            </Link>
          )}

          {step > 1 && (
            <button
              className="tz-btn tz-btn-ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              style={{
                width: "100%",
                marginTop: 8,
                justifyContent: "center",
                color: "var(--ink-3)",
              }}
            >
              ← 返回上一步
            </button>
          )}
        </StepCard>

        <div style={{ textAlign: "center", marginTop: 14 }}>
          <Link
            href="/"
            style={{
              fontSize: 11,
              color: "var(--ink-3)",
              textDecoration: "underline",
            }}
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  step,
  total,
  title,
  time,
  children,
}: {
  step: number;
  total: number;
  title: string;
  time: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--paper)",
        border: "1px solid var(--paper-edge)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "var(--shadow-1)",
      }}
    >
      {/* 顶部进度 */}
      <div
        style={{
          padding: "14px 18px 12px",
          borderBottom: "1px solid var(--paper-line)",
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TZMark size={20} />
            <span
              className="tz-serif"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              同舟
            </span>
          </div>
          <span
            style={{
              fontSize: 10.5,
              color: "var(--ink-3)",
              fontFamily: "var(--mono)",
            }}
          >
            {step} / {total} · {time}
          </span>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 2,
                borderRadius: 999,
                background: i < step ? "var(--accent)" : "var(--paper-line)",
              }}
            />
          ))}
        </div>
        <h3
          className="tz-serif"
          style={{ margin: "12px 0 0", fontSize: 18, fontWeight: 500 }}
        >
          {title}
        </h3>
      </div>

      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 10.5,
          color: "var(--ink-3)",
          marginBottom: 6,
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Step1({
  apiBase,
  busy,
  error,
  form,
  setForm,
}: {
  apiBase: string | null;
  busy: boolean;
  error: string | null;
  form: Step1Form;
  setForm: React.Dispatch<React.SetStateAction<Step1Form>>;
}) {
  return (
    <>
      <p
        style={{
          margin: "0 0 16px",
          fontSize: 12,
          color: "var(--ink-2)",
          lineHeight: 1.6,
        }}
      >
        邮箱注册即开通你的独立空间，<b>不需要</b>微信公众号、不需要支付商户号。
      </p>

      {!apiBase && (
        <div
          style={{
            padding: "10px 12px",
            background: "var(--paper-deep)",
            borderRadius: 6,
            fontSize: 11,
            color: "var(--ink-3)",
            lineHeight: 1.6,
            marginBottom: 12,
          }}
        >
          当前未配置 <span className="tz-mono">API_BASE</span>
          ，点击后会继续离线演示，不会真的创建账号。
        </div>
      )}

      <FieldRow label="邮箱">
        <input
          className="tz-input"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
          style={{ fontSize: 12 }}
        />
      </FieldRow>
      <FieldRow label="密码">
        <input
          className="tz-input"
          type="password"
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
          style={{ fontSize: 12 }}
        />
      </FieldRow>
      <FieldRow label="创作者名 · 空间名">
        <input
          className="tz-input"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          style={{ fontSize: 12 }}
        />
      </FieldRow>
      <FieldRow label="空间 slug">
        <div style={{ display: "flex" }}>
          <input
            className="tz-input"
            value={form.slug}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                slug: event.target.value.toLowerCase(),
              }))
            }
            style={{ fontSize: 12 }}
          />
          <div
            style={{
              background: "var(--paper-deep)",
              border: "1px solid var(--paper-edge)",
              borderLeft: 0,
              borderRadius: "0 6px 6px 0",
              padding: "0 10px",
              display: "flex",
              alignItems: "center",
              fontSize: 11,
              color: "var(--ink-2)",
              fontFamily: "var(--mono)",
            }}
          >
            .tongzhou.app
          </div>
        </div>
      </FieldRow>
      {error && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 6,
            background: "color-mix(in oklch, var(--seal) 10%, var(--paper))",
            color: "var(--seal)",
            fontSize: 11,
            lineHeight: 1.6,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}
      <div
        style={{
          padding: "10px 12px",
          background: "var(--paper-deep)",
          borderRadius: 6,
          fontSize: 11,
          color: "var(--ink-3)",
          lineHeight: 1.6,
        }}
      >
        <b style={{ color: "var(--ink-2)" }}>0 件资质：</b>
        同舟不收钱，你的学员通过自己的渠道（小报童 / 知识星球 / 微信红包）付费；
        同舟只负责交付。
      </div>
      {busy && (
        <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 10 }}>
          正在创建 tenant、owner 账号并下发 cookie，请稍候…
        </div>
      )}
    </>
  );
}

function Step2({
  tenantName,
  form,
  setForm,
}: {
  tenantName: string;
  form: Step2Form;
  setForm: React.Dispatch<React.SetStateAction<Step2Form>>;
}) {
  return (
    <>
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 12,
          color: "var(--ink-2)",
        }}
      >
        学员会看见你的 Logo、主题色、子域名 — 不见同舟字样。
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <XCMark size={48} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 500 }}>已上传 logo.png</div>
          <button
            className="tz-btn tz-btn-ghost"
            style={{ padding: "4px 6px", fontSize: 10.5 }}
          >
            替换
          </button>
        </div>
      </div>
      <FieldRow label="主题色">
        <div style={{ display: "flex", gap: 6 }}>
          {STEP2_THEMES.map(([color, hue]) => (
            <button
              key={color}
              type="button"
              onClick={() =>
                setForm((current) => ({ ...current, themeHue: hue }))
              }
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: color,
                border:
                  form.themeHue === hue
                    ? "2px solid var(--ink)"
                    : "2px solid transparent",
                boxShadow:
                  form.themeHue === hue ? "inset 0 0 0 2px #fff" : "none",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </FieldRow>
      <FieldRow label="子域名">
        <div style={{ display: "flex" }}>
          <input
            className="tz-input"
            value={form.slug}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                slug: suggestSlug(event.target.value),
              }))
            }
            style={{
              fontSize: 12,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
          />
          <div
            style={{
              background: "var(--paper-deep)",
              border: "1px solid var(--paper-edge)",
              borderLeft: 0,
              borderRadius: "0 6px 6px 0",
              padding: "0 10px",
              display: "flex",
              alignItems: "center",
              fontSize: 11,
              color: "var(--ink-2)",
              fontFamily: "var(--mono)",
            }}
          >
            .tongzhou.app
          </div>
        </div>
        <div style={{ fontSize: 10, color: "var(--accent)", marginTop: 4 }}>
          ✓ 可用
        </div>
      </FieldRow>

      <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 10 }}>
        当前空间：{tenantName}
      </div>
    </>
  );
}

function Step3({
  apiBase,
  uploads,
  onFilesSelected,
  busy,
}: {
  apiBase: string | null;
  uploads: UploadedVideo[];
  onFilesSelected: (files: FileList | null) => Promise<void>;
  busy: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 12,
          color: "var(--ink-2)",
        }}
      >
        OSS 直传 · 单文件 ≤ 2 GB · 边播边转
      </p>

      {uploads.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--paper-edge)",
            borderRadius: 8,
            padding: "14px 16px",
            marginBottom: 10,
            fontSize: 11.5,
            color: "var(--ink-3)",
          }}
        >
          还没有选中视频。先丢一个进来，后面的课程发布就会直接复用它们。
        </div>
      ) : (
        uploads.map((upload) => (
          <div
            key={upload.id}
            style={{
              background: "#fff",
              border: "1px solid var(--paper-edge)",
              borderRadius: 8,
              padding: "12px 14px",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <I.video
                size={14}
                style={{
                  color:
                    upload.phase === "ready" ? "var(--accent)" : "var(--ink-3)",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {upload.name}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "var(--ink-3)",
                  fontFamily: "var(--mono)",
                }}
              >
                {upload.sizeText}
              </span>
            </div>
            <Bar
              value={
                upload.phase === "ready"
                  ? 100
                  : upload.phase === "uploading"
                    ? 64
                    : upload.phase === "transcoding"
                      ? 88
                      : 100
              }
            />
            <div
              style={{
                marginTop: 6,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color:
                  upload.phase === "ready" ? "var(--accent)" : "var(--ink-2)",
              }}
            >
              <span>
                {upload.phase === "ready"
                  ? "✓ 已上传"
                  : upload.phase === "uploading"
                    ? "上传中"
                    : upload.phase === "transcoding"
                      ? "转码中"
                      : "上传失败"}
              </span>
              <span style={{ fontFamily: "var(--mono)" }}>
                {apiBase ? "后端已记录" : "离线演示"}
              </span>
            </div>
          </div>
        ))
      )}

      <div
        style={{
          padding: "20px 12px",
          textAlign: "center",
          border: "1.5px dashed var(--paper-edge)",
          borderRadius: 8,
          background: "var(--paper-deep)",
          fontSize: 11,
          color: "var(--ink-2)",
        }}
      >
        <I.upload size={18} style={{ color: "var(--accent)" }} />
        <div style={{ marginTop: 6 }}>把视频文件拖到这里</div>
        <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4 }}>
          或{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              color: "var(--accent)",
              background: "transparent",
              border: 0,
              padding: 0,
              cursor: "pointer",
            }}
          >
            从本地选择
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          hidden
          onChange={(event) => void onFilesSelected(event.target.files)}
        />
      </div>
      {busy && (
        <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 10 }}>
          正在上传并登记视频，请稍候…
        </div>
      )}
    </>
  );
}

function Step4({
  form,
  setForm,
  uploads,
  busy,
}: {
  form: Step4Form;
  setForm: React.Dispatch<React.SetStateAction<Step4Form>>;
  uploads: UploadedVideo[];
  busy: boolean;
}) {
  return (
    <>
      <FieldRow label="课程名称">
        <input
          className="tz-input"
          value={form.title}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              title: event.target.value,
              slug: current.slug || suggestSlug(event.target.value),
            }))
          }
          style={{ fontSize: 12 }}
        />
      </FieldRow>
      <FieldRow label="一句话简介">
        <input
          className="tz-input"
          value={form.oneLine}
          onChange={(event) =>
            setForm((current) => ({ ...current, oneLine: event.target.value }))
          }
          style={{ fontSize: 12 }}
        />
      </FieldRow>
      <FieldRow label="课程 slug">
        <input
          className="tz-input"
          value={form.slug}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              slug: suggestSlug(event.target.value),
            }))
          }
          style={{ fontSize: 12 }}
        />
      </FieldRow>

      <div
        style={{
          marginTop: 14,
          marginBottom: 8,
          fontSize: 11,
          fontWeight: 500,
        }}
      >
        课时（{uploads.length}）
      </div>
      {(uploads.length
        ? uploads
        : [
            {
              id: "placeholder",
              name: "还没有上传视频",
              sizeText: "—",
              phase: "failed" as const,
            },
          ]
      ).map((upload, i) => (
        <div
          key={upload.id}
          style={{
            background: "#fff",
            border: "1px solid var(--paper-edge)",
            borderRadius: 6,
            padding: "8px 10px",
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11.5,
          }}
        >
          <I.grip size={12} style={{ color: "var(--ink-4)" }} />
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              color: "var(--ink-3)",
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span style={{ flex: 1 }}>{fileNameToTitle(upload.name)}</span>
          <span
            style={{
              fontSize: 10,
              color:
                upload.phase === "ready" ? "var(--accent)" : "var(--ink-3)",
              fontFamily: "var(--mono)",
            }}
          >
            {upload.phase === "ready"
              ? "已就绪"
              : upload.phase === "uploading"
                ? "上传中…"
                : upload.phase === "transcoding"
                  ? "转码中…"
                  : "待上传"}
          </span>
        </div>
      ))}

      <button
        className="tz-btn tz-btn-ghost"
        style={{
          width: "100%",
          marginTop: 4,
          padding: "8px",
          fontSize: 11.5,
          color: "var(--accent-deep)",
          border: "1px dashed var(--paper-edge)",
          justifyContent: "center",
        }}
      >
        <I.plus size={11} /> 新增课时
      </button>

      <div
        style={{
          marginTop: 14,
          padding: "10px 12px",
          background: "var(--accent-soft)",
          borderRadius: 6,
          fontSize: 11,
          color: "var(--accent-deep)",
          display: "flex",
          gap: 6,
        }}
      >
        <I.info size={12} style={{ marginTop: 1, flex: "0 0 auto" }} />
        <span>
          {busy
            ? "正在创建课程并发布，请稍候…"
            : "点击下方按钮后，将创建课程、挂上已上传视频，并立即发布。"}
        </span>
      </div>
    </>
  );
}

function Step5({ tenantSlug }: { tenantSlug: string }) {
  const shareUrl = `${tenantSlug}.tongzhou.app`;
  return (
    <>
      <div
        style={{
          padding: "18px 14px",
          background:
            "linear-gradient(180deg, var(--accent-soft), var(--paper))",
          border:
            "1px solid color-mix(in oklch, var(--accent) 18%, transparent)",
          borderRadius: 10,
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            margin: "0 auto 10px",
            background: "var(--accent)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <I.check size={20} />
        </div>
        <div className="tz-serif" style={{ fontSize: 16, fontWeight: 500 }}>
          已发布
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
          用时 28 min · 在 30 分钟红线内 ✓
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid var(--paper-edge)",
          borderRadius: 8,
          padding: 14,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            flex: "0 0 auto",
            background: `
              repeating-linear-gradient(0deg, var(--ink) 0 2px, transparent 2px 4px),
              repeating-linear-gradient(90deg, var(--ink) 0 2px, #fff 2px 4px)
            `,
            borderRadius: 4,
            border: "3px solid #fff",
            outline: "1px solid var(--paper-edge)",
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 3 }}>
            分享链接
          </div>
          <div
            className="tz-mono"
            style={{
              fontSize: 11,
              color: "var(--accent-deep)",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginBottom: 6,
            }}
          >
            {shareUrl}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <Link
              href={`/x/${tenantSlug}`}
              className="tz-btn"
              style={{ padding: "4px 8px", fontSize: 10.5 }}
            >
              <I.share size={10} /> 打开
            </Link>
            <button
              className="tz-btn"
              style={{ padding: "4px 8px", fontSize: 10.5 }}
            >
              <I.copy size={10} /> 复制
            </button>
            <button
              className="tz-btn"
              style={{ padding: "4px 8px", fontSize: 10.5 }}
            >
              <I.qr size={10} /> 海报
            </button>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11.5, fontWeight: 500, marginBottom: 8 }}>
        下一步建议
      </div>
      {[
        {
          i: <I.csv size={12} />,
          t: "导入第一批学员名单（CSV）",
          to: "/app/members",
        },
        {
          i: <I.share size={12} />,
          t: "把链接发到你已有的微信群",
          to: `/x/${tenantSlug}`,
        },
        {
          i: <I.usage size={12} />,
          t: "在用量面板了解 Freemium 配额",
          to: "/app/usage",
        },
      ].map((s, i) => (
        <Link
          key={i}
          href={s.to}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 0",
            borderTop: "1px solid var(--paper-line)",
            fontSize: 11.5,
            color: "var(--ink-2)",
            textDecoration: "none",
          }}
        >
          <span style={{ color: "var(--accent)" }}>{s.i}</span>
          <span style={{ flex: 1 }}>{s.t}</span>
          <I.chevR size={12} style={{ color: "var(--ink-4)" }} />
        </Link>
      ))}
    </>
  );
}
