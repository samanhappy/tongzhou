// 创作者 Onboarding · 30 分钟链路
// 来自 design/creator-onboarding.jsx
// V0 DoD：注册 → 品牌 → 上传 → 发布 → 拿到分享链接

import { getApiRuntimeConfig } from "@/lib/api";
import { OnboardingClient } from "./client";

export default function OnboardingPage() {
  const { base } = getApiRuntimeConfig();
  return <OnboardingClient apiBase={base} />;
}
