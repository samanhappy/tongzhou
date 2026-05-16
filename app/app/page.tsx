// 同舟 · 项目入口（演示导航）
//
// 真实产品里这里会是营销官网；MVP 阶段当作 demo 索引使用，
// 把创作者后台、学员 H5、Onboarding 三个入口集中展示。

import Link from "next/link";
import { I } from "@/components/icons";
import { Heading, TZMark, XCMark } from "@/components/primitives";
import { tenant } from "@/lib/mock";

const PERSONAS = [
  {
    title: "Onboarding · 30 分钟链路",
    desc: "首次注册 → 上传 → 发布 → 拿到分享链接的 5 步向导。V0 DoD 主路径。",
    href: "/onboarding",
    chip: "新创作者",
  },
  {
    title: "创作者后台",
    desc: "数据看板 / 课程 / 学员 / 用量计费 / 设置 — 5 屏完整体验。",
    href: "/app/dashboard",
    chip: "已登录创作者",
  },
  {
    title: `学员 H5 · ${tenant.name}`,
    desc: "分享链接落地页 + 课程目录 + 播放（含手机号水印）。",
    href: `/x/${tenant.slug}`,
    chip: "学员侧",
  },
];

export default function Home() {
  return (
    <main
      className="tz-paper"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 720 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <TZMark size={44} />
          <div>
            <h1
              className="tz-serif"
              style={{ margin: 0, fontSize: 28, fontWeight: 500 }}
            >
              同舟 · V0 MVP
            </h1>
            <div
              style={{
                fontSize: 12,
                color: "var(--ink-3)",
                marginTop: 4,
                letterSpacing: "0.1em",
              }}
            >
              轻量化课程交付 SaaS · Freemium + 按量计费 · 0 件资质
            </div>
          </div>
        </div>

        <p
          style={{
            margin: "0 0 28px",
            fontSize: 13,
            color: "var(--ink-2)",
            lineHeight: 1.7,
            maxWidth: 560,
          }}
        >
          这是同舟 V0 MVP 的可点通版本。后端尚未接入,所有数据来自{" "}
          <code
            className="tz-mono"
            style={{
              background: "var(--paper-deep)",
              padding: "2px 5px",
              borderRadius: 3,
              fontSize: 12,
            }}
          >
            lib/mock.ts
          </code>{" "}
          —{" "}
          页面已按 design 设计稿和 roadmap V0 范围实现,三个入口请按下方选择。
        </p>

        <Heading>入口</Heading>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {PERSONAS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="tz-card"
              style={{
                padding: 20,
                display: "flex",
                alignItems: "center",
                gap: 16,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background:
                    p.href.startsWith("/x/")
                      ? "color-mix(in oklch, var(--seal) 12%, #fff)"
                      : "var(--accent-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "0 0 auto",
                }}
              >
                {p.href.startsWith("/x/") ? (
                  <XCMark size={28} />
                ) : (
                  <TZMark size={28} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    className="tz-serif"
                    style={{ fontSize: 15, fontWeight: 500 }}
                  >
                    {p.title}
                  </span>
                  <span className="tz-chip">{p.chip}</span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ink-3)",
                    lineHeight: 1.6,
                  }}
                >
                  {p.desc}
                </div>
              </div>
              <I.chevR size={16} style={{ color: "var(--ink-4)" }} />
            </Link>
          ))}
        </div>

        <Heading style={{ marginTop: 28 }}>红线 · 取舍</Heading>
        <ul
          style={{
            padding: "0 0 0 18px",
            margin: 0,
            fontSize: 12.5,
            color: "var(--ink-2)",
            lineHeight: 1.9,
          }}
        >
          <li>
            <b>学员看视频不被中断</b> — 即使创作者超额，已发布内容也将持续可播。
          </li>
          <li>
            <b>不收钱</b> — 创作者用自己的渠道（小报童 / 知识星球）收钱，同舟只交付。
          </li>
          <li>
            <b>4 维度按量计费</b> — 学员 / 课程 / 存储 / 播放分钟，Freemium 起步。
          </li>
        </ul>

        <div
          style={{
            marginTop: 26,
            fontSize: 11,
            color: "var(--ink-4)",
            textAlign: "center",
          }}
        >
          MVP · 数据全部 Mock · 见{" "}
          <code className="tz-mono">roadmap/</code> 与{" "}
          <code className="tz-mono">design/</code>
        </div>
      </div>
    </main>
  );
}
