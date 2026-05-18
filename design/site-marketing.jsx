// 同舟 主站点 · tongzhou.app —— marketing landing page
// 面向独立创作者（知识 IP / 教练 / 咨询师）的公开首页。
// 延续：暖白纸 · 浓淡墨 · 墨青 · 极小面积印泥红 · 衬线题 + 无衬线正文

// ─────────────────────────────────────────────────────────────
// 共用工具
// ─────────────────────────────────────────────────────────────
function SiteContainer({ children, style }) {
  return (
    <div style={{
      maxWidth: 1180, margin: "0 auto", padding: "0 56px",
      ...style,
    }}>{children}</div>
  );
}

function SectionLead({ num, title, sub, right }) {
  return (
    <div style={{
      display: "flex", alignItems: "baseline", justifyContent: "space-between",
      paddingBottom: 28, marginBottom: 36,
      borderBottom: "1px solid var(--paper-line)",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
        <span className="tz-mono" style={{
          fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.16em",
        }}>{num}</span>
        <div>
          <h2 className="tz-serif" style={{
            margin: 0, fontSize: 30, fontWeight: 500, letterSpacing: "-0.01em",
          }}>{title}</h2>
          {sub && (
            <div style={{ marginTop: 8, fontSize: 13.5, color: "var(--ink-3)", maxWidth: 540 }}>{sub}</div>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1 · 顶部导航
// ─────────────────────────────────────────────────────────────
function SiteNav() {
  return (
    <div style={{
      height: 64, borderBottom: "1px solid var(--paper-line)",
      background: "rgba(250,249,247,0.78)", backdropFilter: "blur(10px)",
      position: "sticky", top: 0, zIndex: 20,
    }}>
      <SiteContainer style={{ display: "flex", alignItems: "center", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <TZMark size={24} />
          <span className="tz-serif" style={{ fontSize: 17, fontWeight: 500, letterSpacing: "0.06em" }}>同舟</span>
          <span className="tz-mono" style={{
            fontSize: 9.5, color: "var(--ink-4)", letterSpacing: "0.22em",
            padding: "2px 6px", border: "1px solid var(--paper-edge)", borderRadius: 3,
            marginLeft: 4,
          }}>BETA · v0.3</span>
        </div>
        <nav style={{
          display: "flex", gap: 26, marginLeft: 48,
          fontSize: 13, color: "var(--ink-2)",
        }}>
          {["产品", "案例", "定价", "文档", "更新日志"].map((s) => (
            <a key={s} style={{ cursor: "pointer" }}>{s}</a>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a style={{ fontSize: 13, color: "var(--ink-2)", cursor: "pointer" }}>登录</a>
          <button className="tz-btn tz-btn-primary" style={{ padding: "8px 14px" }}>
            开通空间 <I.chevR size={12} style={{ opacity: 0.6 }}/>
          </button>
        </div>
      </SiteContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2 · Hero — 印章感 + 大字 + 副标 + 双 CTA
// ─────────────────────────────────────────────────────────────
function SiteHero() {
  return (
    <section style={{ padding: "84px 0 78px", position: "relative", overflow: "hidden" }}>
      {/* 远景印章装饰 */}
      <div aria-hidden style={{
        position: "absolute", right: -120, top: 40, opacity: 0.04,
        fontFamily: "var(--serif)", fontSize: 460, fontWeight: 500,
        color: "var(--ink)", letterSpacing: 0, lineHeight: 0.9,
        pointerEvents: "none", userSelect: "none",
      }}>舟</div>

      <SiteContainer>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 64, alignItems: "start" }}>
          {/* 左侧竖排印章感小字 */}
          <div className="tz-vt" style={{
            fontSize: 16, color: "var(--ink-3)", letterSpacing: "0.5em",
            padding: "6px 0", borderLeft: "1px solid var(--paper-line)", paddingLeft: 14,
            height: 360,
          }}>
            轻 舟 ‧ 同 行
          </div>

          <div>
            {/* 印 + 标识 */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <span className="tz-stamp">舟</span>
              <span className="tz-mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.14em" }}>
                LIGHTWEIGHT COURSE DELIVERY · 轻量化课程交付
              </span>
            </div>

            <h1 className="tz-serif" style={{
              margin: 0, fontSize: 76, fontWeight: 500, lineHeight: 1.05,
              letterSpacing: "-0.02em", color: "var(--ink)",
            }}>
              上传视频。<br/>
              <span style={{ color: "var(--accent-deep)" }}>学员看视频。</span>
            </h1>

            <p style={{
              margin: "26px 0 0", fontSize: 16.5, color: "var(--ink-2)",
              maxWidth: 580, lineHeight: 1.7,
            }}>
              同舟是为独立创作者做的极简课程交付 SaaS。<b style={{ color: "var(--ink)", fontWeight: 500 }}>没有装修、商城、分销、繁复玩法</b>——
              30 分钟开通独立空间，0 资质审批，学员通过你已有的渠道付费，同舟只负责把视频可靠地交到学员眼前。
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 36, alignItems: "center" }}>
              <button className="tz-btn tz-btn-primary" style={{ padding: "13px 22px", fontSize: 14 }}>
                免费开通空间 <I.chevR size={13} style={{ opacity: 0.6 }}/>
              </button>
              <button className="tz-btn" style={{ padding: "13px 18px", fontSize: 14 }}>
                <I.playC size={14} style={{ color: "var(--accent)" }}/> 看 90 秒 demo
              </button>
              <span style={{ fontSize: 11.5, color: "var(--ink-3)", marginLeft: 8 }}>
                无需信用卡 · 无需公众号
              </span>
            </div>

            {/* 数据条 */}
            <div style={{
              marginTop: 56, display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              borderTop: "1px solid var(--paper-line)", borderBottom: "1px solid var(--paper-line)",
              padding: "20px 0",
            }}>
              {[
                { v: "≤ 30", u: "min", l: "从注册到拿到分享链接" },
                { v: "0",    u: "件",  l: "资质 / 备案 / 协议" },
                { v: "4",    u: "维",  l: "Freemium 自动计量" },
                { v: "100%", u: "",    l: "学员观看不被中断" },
              ].map((s, i) => (
                <div key={i} style={{
                  paddingLeft: i ? 24 : 0,
                  borderLeft: i ? "1px solid var(--paper-line)" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span className="tz-serif" style={{
                      fontSize: 32, fontWeight: 500, lineHeight: 1,
                      fontVariantNumeric: "tabular-nums",
                    }}>{s.v}</span>
                    <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{s.u}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 6 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 3 · 三条红线（差异化）
// ─────────────────────────────────────────────────────────────
function SiteRedlines() {
  const cards = [
    {
      k: "守",
      t: "学员看视频，不被中断",
      d: "即使创作者超额，已发布内容也将持续可播。同舟与小鹅通在这条上保持差异化——你的学员永远不会因为你的方案被弹窗打断。",
      hl: "已发布的视频 = 不可中断的承诺",
    },
    {
      k: "净",
      t: "不收钱，不绑公众号",
      d: "你的学员通过自己的渠道付费 — 小报童 / 知识星球 / 微信红包 / 直接转账，怎么都行。同舟不做支付通道，不要求公众号绑定，不抽佣金。",
      hl: "0 抽成 · 0 资质 · 0 商户号",
    },
    {
      k: "快",
      t: "30 分钟，到第一个分享链接",
      d: "从邮箱注册 → 品牌设置 → 上传视频 → 发布课程 → 拿到分享链接，全程目标 ≤ 30 分钟（含转码）。你今天就可以开始。",
      hl: "5 步 · 边播边转 · 即刻可分享",
    },
  ];
  return (
    <section style={{ padding: "72px 0", background: "var(--paper-deep)" }}>
      <SiteContainer>
        <SectionLead
          num="01 · 红 线"
          title="三件我们坚决不让步的事"
          sub="同舟是工具，不是平台 — 你的学员、你的内容、你的现金流，都在你手里。"
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {cards.map((c) => (
            <div key={c.k} className="tz-card" style={{
              padding: "28px 26px 26px", background: "#fff",
              display: "flex", flexDirection: "column", gap: 14,
              position: "relative",
            }}>
              <span className="tz-stamp" style={{ width: 28, height: 28, fontSize: 15 }}>{c.k}</span>
              <h3 className="tz-serif" style={{
                margin: 0, fontSize: 20, fontWeight: 500, lineHeight: 1.3,
              }}>{c.t}</h3>
              <p style={{
                margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.75,
              }}>{c.d}</p>
              <div style={{
                marginTop: "auto", paddingTop: 14,
                borderTop: "1px dashed var(--paper-edge)",
                fontSize: 11.5, color: "var(--accent-deep)",
                fontFamily: "var(--mono)", letterSpacing: "0.02em",
              }}>→ {c.hl}</div>
            </div>
          ))}
        </div>
      </SiteContainer>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 4 · 30 分钟链路 — 横向时间轴
// ─────────────────────────────────────────────────────────────
function SiteOnboarding() {
  const steps = [
    { n: 1, t: "开通空间",   dur: "2 min",  d: "邮箱注册即开空间，无需任何资质。",   visual: "form" },
    { n: 2, t: "设置品牌",   dur: "3 min",  d: "Logo · 主题色 · 子域名，学员看见的是你。", visual: "brand" },
    { n: 3, t: "上传视频",   dur: "15 min", d: "OSS 直传，单文件 ≤ 2 GB，边播边转。",   visual: "upload" },
    { n: 4, t: "发布课程",   dur: "6 min",  d: "课时拖拽排序，未转码完的可先发布。",     visual: "publish" },
    { n: 5, t: "拿到链接",   dur: "4 min",  d: "复制短链或下载海报，发到你已有的群里。", visual: "link" },
  ];
  return (
    <section style={{ padding: "96px 0" }}>
      <SiteContainer>
        <SectionLead
          num="02 · 链 路"
          title="今天，你就能把第一节课交付出去"
          sub="不是 PR 话术。这是 V0 的 DoD（交付定义）—— 累计 28 分钟跑完，含转码。"
          right={
            <a style={{
              fontSize: 12.5, color: "var(--accent-deep)",
              display: "inline-flex", alignItems: "center", gap: 4,
              cursor: "pointer", borderBottom: "1px solid currentColor", paddingBottom: 2,
            }}>看完整 5 屏串联 <I.chevR size={11}/></a>
          }
        />

        {/* 时间刻度 */}
        <div style={{ position: "relative", marginTop: 12 }}>
          <div style={{
            position: "absolute", left: 28, right: 28, top: 38, height: 1,
            background: "var(--paper-line)",
          }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18 }}>
            {steps.map((s, i) => (
              <div key={s.n} style={{ position: "relative", paddingTop: 0 }}>
                {/* 节点 */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, position: "relative", zIndex: 2 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 999,
                    background: i === 0 ? "var(--accent)" : "#fff",
                    border: i === 0 ? "1px solid var(--accent)" : "1px solid var(--paper-edge)",
                    color: i === 0 ? "#fff" : "var(--ink-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--serif)", fontSize: 14, fontWeight: 500,
                    flex: "0 0 auto",
                  }}>{s.n}</div>
                  <span className="tz-mono" style={{
                    fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em",
                  }}>{s.dur}</span>
                </div>

                <div style={{ paddingLeft: 4 }}>
                  <h4 className="tz-serif" style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 500 }}>{s.t}</h4>
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.65 }}>{s.d}</p>
                </div>

                {/* 小预览 */}
                <div style={{ marginTop: 16 }}>
                  <StepThumb kind={s.visual} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}

function StepThumb({ kind }) {
  const base = {
    background: "#fff", border: "1px solid var(--paper-edge)", borderRadius: 8,
    padding: 12, height: 130, overflow: "hidden",
    boxShadow: "var(--shadow-1)",
  };
  if (kind === "form") return (
    <div style={base}>
      <div style={{ fontSize: 9, color: "var(--ink-4)", letterSpacing: "0.1em", marginBottom: 4 }}>邮箱</div>
      <div style={{ height: 22, background: "var(--paper-deep)", borderRadius: 4, marginBottom: 8, padding: "4px 8px", fontSize: 10, color: "var(--ink-2)", display: "flex", alignItems: "center" }}>hello@xingchunge.com</div>
      <div style={{ fontSize: 9, color: "var(--ink-4)", letterSpacing: "0.1em", marginBottom: 4 }}>空间名</div>
      <div style={{ height: 22, background: "var(--paper-deep)", borderRadius: 4, marginBottom: 10, padding: "4px 8px", fontSize: 10, color: "var(--ink-2)", display: "flex", alignItems: "center" }}>醒春阁</div>
      <div style={{ height: 26, background: "var(--ink)", borderRadius: 4, color: "var(--paper)", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>创建我的空间</div>
    </div>
  );
  if (kind === "brand") return (
    <div style={base}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <XCMark size={28}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 500 }}>醒春阁</div>
          <div className="tz-mono" style={{ fontSize: 8.5, color: "var(--ink-3)" }}>xingchunge.tongzhou.app</div>
        </div>
      </div>
      <div style={{ fontSize: 9, color: "var(--ink-4)", letterSpacing: "0.1em", marginBottom: 6 }}>主题色</div>
      <div style={{ display: "flex", gap: 6 }}>
        {["#1a4d4a", "#7a2e1f", "#1e3a8a", "#0c0c0c", "#c2410c"].map((c, i) => (
          <div key={c} style={{
            width: 22, height: 22, borderRadius: 999, background: c,
            border: i === 0 ? "2px solid var(--ink)" : "2px solid transparent",
            boxShadow: i === 0 ? "inset 0 0 0 2px #fff" : "none",
          }}/>
        ))}
      </div>
    </div>
  );
  if (kind === "upload") return (
    <div style={base}>
      <div style={{
        background: "var(--paper-deep)", borderRadius: 5, padding: "8px 10px", marginBottom: 8,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <I.video size={11} style={{ color: "var(--accent)" }}/>
        <span style={{ fontSize: 10, flex: 1 }}>第一日·见我.mp4</span>
        <span className="tz-mono" style={{ fontSize: 9, color: "var(--accent)" }}>✓</span>
      </div>
      <div style={{
        background: "var(--paper-deep)", borderRadius: 5, padding: "8px 10px", marginBottom: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <I.video size={11} style={{ color: "var(--ink-3)" }}/>
          <span style={{ fontSize: 10, flex: 1 }}>第二日·见物.mp4</span>
          <span className="tz-mono" style={{ fontSize: 9, color: "var(--ink-3)" }}>64%</span>
        </div>
        <Bar value={64} height={3}/>
      </div>
      <div style={{
        border: "1.2px dashed var(--paper-edge)", borderRadius: 5, padding: "10px",
        fontSize: 9.5, color: "var(--ink-3)", textAlign: "center",
      }}>
        <I.upload size={11} style={{ color: "var(--accent)" }}/> 把视频拖到这里
      </div>
    </div>
  );
  if (kind === "publish") return (
    <div style={base}>
      <div style={{ fontSize: 10, fontWeight: 500, marginBottom: 8 }}>七天成长计划 · 习作启蒙</div>
      {[
        ["开篇·一支笔之外", "08:24", true],
        ["第一日·见我",     "09:12", true],
        ["第二日·见物",     "上传中", false],
      ].map(([t, d, ok], i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "5px 0",
          borderTop: i ? "1px solid var(--paper-line)" : "none", fontSize: 9.5,
        }}>
          <I.grip size={9} style={{ color: "var(--ink-4)" }}/>
          <span className="tz-mono" style={{ fontSize: 8, color: "var(--ink-3)" }}>{String(i+1).padStart(2,"0")}</span>
          <span style={{ flex: 1 }}>{t}</span>
          <span className="tz-mono" style={{ fontSize: 8.5, color: ok ? "var(--accent)" : "var(--ink-3)" }}>{d}</span>
        </div>
      ))}
    </div>
  );
  if (kind === "link") return (
    <div style={base}>
      <div style={{
        background: "#fff", border: "1px solid var(--paper-edge)", borderRadius: 6,
        padding: 10, display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
      }}>
        <div style={{
          width: 38, height: 38, flex: "0 0 auto",
          background: `repeating-linear-gradient(0deg, var(--ink) 0 2px, transparent 2px 4px),
                       repeating-linear-gradient(90deg, var(--ink) 0 2px, #fff 2px 4px)`,
          borderRadius: 3,
        }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 8.5, color: "var(--ink-3)" }}>分享链接</div>
          <div className="tz-mono" style={{
            fontSize: 9, color: "var(--accent-deep)", fontWeight: 500,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>xingchunge.tongzhou.app/c/qrqt</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <button className="tz-btn" style={{ padding: "4px 8px", fontSize: 9, flex: 1, justifyContent: "center" }}>
          <I.copy size={8}/> 复制
        </button>
        <button className="tz-btn" style={{ padding: "4px 8px", fontSize: 9, flex: 1, justifyContent: "center" }}>
          <I.qr size={8}/> 海报
        </button>
      </div>
    </div>
  );
  return <div style={base}/>;
}

// ─────────────────────────────────────────────────────────────
// 5 · 四维计量 + 红线承诺
// ─────────────────────────────────────────────────────────────
function SiteMetering() {
  const rows = [
    { k: "members.active_count", n: "月活学员", desc: "学员在本月内有任意访问即视为活跃", smp: "实时" },
    { k: "courses.count",        n: "发布课程", desc: "status = published 的课程取本月最大值", smp: "实时" },
    { k: "storage.bytes",        n: "视频存储", desc: "OSS 用量每日 03:00 快照，月内取平均", smp: "每日" },
    { k: "playback.minutes",     n: "播放分钟", desc: "播放器 30 秒心跳累加，当月加总", smp: "30 秒" },
  ];
  return (
    <section style={{ padding: "96px 0", background: "var(--paper-deep)" }}>
      <SiteContainer>
        <SectionLead
          num="03 · 计 量"
          title="把 SaaS 计价做到诚实"
          sub="不是「企业版起步 ¥4980 / 年」，也不是「按学员数阶梯涨价」。同舟按四件你能看见的事计量——透明、可重算、对账日清晰。"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 36 }}>
          {/* 表格 */}
          <div className="tz-card" style={{ background: "#fff", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{
                  background: "var(--paper-deep)",
                  fontSize: 10.5, letterSpacing: "0.08em", color: "var(--ink-3)",
                }}>
                  <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 400 }}>计量项</th>
                  <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 400 }}>采样</th>
                  <th style={{ padding: "12px 18px", textAlign: "left", fontWeight: 400 }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.k} style={{ borderTop: "1px solid var(--paper-line)" }}>
                    <td style={{ padding: "16px 18px", width: "32%" }}>
                      <div className="tz-serif" style={{ fontSize: 15, fontWeight: 500 }}>{r.n}</div>
                      <div className="tz-mono" style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 3 }}>{r.k}</div>
                    </td>
                    <td style={{ padding: "16px 18px", width: "20%", color: "var(--ink-2)", fontSize: 12 }}>
                      <span className="tz-chip">{r.smp}</span>
                    </td>
                    <td style={{ padding: "16px 18px", color: "var(--ink-2)", fontSize: 12.5, lineHeight: 1.6 }}>
                      {r.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 红线承诺卡 */}
          <div style={{
            background: "var(--ink)", color: "var(--paper)",
            borderRadius: 12, padding: "30px 28px",
            display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden",
          }}>
            <div aria-hidden style={{
              position: "absolute", right: -40, bottom: -60,
              fontFamily: "var(--serif)", fontSize: 240, opacity: 0.06,
              lineHeight: 1, color: "var(--paper)",
            }}>守</div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="tz-stamp" style={{ background: "var(--seal)" }}>守</span>
              <span className="tz-mono" style={{
                fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em",
              }}>RED LINE · 不可逾越</span>
            </div>
            <h3 className="tz-serif" style={{
              margin: 0, fontSize: 26, fontWeight: 500, lineHeight: 1.3,
            }}>
              超额仅冻结<u style={{ textDecorationStyle: "dotted", textUnderlineOffset: 6 }}>上传</u>，<br/>
              学员观看<span style={{ color: "var(--accent-soft)" }}>永远</span>不被打断。
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
              {[
                ["80 – 100%",  "横幅 + 邮件提示",      "学员正常"],
                ["100 – 120%", "上传 / 加学员置灰",     "学员正常"],
                [">120% · 7d", "后台只读",             "学员正常 ✓"],
              ].map((r, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "84px 1fr 88px",
                  alignItems: "center", gap: 10,
                  paddingTop: 10, borderTop: i ? "1px solid rgba(255,255,255,0.08)" : "none",
                  fontSize: 12,
                }}>
                  <span className="tz-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{r[0]}</span>
                  <span style={{ color: "rgba(255,255,255,0.78)" }}>{r[1]}</span>
                  <span style={{ color: "var(--accent-soft)", fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{r[2]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 6 · 定价
// ─────────────────────────────────────────────────────────────
function SitePricing() {
  const tiers = [
    {
      k: "FREE",
      name: "Freemium",
      price: "¥0",
      unit: "/ 月",
      tag: "适合刚起步",
      quota: [["月活学员", "200 人"], ["发布课程", "10 门"], ["视频存储", "5 GB"], ["播放分钟", "1,500 min"]],
      features: ["独立子域名", "邮箱注册 · 0 资质", "学员可选绑定手机号", "基础观看数据"],
      cta: "免费开通",
      ctaStyle: "primary",
    },
    {
      k: "PRO",
      name: "Pro",
      price: "¥99",
      unit: "/ 月",
      tag: "推荐 · 一位老师 + 几百学员",
      quota: [["月活学员", "2,000 人"], ["发布课程", "无限"], ["视频存储", "100 GB"], ["播放分钟", "30,000 min"]],
      features: ["全部 Free 功能", "自定义域名（CNAME）", "去除「同舟」标识", "导出 CSV / 学员心跳事件", "优先支持"],
      cta: "选择 Pro",
      ctaStyle: "accent",
      featured: true,
    },
    {
      k: "TEAM",
      name: "Team",
      price: "按量",
      unit: "起 · 详谈",
      tag: "适合工作室 / 多老师",
      quota: [["月活学员", "无限"], ["发布课程", "无限"], ["视频存储", "≥ 1 TB"], ["播放分钟", "阶梯单价"]],
      features: ["全部 Pro 功能", "多管理员协作（V1）", "API + Webhook", "私有部署可洽", "签订 SLA"],
      cta: "联系我们",
      ctaStyle: "outline",
    },
  ];
  return (
    <section style={{ padding: "96px 0" }}>
      <SiteContainer>
        <SectionLead
          num="04 · 定 价"
          title="按你能看见的事计费"
          sub="所有方案中，已发布的内容永远可播 — 超额降级仅影响创作者一侧。"
          right={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>月付</span>
              <div style={{
                width: 36, height: 20, borderRadius: 999, padding: 2, background: "var(--accent)",
                display: "flex", justifyContent: "flex-end",
              }}>
                <div style={{ width: 16, height: 16, borderRadius: 999, background: "#fff" }}/>
              </div>
              <span style={{ fontSize: 12, color: "var(--ink)" }}>年付 <span style={{ color: "var(--accent-deep)" }}>省 2 个月</span></span>
            </div>
          }
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {tiers.map((t) => (
            <div key={t.k} style={{
              background: t.featured ? "var(--ink)" : "#fff",
              color: t.featured ? "var(--paper)" : "var(--ink)",
              border: t.featured ? "1px solid var(--ink)" : "1px solid var(--paper-edge)",
              borderRadius: 12, padding: "30px 26px 26px",
              position: "relative", display: "flex", flexDirection: "column",
              minHeight: 540,
            }}>
              {t.featured && (
                <span style={{
                  position: "absolute", top: -10, left: 26,
                  background: "var(--seal)", color: "#fff",
                  fontSize: 10.5, padding: "3px 8px", borderRadius: 3,
                  fontFamily: "var(--serif)", letterSpacing: "0.1em",
                }}>本期推荐</span>
              )}

              <div className="tz-mono" style={{
                fontSize: 11, letterSpacing: "0.2em",
                color: t.featured ? "rgba(255,255,255,0.55)" : "var(--ink-4)",
              }}>{t.k}</div>
              <h3 className="tz-serif" style={{
                margin: "8px 0 14px", fontSize: 26, fontWeight: 500,
              }}>{t.name}</h3>

              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                <span className="tz-serif" style={{ fontSize: 44, fontWeight: 500, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  {t.price}
                </span>
                <span style={{ fontSize: 13, color: t.featured ? "rgba(255,255,255,0.6)" : "var(--ink-3)" }}>{t.unit}</span>
              </div>
              <div style={{
                fontSize: 11.5, color: t.featured ? "rgba(255,255,255,0.65)" : "var(--ink-3)",
                marginBottom: 22,
              }}>{t.tag}</div>

              {/* 配额 */}
              <div style={{
                padding: "14px 0", borderTop: t.featured ? "1px solid rgba(255,255,255,0.1)" : "1px solid var(--paper-line)",
                borderBottom: t.featured ? "1px solid rgba(255,255,255,0.1)" : "1px solid var(--paper-line)",
                marginBottom: 18,
              }}>
                {t.quota.map(([l, v], i) => (
                  <div key={l} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "baseline",
                    padding: "5px 0", fontSize: 12,
                  }}>
                    <span style={{ color: t.featured ? "rgba(255,255,255,0.65)" : "var(--ink-3)" }}>{l}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* features */}
              <ul style={{
                margin: 0, padding: 0, listStyle: "none", flex: 1,
                display: "flex", flexDirection: "column", gap: 9,
              }}>
                {t.features.map((f) => (
                  <li key={f} style={{
                    display: "flex", alignItems: "flex-start", gap: 9,
                    fontSize: 12.5, color: t.featured ? "rgba(255,255,255,0.85)" : "var(--ink-2)",
                  }}>
                    <I.check size={12} style={{
                      color: t.featured ? "var(--accent-soft)" : "var(--accent)",
                      marginTop: 2, flex: "0 0 auto",
                    }}/>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button style={{
                marginTop: 22, padding: "11px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                cursor: "pointer", border: 0,
                background: t.ctaStyle === "primary" ? "var(--ink)" :
                            t.ctaStyle === "accent"  ? "var(--accent)" : "transparent",
                color: t.ctaStyle === "outline" ? "var(--paper)" : "#fff",
                border: t.ctaStyle === "outline" ? "1px solid rgba(255,255,255,0.25)" : 0,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                fontFamily: "var(--sans)",
              }}>
                {t.cta} <I.chevR size={12} style={{ opacity: 0.7 }}/>
              </button>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 22, fontSize: 11.5, color: "var(--ink-3)", textAlign: "center",
          padding: "14px 0", borderTop: "1px solid var(--paper-line)",
        }}>
          所有方案 · 学员观看不被中断 · 已上传视频永远可播 · 计量事件流可重算 · 月底对账
        </div>
      </SiteContainer>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 7 · 案例 · 醒春阁
// ─────────────────────────────────────────────────────────────
function SiteCase() {
  return (
    <section style={{ padding: "96px 0", background: "var(--paper-deep)" }}>
      <SiteContainer>
        <SectionLead
          num="05 · 在 用"
          title="他们已经在同舟上交付课程"
          sub="V0 阶段我们与一小批 design partner 共建产品。下面是其中一位的真实样貌。"
          right={
            <a style={{ fontSize: 12.5, color: "var(--accent-deep)", cursor: "pointer", borderBottom: "1px solid currentColor", paddingBottom: 2 }}>
              查看更多案例 <I.chevR size={11}/>
            </a>
          }
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 56, alignItems: "start" }}>
          <div>
            {/* 创作者卡片头 */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
              <XCMark size={48} />
              <div>
                <div className="tz-serif" style={{ fontSize: 22, fontWeight: 500 }}>醒春阁</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3, fontFamily: "var(--mono)", letterSpacing: "0.04em" }}>
                  xingchunge.tongzhou.app · 写作陪跑 · 知识 IP
                </div>
              </div>
              <div style={{ flex: 1 }}/>
              <span className="tz-chip is-seal">design partner · #3</span>
            </div>

            {/* 引文 */}
            <blockquote style={{
              margin: 0, padding: "0 0 0 24px",
              borderLeft: "2px solid var(--accent)",
              fontFamily: "var(--serif)", fontSize: 19, lineHeight: 1.65,
              color: "var(--ink)", fontWeight: 500, letterSpacing: "-0.005em",
            }}>
              「我有 142 位读者，不是 14,200 位。<br/>
              我需要的不是企业级 CMS，是<u style={{ textDecorationStyle: "dotted", textUnderlineOffset: 5 }}>能把视频可靠地交到他们手上</u>的一艘小船。」
            </blockquote>
            <div style={{
              marginTop: 14, paddingLeft: 24, fontSize: 12, color: "var(--ink-3)",
            }}>—— 春主理人 · 醒春阁</div>

            {/* 数据条 */}
            <div style={{
              marginTop: 36, display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              background: "#fff", border: "1px solid var(--paper-edge)", borderRadius: 10,
              padding: "20px 24px",
            }}>
              {[
                ["142", "本月活跃学员"],
                ["6 门", "已发布课程"],
                ["1,284 min", "本月累计播放"],
                ["86%", "完播率"],
              ].map(([v, l], i) => (
                <div key={i} style={{
                  paddingLeft: i ? 20 : 0,
                  borderLeft: i ? "1px solid var(--paper-line)" : "none",
                }}>
                  <div className="tz-serif" style={{
                    fontSize: 24, fontWeight: 500, lineHeight: 1, fontVariantNumeric: "tabular-nums",
                  }}>{v}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* 上手时间线 */}
            <div style={{ marginTop: 36 }}>
              <h4 className="tz-mono" style={{
                margin: "0 0 18px", fontSize: 11, letterSpacing: "0.14em", color: "var(--ink-3)",
                fontWeight: 400, fontFamily: "var(--mono)",
              }}>上手过程</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  ["D + 0",  "邮箱注册 → 上传 4 个视频 → 发布第一门课。", "28 min"],
                  ["D + 2",  "用 CSV 导入了 47 位老学员（从知识星球）。",   "—"],
                  ["D + 14", "Pro 升级 — 月活突破 200，自动提示。",        "—"],
                  ["D + 30", "本月累计 1,284 min · 完播率 86%。",          "—"],
                ].map(([d, t, dur], i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "70px 1fr 80px", gap: 14,
                    alignItems: "center", paddingBottom: 12,
                    borderBottom: i < 3 ? "1px dashed var(--paper-edge)" : "none",
                  }}>
                    <span className="tz-mono" style={{ fontSize: 11.5, color: "var(--accent-deep)" }}>{d}</span>
                    <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{t}</span>
                    <span className="tz-mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textAlign: "right" }}>{dur}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 手机预览 */}
          <div style={{
            position: "sticky", top: 80,
          }}>
            <CaseMiniPhone />
            <div style={{
              fontSize: 11, color: "var(--ink-3)", textAlign: "center", marginTop: 14,
              fontFamily: "var(--mono)", letterSpacing: "0.05em",
            }}>xingchunge.tongzhou.app</div>
          </div>
        </div>
      </SiteContainer>
    </section>
  );
}

function CaseMiniPhone() {
  return (
    <div style={{
      width: 280, height: 580, margin: "0 auto",
      borderRadius: 32, padding: 8, background: "#000",
      boxShadow: "0 30px 60px -20px rgba(40,30,20,0.25), 0 0 0 1px rgba(40,30,20,0.15)",
    }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: 26, overflow: "hidden",
        background: "var(--paper)", position: "relative",
        display: "flex", flexDirection: "column",
      }}>
        {/* 顶部 */}
        <div style={{
          padding: "26px 18px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        }}>
          <XCMark size={36}/>
          <div className="tz-serif" style={{ fontSize: 16, fontWeight: 500, letterSpacing: "0.04em" }}>醒春阁</div>
          <div style={{ fontSize: 9, color: "var(--ink-3)", letterSpacing: "0.12em" }}>XING · CHUN · GE</div>
        </div>

        {/* 课程卡 */}
        <div style={{
          margin: "0 12px 10px", padding: "14px 14px",
          background: "linear-gradient(180deg, var(--accent-ink), oklch(0.32 0.05 162))",
          color: "#fff", borderRadius: 10, position: "relative", overflow: "hidden",
        }}>
          <div className="tz-vt" style={{
            position: "absolute", right: 8, top: 8, bottom: 8,
            fontSize: 8.5, color: "rgba(255,255,255,0.3)", letterSpacing: "0.5em",
          }}>七日成长</div>
          <div style={{
            fontSize: 8.5, padding: "1.5px 5px", borderRadius: 999,
            background: "rgba(255,255,255,0.16)", color: "#fff",
            display: "inline-block", letterSpacing: "0.04em",
          }}>限定 · 第 3 期</div>
          <div className="tz-serif" style={{ fontSize: 14, fontWeight: 500, marginTop: 8, lineHeight: 1.3 }}>
            七天成长计划
          </div>
          <div style={{ fontSize: 9.5, opacity: 0.78, marginTop: 4 }}>从见我，到见今。</div>
          <div style={{ display: "flex", gap: 10, fontSize: 8.5, marginTop: 10, opacity: 0.8 }}>
            <span>8 节</span><span>62 min</span><span>96 同伴</span>
          </div>
        </div>

        {/* 课时列表（4 行示意） */}
        <div style={{ padding: "0 12px", flex: 1, overflow: "hidden" }}>
          {[
            ["开篇·一支笔之外", "08:24", "done"],
            ["第一日·见我", "09:12", "done"],
            ["第二日·见物", "已看 64%", "playing"],
            ["第三日·见人", "未开放", "locked"],
          ].map(([t, d, s], i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "8px 10px", marginBottom: 5,
              background: "#fff", border: "1px solid var(--paper-edge)", borderRadius: 7,
              opacity: s === "locked" ? 0.55 : 1,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 999, flex: "0 0 auto",
                background: s === "playing" ? "var(--accent-ink)" :
                           s === "done" ? "var(--paper-deep)" : "var(--paper-deep)",
                color: s === "playing" ? "#fff" : s === "done" ? "var(--accent)" : "var(--ink-4)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {s === "done" ? <I.check size={10}/> :
                 s === "playing" ? <I.play size={8}/> : "🔒"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: s === "playing" ? 500 : 400,
                              color: s === "playing" ? "var(--accent-deep)" : "var(--ink)" }}>{t}</div>
                <div className="tz-mono" style={{ fontSize: 8, color: "var(--ink-3)", marginTop: 1.5 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 8 · FAQ
// ─────────────────────────────────────────────────────────────
function SiteFAQ() {
  const qs = [
    {
      q: "同舟和小鹅通有什么不同？",
      a: "同舟是为「100 位学员的独立老师」而做的极简工具——没有装修商城、没有分销、没有营销组合拳；不收钱、不抽佣、不绑公众号。最关键的差异：同舟保证「学员看视频不被中断」，即使你超额，已发布的内容也持续可播。",
    },
    {
      q: "学员怎么付费给我？",
      a: "同舟不做支付通道。学员通过你已有的渠道付费——小报童、知识星球、微信红包、直接转账，都行。付费后你把同舟生成的分享链接发给学员；如果需要单加，后台有 CSV 导入和单加入口。",
    },
    {
      q: "需要公众号、备案、营业执照吗？",
      a: "V0 不需要。邮箱注册即开通独立空间。V0.5 起会接入「公众号 OAuth + 订阅消息」作为可选增强，但永远不会是必选项。",
    },
    {
      q: "视频会被盗录怎么办？",
      a: "默认开启：阿里云 VOD 限时 playAuth（6 小时失效）+ 学员手机号水印（22° 斜向自动平铺）+ 可选禁右键。能挡住 90% 的非专业盗录；对于专业屏录无法 100% 防御——这是行业共识。",
    },
    {
      q: "超额了会发生什么？",
      a: "80–100% 横幅 + 邮件提示；100–120% 创作者侧上传/加学员置灰，元数据仍可编辑；>120% 持续 7 日后台只读。任何阶段：学员的观看体验都不受影响，已发布内容继续可播。",
    },
    {
      q: "可以导出我的数据吗？",
      a: "Pro 起支持完整导出：学员名单（CSV）、播放心跳事件流（JSONL）、计量原始记录。同舟不锁数据，你随时可以带走或迁移。",
    },
  ];
  return (
    <section style={{ padding: "96px 0" }}>
      <SiteContainer>
        <SectionLead num="06 · 答 疑" title="可能你正在想的问题" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 56px" }}>
          {qs.map((it, i) => (
            <div key={i} style={{
              padding: "20px 0",
              borderTop: "1px solid var(--paper-line)",
              borderBottom: i >= qs.length - 2 ? "1px solid var(--paper-line)" : "none",
            }}>
              <h4 className="tz-serif" style={{
                margin: "0 0 10px", fontSize: 15.5, fontWeight: 500,
                display: "flex", alignItems: "baseline", gap: 10,
              }}>
                <span className="tz-mono" style={{ fontSize: 11, color: "var(--ink-4)", flex: "0 0 auto" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {it.q}
              </h4>
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.75, paddingLeft: 26 }}>
                {it.a}
              </p>
            </div>
          ))}
        </div>
      </SiteContainer>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// 9 · 末尾 CTA + Footer
// ─────────────────────────────────────────────────────────────
function SiteCTA() {
  return (
    <section style={{
      padding: "100px 0", background: "var(--ink)", color: "var(--paper)",
      position: "relative", overflow: "hidden",
    }}>
      <div aria-hidden style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        fontFamily: "var(--serif)", fontSize: 520, opacity: 0.04,
        color: "var(--paper)", lineHeight: 0.9, letterSpacing: 0,
        pointerEvents: "none", userSelect: "none",
      }}>同 舟</div>

      <SiteContainer style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <span className="tz-stamp" style={{ background: "var(--seal)" }}>舟</span>
        <h2 className="tz-serif" style={{
          margin: "20px 0 18px", fontSize: 56, fontWeight: 500, lineHeight: 1.15,
          letterSpacing: "-0.015em",
        }}>
          今天，就把你的第一节课<br/>
          交到学员手上。
        </h2>
        <p style={{
          margin: "0 auto 36px", fontSize: 15, color: "rgba(255,255,255,0.65)",
          maxWidth: 520, lineHeight: 1.7,
        }}>
          邮箱注册，30 分钟跑通。免费方案足以服务你的前 200 位学员——
          等到他们成长为 2,000 位时再升级也来得及。
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center" }}>
          <button style={{
            padding: "14px 24px", background: "var(--paper)", color: "var(--ink)",
            border: 0, borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer",
            fontFamily: "var(--sans)",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <I.mail size={13}/> 邮箱开通空间
          </button>
          <button style={{
            padding: "14px 22px", background: "transparent", color: "var(--paper)",
            border: "1px solid rgba(255,255,255,0.25)", borderRadius: 6, fontSize: 14, cursor: "pointer",
            fontFamily: "var(--sans)",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            预约一次对谈 <I.chevR size={12} style={{ opacity: 0.6 }}/>
          </button>
        </div>
      </SiteContainer>
    </section>
  );
}

function SiteFooter() {
  const cols = [
    { t: "产品", l: ["功能概览", "30 分钟链路", "学员 H5", "创作者后台", "更新日志"] },
    { t: "方案", l: ["Freemium", "Pro", "Team / 私有部署", "教育优惠"] },
    { t: "资源", l: ["开始使用", "迁移指南", "API 文档", "状态页", "博客"] },
    { t: "公司", l: ["关于同舟", "招贤纳士 · 1 席", "联系我们", "媒体素材"] },
  ];
  return (
    <footer style={{ padding: "56px 0 32px", background: "var(--paper)", borderTop: "1px solid var(--paper-line)" }}>
      <SiteContainer>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(4, 1fr)", gap: 36, marginBottom: 36 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <TZMark size={22}/>
              <span className="tz-serif" style={{ fontSize: 16, fontWeight: 500, letterSpacing: "0.06em" }}>同舟</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ink-3)", lineHeight: 1.7, maxWidth: 260 }}>
              一艘小船 ——
              为独立创作者把视频可靠地交到学员眼前。
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.t}>
              <div className="tz-mono" style={{
                fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.16em",
                marginBottom: 12, textTransform: "uppercase",
              }}>{c.t}</div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {c.l.map((x) => (
                  <li key={x} style={{ fontSize: 12.5, color: "var(--ink-2)", cursor: "pointer" }}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 22, borderTop: "1px solid var(--paper-line)",
          fontSize: 11, color: "var(--ink-3)",
        }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <span>© 2026 同舟 · TONGZHOU</span>
            <a style={{ cursor: "pointer" }}>隐私</a>
            <a style={{ cursor: "pointer" }}>服务条款</a>
            <a style={{ cursor: "pointer" }}>ICP 备 2026-XXXXXX 号</a>
          </div>
          <div className="tz-mono" style={{ letterSpacing: "0.1em", color: "var(--ink-4)" }}>
            BUILT WITH PATIENCE · 慢工
          </div>
        </div>
      </SiteContainer>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// 顶层
// ─────────────────────────────────────────────────────────────
function TongzhouSite() {
  return (
    <div className="tz tz-paper" style={{ width: "100%", minHeight: "100%" }}>
      <SiteNav />
      <SiteHero />
      <SiteRedlines />
      <SiteOnboarding />
      <SiteMetering />
      <SitePricing />
      <SiteCase />
      <SiteFAQ />
      <SiteCTA />
      <SiteFooter />
    </div>
  );
}

Object.assign(window, { TongzhouSite });
