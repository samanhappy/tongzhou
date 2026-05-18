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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          marginTop: -10,
          marginBottom: 14,
        }}
      >
        <SourceChip source={source} />
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
