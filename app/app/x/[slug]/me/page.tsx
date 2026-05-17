// 学员 H5 · 「我的」抽屉
// 未登录:显示「访客身份」+「微信登录」CTA → /x/:slug/login
// 已登录:显示头像 / 昵称 / 姓名 + 「退出登录」按钮(走 LogoutButton 客户端组件)
//
// 数据走 lib/source.ts

import Link from "next/link";
import { notFound } from "next/navigation";
import { I } from "@/components/icons";
import { Bar, Placeholder } from "@/components/primitives";
import { SourceChip } from "@/components/source-chip";
import { StudentLogoutButton } from "@/components/student-logout-button";
import { getStudentMe } from "@/lib/source";

export default async function StudentMe({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getStudentMe(slug);
  if (!data) notFound();
  const { tenant, member, source } = data;

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
          我的
        </span>
        <div style={{ flex: 1 }} />
        <SourceChip source={source} />
      </div>

      {/* 当前身份 */}
      <div style={{ padding: "0 18px" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--paper-edge)",
            borderRadius: 12,
            padding: "18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {member?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.avatar}
              alt=""
              width={52}
              height={52}
              style={{
                width: 52,
                height: 52,
                borderRadius: 999,
                objectFit: "cover",
                flex: "0 0 auto",
              }}
            />
          ) : (
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 999,
                background: "var(--paper-deep)",
                color: "var(--ink-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--serif)",
                fontSize: 22,
                flex: "0 0 auto",
              }}
            >
              {member ? (member.nickname?.[0] ?? member.name?.[0] ?? "·") : "?"}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {member ? (member.nickname || member.name || "学员") : "访客身份"}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>
              {member
                ? `${tenant.name} · 已开通课程`
                : "未登录 · 仅可查看课程信息"}
            </div>
          </div>
          {member ? <StudentLogoutButton slug={slug} /> : null}
        </div>

        {/* 登录提示 */}
        {!member && (
          <div
            style={{
              marginTop: 14,
              padding: "16px",
              background: "var(--accent-soft)",
              border:
                "1px solid color-mix(in oklch, var(--accent) 18%, transparent)",
              borderRadius: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <I.sparkle
                size={16}
                style={{
                  color: "var(--accent-deep)",
                  marginTop: 1,
                  flex: "0 0 auto",
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--accent-deep)",
                  }}
                >
                  微信登录 · 解锁课程视频
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--accent-deep)",
                    opacity: 0.85,
                    marginTop: 4,
                    lineHeight: 1.6,
                  }}
                >
                  仅老师已添加的学员可以观看视频;请用老师发给你的邀请链接登录。
                </div>
              </div>
            </div>
            <Link
              href={`/x/${slug}/login?next=${encodeURIComponent(`/x/${slug}/me`)}`}
              style={{
                marginTop: 12,
                display: "block",
                width: "100%",
                padding: "10px",
                background: "var(--accent-ink)",
                color: "#fff",
                border: 0,
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 500,
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              微信登录
            </Link>
          </div>
        )}

        {/* 看过的 */}
        <div style={{ marginTop: 24 }}>
          <h3
            className="tz-serif"
            style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 500 }}
          >
            我看过的课程
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link
              href={`/x/${slug}`}
              style={{
                background: "#fff",
                border: "1px solid var(--paper-edge)",
                borderRadius: 10,
                padding: 12,
                display: "flex",
                gap: 12,
                alignItems: "center",
                color: "inherit",
              }}
            >
              <Placeholder w={60} h={60} radius={6} label="" />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    marginBottom: 3,
                  }}
                >
                  七天成长计划 · 习作启蒙
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: "var(--ink-3)",
                    marginBottom: 8,
                  }}
                >
                  {tenant.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <Bar value={28} />
                  </div>
                  <span
                    style={{
                      fontSize: 10.5,
                      color: "var(--ink-2)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    28%
                  </span>
                </div>
              </div>
            </Link>
            <div
              style={{
                padding: "30px 12px",
                textAlign: "center",
                fontSize: 11.5,
                color: "var(--ink-3)",
                border: "1px dashed var(--paper-edge)",
                borderRadius: 10,
              }}
            >
              通过分享链接打开更多课程
              <br />
              <span style={{ fontSize: 10.5, color: "var(--ink-4)" }}>
                · V0 不支持课程目录浏览 ·
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 10.5,
            color: "var(--ink-4)",
            textAlign: "center",
            lineHeight: 1.8,
          }}
        >
          由 同舟 提供轻量化课程交付
          <br />
          隐私 · 服务条款 · 反馈
        </div>
      </div>
    </div>
  );
}
