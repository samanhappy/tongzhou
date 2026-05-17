// 创作者后台 · 学员名单（V0：单加 + CSV 导入；V0.5 起加 Webhook）
// 来自 design/creator-other.jsx · CreatorMembers
//
// 数据走 lib/source.ts

import { CreatorShell } from "@/components/shell";
import { SourceChip } from "@/components/source-chip";
import { getMembersData } from "@/lib/source";
import { MembersClient } from "./members-client";

export default async function MembersPage() {
  const { members, activeCount, quotaMax, source } = await getMembersData();

  return (
    <CreatorShell title="学员" breadcrumb={["醒春阁", "运营"]}>
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

      <MembersClient
        initialMembers={[...members]}
        activeCount={activeCount}
        quotaMax={quotaMax}
      />
    </CreatorShell>
  );
}
