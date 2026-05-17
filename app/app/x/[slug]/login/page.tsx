// 学员侧 · 登录页
// 唯一登录方式:微信公众号网页授权(dev 模式下走本地 stub 表单)。
// next 由 query 透传,登录成功后由 API callback 302 回去。
// need_invite=1 时显示「请向老师索取邀请链接」纯说明,因为没有 invite 走 oauth
// 也只能拿到 openid → 在 members 表查不到 → 没法签发 cookie。

import Link from "next/link";
import { I } from "@/components/icons";
import { SourceChip } from "@/components/source-chip";
import { getStudentMe } from "@/lib/source";
import { redirect } from "next/navigation";

export default async function StudentLogin({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ next?: string; need_invite?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const data = await getStudentMe(slug);

  // 已登录就直接回 next 或落地页
  if (data?.member) {
    redirect(safeNext(sp.next, `/x/${slug}`));
  }

  const next = safeNext(sp.next, `/x/${slug}`);
  const needInvite = sp.need_invite === "1";

  // 走相对路径 → next.config.ts 的 rewrites 把 /api 反代到后端,
  // 同源下 Set-Cookie 才能落到浏览器 cookie jar 上。
  const startHref = `/api/x/${encodeURIComponent(
    slug,
  )}/auth/start?next=${encodeURIComponent(next)}`;

  return (
    <div className="tz-paper" style={{ minHeight: "100%", paddingBottom: 100 }}>
      <div
        style={{
          padding: "20px 18px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Link
          href={`/x/${slug}`}
          style={{
            background: "transparent",
            border: 0,
            color: "var(--ink-2)",
            display: "inline-flex",
          }}
        >
          <I.back size={16} />
        </Link>
        <span className="tz-serif" style={{ fontSize: 15, fontWeight: 500 }}>
          学员登录
        </span>
        <div style={{ flex: 1 }} />
        {data ? <SourceChip source={data.source} /> : null}
      </div>

      <div style={{ padding: "0 18px" }}>
        {needInvite ? (
          <div
            style={{
              padding: 18,
              background: "var(--paper-deep)",
              border: "1px solid var(--paper-edge)",
              borderRadius: 12,
            }}
          >
            <h2
              className="tz-serif"
              style={{
                fontSize: 16,
                fontWeight: 500,
                margin: "0 0 8px",
              }}
            >
              还没有邀请链接
            </h2>
            <p
              style={{
                fontSize: 12.5,
                color: "var(--ink-2)",
                lineHeight: 1.7,
                margin: "0 0 12px",
              }}
            >
              视频课程只开放给老师已添加的学员。
              请向 <b>{data?.tenant.name ?? "你的老师"}</b>{" "}
              索取你的专属邀请链接;在微信中打开即可绑定身份。
            </p>
            <p
              style={{
                fontSize: 11,
                color: "var(--ink-3)",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              已经绑定过的同学,可直接点下方按钮静默重新登录。
            </p>
          </div>
        ) : (
          <div
            style={{
              padding: 18,
              background: "#fff",
              border: "1px solid var(--paper-edge)",
              borderRadius: 12,
            }}
          >
            <h2
              className="tz-serif"
              style={{
                fontSize: 16,
                fontWeight: 500,
                margin: "0 0 6px",
              }}
            >
              微信登录
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "var(--ink-3)",
                lineHeight: 1.6,
                margin: "0 0 14px",
              }}
            >
              点击下方按钮,在微信中完成授权,即可解锁老师为你开通的课程。
            </p>
          </div>
        )}

        <a
          href={startHref}
          style={{
            display: "block",
            marginTop: 18,
            padding: "12px 16px",
            background: "#1AAD19",
            color: "#fff",
            borderRadius: 8,
            textAlign: "center",
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          微信一键登录
        </a>

        <div
          style={{
            marginTop: 24,
            fontSize: 10.5,
            color: "var(--ink-4)",
            textAlign: "center",
            lineHeight: 1.8,
          }}
        >
          登录即代表同意服务条款与隐私政策
        </div>
      </div>
    </div>
  );
}

function safeNext(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  return raw;
}
