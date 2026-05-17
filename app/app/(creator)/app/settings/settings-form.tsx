"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { I } from "@/components/icons";
import { SectionLabel, XCMark } from "@/components/primitives";
import { useAuthSession } from "@/components/auth-session-context";
import { suggestSlug, updateTenant } from "@/lib/creator-client";

const THEMES = [
  { hex: "#1a4d4a", hue: 162, name: "墨青" },
  { hex: "#7a2e1f", hue: 28, name: "胭脂" },
  { hex: "#1e3a8a", hue: 268, name: "藏蓝" },
  { hex: "#0c0c0c", hue: 60, name: "墨" },
  { hex: "#c2410c", hue: 38, name: "丹" },
] as const;

type TenantForm = {
  slug: string;
  name: string;
  tagline: string;
  themeHue: number;
  groupLink: string;
};

function Field({
  label,
  desc,
  children,
}: {
  label: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
          {label}
        </div>
        {desc && (
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{desc}</div>
        )}
      </div>
      {children}
    </div>
  );
}

export function SettingsForm({ initial }: { initial: TenantForm }) {
  const router = useRouter();
  const { apiBase, session, setSession } = useAuthSession();
  const [form, setForm] = useState<TenantForm>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const theme = useMemo(
    () => THEMES.find((item) => item.hue === form.themeHue) ?? THEMES[0],
    [form.themeHue],
  );

  function reset() {
    setForm(initial);
    setError(null);
    setNotice("已恢复当前已保存内容。");
  }

  async function save() {
    setSaving(true);
    setError(null);
    setNotice(null);

    if (!form.name.trim()) {
      setSaving(false);
      setError("空间名称不能为空。");
      return;
    }

    const payload = {
      slug: suggestSlug(form.slug) || initial.slug,
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      themeHue: form.themeHue,
      groupLink: form.groupLink.trim(),
    };

    try {
      if (!apiBase) {
        setForm((current) => ({ ...current, slug: payload.slug }));
        setNotice(
          "当前是离线演示模式：已在本页预览中更新，但不会持久写入后端。",
        );
        return;
      }

      const { tenant } = await updateTenant(apiBase, payload);
      setForm({
        slug: tenant.slug,
        name: tenant.name,
        tagline: tenant.tagline,
        themeHue: tenant.theme_hue,
        groupLink: tenant.group_link,
      });
      setSession((current) =>
        current
          ? {
              ...current,
              tenant: {
                ...current.tenant,
                slug: tenant.slug,
                name: tenant.name,
                tagline: tenant.tagline,
                theme_hue: tenant.theme_hue,
                group_link: tenant.group_link,
              },
            }
          : current,
      );
      setNotice("品牌设置已保存。");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败，请稍后再试。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <Field
          label="Logo"
          desc="V0 当前以字标展示空间品牌；后续可扩展独立 logo 文件。"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <XCMark size={64} color={theme.hex} />
            <div
              style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.7 }}
            >
              <div>当前用醒春阁字标作为空间头像。</div>
              <div>这块不再放假按钮了，先诚实一点 😌</div>
            </div>
          </div>
        </Field>

        <Field label="空间名称" desc="将显示在学员 H5 页头与浏览器标签">
          <input
            className="tz-input"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
        </Field>

        <Field label="一句话简介" desc="学员落地页副标 · ≤ 40 字">
          <input
            className="tz-input"
            value={form.tagline}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                tagline: event.target.value,
              }))
            }
          />
        </Field>

        <Field label="主题色" desc="将应用于学员 H5 主按钮与重点色">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {THEMES.map((th) => {
              const on = th.hue === form.themeHue;
              return (
                <button
                  key={th.hex}
                  type="button"
                  onClick={() =>
                    setForm((current) => ({ ...current, themeHue: th.hue }))
                  }
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: 6,
                    borderRadius: 6,
                    border: on
                      ? "1px solid var(--ink)"
                      : "1px solid var(--paper-edge)",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      background: th.hex,
                    }}
                  />
                  <span style={{ fontSize: 10.5, color: "var(--ink-2)" }}>
                    {th.name}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="子域名" desc="学员可通过此地址访问">
          <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
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
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                flex: 1,
              }}
            />
            <div
              style={{
                background: "var(--paper-deep)",
                border: "1px solid var(--paper-edge)",
                borderLeft: 0,
                borderRadius: "0 6px 6px 0",
                padding: "0 12px",
                display: "flex",
                alignItems: "center",
                fontSize: 12,
                color: "var(--ink-2)",
                fontFamily: "var(--mono)",
              }}
            >
              .tongzhou.app
            </div>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--accent)", marginTop: 4 }}>
            ✓ 将按保存后的 slug 生效
          </div>
        </Field>

        <Field label="加群链接" desc="学员页底部「加群联系老师」按钮指向">
          <input
            className="tz-input"
            value={form.groupLink}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                groupLink: event.target.value,
              }))
            }
            placeholder="https://..."
          />
        </Field>

        {error && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "color-mix(in oklch, var(--danger) 8%, white)",
              color: "var(--danger)",
              fontSize: 12,
            }}
          >
            {error}
          </div>
        )}
        {notice && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "var(--accent-soft)",
              color: "var(--accent-deep)",
              fontSize: 12,
            }}
          >
            {notice}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className="tz-btn tz-btn-primary"
            onClick={save}
            disabled={saving}
          >
            {saving ? "保存中…" : "保存修改"}
          </button>
          <button
            type="button"
            className="tz-btn"
            onClick={reset}
            disabled={saving}
          >
            取消
          </button>
        </div>
      </div>

      <div style={{ position: "sticky", top: 0 }}>
        <SectionLabel title="预览 · 学员落地页" />
        <div
          style={{
            border: "1px solid var(--paper-edge)",
            borderRadius: 14,
            overflow: "hidden",
            background: "#fff",
            aspectRatio: "9 / 16",
            maxHeight: 480,
            position: "relative",
          }}
        >
          <div style={{ padding: "30px 22px 12px", textAlign: "center" }}>
            <XCMark size={48} color={theme.hex} />
            <div
              className="tz-serif"
              style={{ fontSize: 18, fontWeight: 500, marginTop: 10 }}
            >
              {form.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
              {(form.tagline || "你的空间简介将显示在这里").slice(0, 28)}
            </div>
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <div
              className="tz-serif"
              style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}
            >
              七天成长计划 · 习作启蒙
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: "var(--ink-3)",
                marginBottom: 12,
              }}
            >
              8 节 · 62 分钟
            </div>
            {["开篇·一支笔之外", "第一日·见我", "第二日·见物"].map(
              (title, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 0",
                    borderTop: "1px solid var(--paper-line)",
                  }}
                >
                  <I.playC size={16} style={{ color: theme.hex }} />
                  <span style={{ fontSize: 12 }}>{title}</span>
                </div>
              ),
            )}
            <button
              type="button"
              style={{
                width: "100%",
                marginTop: 14,
                padding: "10px 14px",
                background: theme.hex,
                color: "#fff",
                border: 0,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              加群联系老师
            </button>
          </div>
        </div>
        {session && (
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 10 }}>
            当前会话：{session.user.email}
          </div>
        )}
      </div>
    </div>
  );
}
