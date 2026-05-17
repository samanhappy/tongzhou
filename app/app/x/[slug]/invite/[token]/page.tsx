// 学员侧 · 邀请链接落地页
// 创作者把这个 URL 发给学员;学员一打开就 302 到 API 的 /auth/start?invite=...&next=...
// next 回到学员落地页(学员授权后会带着 cookie 落到那里)。

import { redirect } from "next/navigation";

export default async function StudentInvite({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const next = `/x/${encodeURIComponent(slug)}`;
  const url = `/api/x/${encodeURIComponent(
    slug,
  )}/auth/start?invite=${encodeURIComponent(token)}&next=${encodeURIComponent(
    next,
  )}`;
  redirect(url);
}
