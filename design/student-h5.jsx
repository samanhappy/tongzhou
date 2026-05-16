// 学员 H5 · 醒春阁 七天成长计划
// 信息架构来自 01-信息架构.md §3.0 (V0 极简单页 · 3 个页面)
// 必须保留：创作者品牌头 → 课时列表 → 视频播放（含水印）→ 加群联系
// 注意：水印来自 V0 文档「视频防盗链 + 学员手机号水印」红线要求

// ─────────────────────────────────────────────────────────────
// 通用页头（创作者品牌）
// ─────────────────────────────────────────────────────────────
function H5Brand({ compact }) {
  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <XCMark size={22} />
        <span className="tz-serif" style={{ fontSize: 15, fontWeight: 500 }}>醒春阁</span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "36px 0 22px" }}>
      <XCMark size={56} />
      <div style={{ textAlign: "center" }}>
        <div className="tz-serif" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "0.05em" }}>醒春阁</div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 5, letterSpacing: "0.1em" }}>
          XING · CHUN · GE
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 14, padding: "0 32px", lineHeight: 1.6 }}>
          七天清晨的写作陪跑 ——<br/>
          一念一札，从见我到见今。
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 学员 H5 · 落地页（分享链接进来后的第一屏）
// ─────────────────────────────────────────────────────────────
function H5Landing() {
  const lessons = [
    { n: 0, t: "开篇 · 一支笔之外", d: "08:24", status: "done" },
    { n: 1, t: "第一日 · 见我",     d: "09:12", status: "done" },
    { n: 2, t: "第二日 · 见物",     d: "11:02", status: "playing", progress: 64 },
    { n: 3, t: "第三日 · 见人",     d: "—",     status: "locked" },
    { n: 4, t: "第四日 · 见事",     d: "—",     status: "locked" },
    { n: 5, t: "第五日 · 见念",     d: "10:30", status: "available" },
    { n: 6, t: "第六日 · 见旧",     d: "—",     status: "locked" },
    { n: 7, t: "第七日 · 见今",     d: "12:45", status: "locked" },
  ];

  return (
    <div className="tz tz-paper" style={{ minHeight: "100%", paddingBottom: 100 }}>
      {/* 顶部品牌 */}
      <H5Brand />

      {/* 课程卡 */}
      <div style={{ padding: "0 18px" }}>
        <div style={{
          position: "relative",
          background: "linear-gradient(180deg, var(--accent-ink) 0%, oklch(0.32 0.05 162) 100%)",
          color: "#fff", borderRadius: 12, padding: "20px 18px",
          overflow: "hidden",
        }}>
          {/* 装饰：竖向篆题 */}
          <div className="tz-vt" style={{
            position: "absolute", right: 12, top: 14, bottom: 14,
            fontSize: 11, color: "rgba(255,255,255,0.32)",
            letterSpacing: "0.6em",
          }}>七日成长</div>

          <span className="tz-chip is-seal" style={{ background: "rgba(255,255,255,0.14)", color: "#fff", border: 0 }}>
            <I.sparkle size={10}/> 限定 · 第 3 期
          </span>
          <h1 className="tz-serif" style={{
            margin: "12px 0 8px", fontSize: 22, fontWeight: 500, lineHeight: 1.3,
            maxWidth: "85%",
          }}>
            七天成长计划<br/>
            <span style={{ fontSize: 16, opacity: 0.78 }}>· 习作启蒙 ·</span>
          </h1>
          <p style={{ margin: "0 0 14px", fontSize: 12, opacity: 0.8, maxWidth: "78%", lineHeight: 1.65 }}>
            在七个清晨，从「见我」走到「见今」。每日 10 分钟，写一张札。
          </p>
          <div style={{ display: "flex", gap: 16, fontSize: 11, opacity: 0.8 }}>
            <span><b style={{ fontVariantNumeric: "tabular-nums" }}>8</b> 节</span>
            <span><b style={{ fontVariantNumeric: "tabular-nums" }}>62</b> 分钟</span>
            <span><b style={{ fontVariantNumeric: "tabular-nums" }}>96</b> 位同伴在学</span>
          </div>
        </div>

        {/* 进度提示 */}
        <div style={{
          marginTop: 14, background: "#fff",
          border: "1px solid var(--paper-edge)", borderRadius: 8,
          padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 3 }}>继续从上次的地方</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>第二日 · 见物</div>
            <div style={{ marginTop: 8 }}><Bar value={64} /></div>
          </div>
          <button style={{
            width: 40, height: 40, borderRadius: 999, border: 0,
            background: "var(--accent-ink)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <I.play size={16} />
          </button>
        </div>

        {/* 课时列表 */}
        <div style={{ marginTop: 22 }}>
          <div style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12,
          }}>
            <h3 className="tz-serif" style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>课时</h3>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>共 8 节 · 已完成 2</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {lessons.map((l) => (
              <div key={l.n} style={{
                background: "#fff", border: "1px solid var(--paper-edge)",
                borderRadius: 10, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
                opacity: l.status === "locked" ? 0.45 : 1,
              }}>
                <div style={{
                  width: 32, height: 32, flex: "0 0 auto",
                  borderRadius: 999,
                  background: l.status === "playing" ? "var(--accent-ink)" :
                              l.status === "done" ? "var(--paper-deep)" :
                              l.status === "locked" ? "var(--paper-deep)" : "var(--accent-soft)",
                  color: l.status === "playing" ? "#fff" :
                         l.status === "done" ? "var(--accent)" :
                         l.status === "locked" ? "var(--ink-4)" : "var(--accent-deep)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--mono)", fontSize: 11,
                }}>
                  {l.status === "done" ? <I.check size={14}/> :
                   l.status === "playing" ? <I.play size={11}/> :
                   l.status === "locked" ? "🔒" :
                   String(l.n).padStart(2, "0")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: l.status === "playing" ? 500 : 400,
                                color: l.status === "playing" ? "var(--accent-deep)" : "var(--ink)" }}>
                    {l.t}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 3, fontFamily: "var(--mono)" }}>
                    {l.status === "locked" ? "未开放" : l.d}
                    {l.status === "playing" && ` · 已看 ${l.progress}%`}
                  </div>
                </div>
                {l.status !== "locked" && <I.chevR size={14} style={{ color: "var(--ink-4)" }}/>}
              </div>
            ))}
          </div>
        </div>

        {/* 加群联系 */}
        <div style={{ marginTop: 26 }}>
          <button style={{
            width: "100%", padding: "14px 16px", borderRadius: 10,
            background: "var(--paper-deep)",
            border: "1px solid var(--paper-edge)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontSize: 13, fontWeight: 500, color: "var(--ink)",
          }}>
            <I.qr size={15}/>
            加群联系老师
          </button>
          <div style={{ textAlign: "center", fontSize: 10.5, color: "var(--ink-3)", marginTop: 10, lineHeight: 1.7 }}>
            由 <b style={{ color: "var(--ink-2)" }}>同舟</b> 提供轻量化课程交付 · v0.3
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 学员 H5 · 播放页（含手机号水印）— V0 红线要求
// ─────────────────────────────────────────────────────────────
function H5Player() {
  return (
    <div className="tz" style={{ minHeight: "100%", background: "#0e0e0c", color: "#f0eee9" }}>
      {/* Top nav */}
      <div style={{
        display: "flex", alignItems: "center", padding: "12px 16px", gap: 12,
        position: "relative", zIndex: 2,
      }}>
        <button style={{ background: "rgba(255,255,255,0.08)", border: 0, borderRadius: 999, width: 32, height: 32,
          display: "flex", alignItems: "center", justifyContent: "center", color: "#f0eee9" }}>
          <I.back size={15}/>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            第二日 · 见物
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
            醒春阁 · 七天成长计划
          </div>
        </div>
        <button style={{ background: "transparent", border: 0, color: "#f0eee9" }}>
          <I.share size={16}/>
        </button>
      </div>

      {/* 视频区 */}
      <div style={{ position: "relative", aspectRatio: "16 / 10", overflow: "hidden", background: "#000" }}>
        <Placeholder w="100%" h="100%" radius={0} dark label="封面 · 春日小院" />

        {/* 水印 ——— V0 红线 */}
        <WatermarkLayer text="138****2204 · 醒春阁" />

        {/* 中央播放按钮 */}
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 999,
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff",
          }}>
            <I.play size={22} style={{ marginLeft: 3 }} />
          </div>
        </div>

        {/* 控件 */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          padding: "20px 14px 12px",
          background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.7))",
          color: "#fff",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 10.5, fontFamily: "var(--mono)" }}>
            <span>07:08</span>
            <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.2)", borderRadius: 999 }}>
              <div style={{ width: "64%", height: "100%", background: "#fff", borderRadius: 999, position: "relative" }}>
                <div style={{ position: "absolute", right: -5, top: -3, width: 9, height: 9, background: "#fff", borderRadius: 999 }} />
              </div>
            </div>
            <span style={{ opacity: 0.6 }}>11:02</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <I.pause size={18}/>
            <I.vol size={16} style={{ opacity: 0.8 }}/>
            <div style={{ fontSize: 11, opacity: 0.7, padding: "2px 8px", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 4, fontFamily: "var(--mono)" }}>1.0×</div>
            <div style={{ flex: 1 }}/>
            <div style={{ fontSize: 10.5, opacity: 0.75, fontFamily: "var(--mono)" }}>1080p</div>
            <I.fullscr size={16} style={{ opacity: 0.8 }}/>
          </div>
        </div>

        {/* 防盗链 / 限时 */}
        <div style={{
          position: "absolute", top: 14, right: 12,
          background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.8)",
          padding: "4px 8px", borderRadius: 4,
          fontSize: 10, fontFamily: "var(--mono)", letterSpacing: "0.05em",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <I.clock size={11}/> 6h playAuth
        </div>
      </div>

      {/* 下方内容 */}
      <div style={{
        padding: "20px 18px 100px",
        background: "var(--paper)",
        color: "var(--ink)",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        marginTop: -12, position: "relative", zIndex: 2,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span className="tz-chip is-accent" style={{ fontSize: 10 }}>第二日 · 02 / 08</span>
          <span style={{ fontSize: 10.5, color: "var(--ink-3)", fontFamily: "var(--mono)" }}>5/16 · 已看 64%</span>
        </div>

        <h2 className="tz-serif" style={{ margin: "0 0 6px", fontSize: 19, fontWeight: 500 }}>
          见物 · 把一件物写到能闻见
        </h2>
        <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.7 }}>
          今日的练习是：选一件你今早遇到的、并不起眼的物件——一杯水、一把椅子、窗边一束光——
          用 300 字把它写到能闻见、能摸到、能听到声音。<i>不评价，只描述。</i>
        </p>

        {/* 心跳/防盗链小注 */}
        <div style={{
          padding: "10px 12px", background: "var(--paper-deep)",
          border: "1px solid var(--paper-edge)", borderRadius: 6,
          fontSize: 10.5, color: "var(--ink-3)",
          display: "flex", alignItems: "flex-start", gap: 8,
        }}>
          <I.info size={12} style={{ marginTop: 1, flex: "0 0 auto" }}/>
          <span>视频带有你的<b style={{ color: "var(--ink-2)" }}>手机号水印</b>用于版权保护 · 链接 6 小时后将自动失效，可随时回到本页重启。</span>
        </div>

        {/* 上下课时 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
          <button style={{
            padding: "12px", background: "#fff", border: "1px solid var(--paper-edge)",
            borderRadius: 8, textAlign: "left", display: "flex", alignItems: "center", gap: 8,
          }}>
            <I.chevL size={14} style={{ color: "var(--ink-3)" }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: "var(--ink-3)" }}>上一课时</div>
              <div style={{ fontSize: 11.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                第一日 · 见我
              </div>
            </div>
          </button>
          <button style={{
            padding: "12px", background: "var(--ink)", color: "#fff", border: 0,
            borderRadius: 8, textAlign: "right", display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, opacity: 0.6 }}>下一课时</div>
              <div style={{ fontSize: 11.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                第三日 · 见人
              </div>
            </div>
            <I.chevR size={14} style={{ opacity: 0.6 }}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 学员 H5 · 「我的」抽屉 (可选绑定手机号)
// ─────────────────────────────────────────────────────────────
function H5Me() {
  return (
    <div className="tz tz-paper" style={{ minHeight: "100%", paddingBottom: 100 }}>
      <div style={{ padding: "20px 18px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <button style={{ background: "transparent", border: 0, color: "var(--ink-2)" }}>
          <I.back size={16}/>
        </button>
        <span className="tz-serif" style={{ fontSize: 15, fontWeight: 500 }}>我的</span>
      </div>

      {/* 当前身份 */}
      <div style={{ padding: "0 18px" }}>
        <div style={{
          background: "#fff", border: "1px solid var(--paper-edge)",
          borderRadius: 12, padding: "18px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 999,
            background: "var(--paper-deep)", color: "var(--ink-3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--serif)", fontSize: 22,
          }}>?</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>访客身份</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>
              当前进度仅保存在本设备
            </div>
          </div>
        </div>

        {/* 绑定提示 */}
        <div style={{
          marginTop: 14, padding: "16px",
          background: "var(--accent-soft)",
          border: "1px solid color-mix(in oklch, var(--accent) 18%, transparent)",
          borderRadius: 10,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <I.sparkle size={16} style={{ color: "var(--accent-deep)", marginTop: 1, flex: "0 0 auto" }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--accent-deep)" }}>
                绑定手机号 · 跨设备同步
              </div>
              <div style={{ fontSize: 11, color: "var(--accent-deep)", opacity: 0.85, marginTop: 4, lineHeight: 1.6 }}>
                绑定后，你的进度可以在手机、平板、桌面上继续看。完全可选。
              </div>
            </div>
          </div>
          <button style={{
            marginTop: 12, width: "100%", padding: "10px",
            background: "var(--accent-ink)", color: "#fff",
            border: 0, borderRadius: 6, fontSize: 12.5, fontWeight: 500,
          }}>
            绑定手机号
          </button>
        </div>

        {/* 我看过的 */}
        <div style={{ marginTop: 24 }}>
          <h3 className="tz-serif" style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 500 }}>我看过的课程</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { t: "七天成长计划 · 习作启蒙", who: "醒春阁", p: 28 },
            ].map((c, i) => (
              <div key={i} style={{
                background: "#fff", border: "1px solid var(--paper-edge)", borderRadius: 10,
                padding: 12, display: "flex", gap: 12, alignItems: "center",
              }}>
                <Placeholder w={60} h={60} radius={6} label="" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 3 }}>{c.t}</div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginBottom: 8 }}>{c.who}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}><Bar value={c.p}/></div>
                    <span style={{ fontSize: 10.5, color: "var(--ink-2)", fontVariantNumeric: "tabular-nums" }}>{c.p}%</span>
                  </div>
                </div>
              </div>
            ))}
            <div style={{
              padding: "30px 12px", textAlign: "center",
              fontSize: 11.5, color: "var(--ink-3)",
              border: "1px dashed var(--paper-edge)", borderRadius: 10,
            }}>
              通过分享链接打开更多课程<br/>
              <span style={{ fontSize: 10.5, color: "var(--ink-4)" }}>· V0 不支持课程目录浏览 ·</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, fontSize: 10.5, color: "var(--ink-4)", textAlign: "center", lineHeight: 1.8 }}>
          由 同舟 提供轻量化课程交付<br/>
          隐私 · 服务条款 · 反馈
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { H5Landing, H5Player, H5Me });
