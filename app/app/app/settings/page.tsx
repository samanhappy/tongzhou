// 创作者后台 · 设置 · 品牌
// 来自 design/creator-other.jsx · CreatorSettings
//
// 数据走 lib/source.ts —— 读 Tenant
// V0：纯展示 + defaultValue 由后端值填充；保存动作待 V0.5

import { CreatorShell } from "@/components/shell";
import { SourceChip } from "@/components/source-chip";
import { getSourceLabel, getTenant } from "@/lib/source";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const tenant = await getTenant();
  const source = getSourceLabel();

  return (
    <CreatorShell title="设置 · 品牌" breadcrumb={[tenant.name, "系统"]}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: -10, marginBottom: 14 }}>
        <SourceChip source={source} />
      </div>

      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 22,
          borderBottom: "1px solid var(--paper-line)",
        }}
      >
        {[
          { k: "brand", l: "品牌", active: true },
          { k: "domain", l: "域名" },
          { k: "team", l: "团队成员", soon: true },
          { k: "wechat", l: "微信", soon: true },
          { k: "api", l: "API Key", soon: true },
        ].map((t) => (
          <button
            key={t.k}
            className="tz-btn tz-btn-ghost"
            style={{
              borderRadius: 0,
              padding: "8px 14px",
              color: t.active ? "var(--ink)" : t.soon ? "var(--ink-4)" : "var(--ink-3)",
              borderBottom: t.active ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: -1,
              fontWeight: t.active ? 500 : 400,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {t.l}
            {t.soon && (
              <span style={{ fontSize: 9.5, color: "var(--ink-4)", letterSpacing: "0.06em" }}>V1</span>
            )}
          </button>
        ))}
      </div>

      <SettingsForm
        initial={{
          slug: tenant.slug,
          name: tenant.name,
          tagline: tenant.tagline,
          themeHue: tenant.themeHue,
          groupLink: tenant.groupLink,
        }}
      />
    </CreatorShell>
  );
}
