// Onboarding 30 分钟链路 (V0 DoD: 创作者 30 分钟内：注册 → 上传 1 个视频 → 发布 1 门课 → 拿到分享链接)
// 用 5 个并排展示的"屏"显示串联体验

function OnbStep({ step, total, title, time, children }) {
  return (
    <div style={{
      width: 340, flex: "0 0 340px",
      background: "var(--paper)",
      border: "1px solid var(--paper-edge)",
      borderRadius: 12,
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      boxShadow: "var(--shadow-1)",
    }}>
      {/* 顶部进度条 */}
      <div style={{
        padding: "14px 18px 12px",
        borderBottom: "1px solid var(--paper-line)",
        background: "#fff",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TZMark size={20} />
            <span className="tz-serif" style={{ fontSize: 13, fontWeight: 500 }}>同舟</span>
          </div>
          <span style={{ fontSize: 10.5, color: "var(--ink-3)", fontFamily: "var(--mono)" }}>
            {step} / {total} · {time}
          </span>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 2, borderRadius: 999,
              background: i < step ? "var(--accent)" : "var(--paper-line)",
            }} />
          ))}
        </div>
        <h3 className="tz-serif" style={{ margin: "12px 0 0", fontSize: 16, fontWeight: 500 }}>{title}</h3>
      </div>

      <div style={{ flex: 1, padding: "18px", overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}

function CreatorOnboarding() {
  return (
    <div className="tz tz-paper" style={{
      width: "100%", height: "100%", padding: "20px 24px",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      {/* 顶部说明 */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 4px",
      }}>
        <div>
          <h2 className="tz-serif" style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>
            创作者 30 分钟链路 · V0 DoD
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ink-3)" }}>
            注册 → 品牌 → 上传 → 发布 → 拿到分享链接 · 全过程目标 ≤ 30 分钟（含转码）
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--ink-2)" }}>
          <span><b style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>5</b> 步</span>
          <span>·</span>
          <span><b style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>≤ 30</b> min</span>
          <span>·</span>
          <span><b style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>0</b> 件资质</span>
        </div>
      </div>

      <div style={{
        flex: 1, display: "flex", gap: 14, overflowX: "auto",
        paddingBottom: 8,
      }}>
        {/* Step 1 — 注册 */}
        <OnbStep step={1} total={5} title="开通空间" time="2 min">
          <p style={{ margin: "0 0 16px", fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
            邮箱注册即开通你的独立空间，<b>不需要</b>微信公众号、不需要支付商户号。
          </p>
          <Field2 label="邮箱">
            <input className="tz-input" defaultValue="hello@xingchunge.com" style={{ fontSize: 12 }}/>
          </Field2>
          <Field2 label="密码">
            <input className="tz-input" type="password" defaultValue="•••••••••••" style={{ fontSize: 12 }}/>
          </Field2>
          <Field2 label="创作者名 · 空间名">
            <input className="tz-input" defaultValue="醒春阁" style={{ fontSize: 12 }}/>
          </Field2>
          <button className="tz-btn tz-btn-primary" style={{ width: "100%", marginTop: 14, justifyContent: "center" }}>
            创建我的空间
          </button>
          <div style={{
            marginTop: 14, padding: "10px 12px",
            background: "var(--paper-deep)", borderRadius: 6,
            fontSize: 10.5, color: "var(--ink-3)", lineHeight: 1.6,
          }}>
            <b style={{ color: "var(--ink-2)" }}>0 件资质：</b>
            同舟不收钱，你的学员通过自己的渠道（小报童 / 知识星球 / 微信红包）付费；
            同舟只负责交付。
          </div>
        </OnbStep>

        {/* Step 2 — 品牌 */}
        <OnbStep step={2} total={5} title="设置品牌" time="3 min">
          <p style={{ margin: "0 0 14px", fontSize: 11.5, color: "var(--ink-2)" }}>
            学员会看见你的 Logo、主题色、子域名 — 不见同舟字样。
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <XCMark size={48} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 500 }}>已上传 logo.png</div>
              <button className="tz-btn tz-btn-ghost" style={{ padding: "4px 6px", fontSize: 10.5 }}>替换</button>
            </div>
          </div>
          <Field2 label="主题色">
            <div style={{ display: "flex", gap: 6 }}>
              {[["#1a4d4a", true], ["#7a2e1f"], ["#1e3a8a"], ["#0c0c0c"], ["#c2410c"]].map(([c, on]) => (
                <div key={c} style={{
                  width: 28, height: 28, borderRadius: 999, background: c,
                  border: on ? "2px solid var(--ink)" : "2px solid transparent",
                  boxShadow: on ? "inset 0 0 0 2px #fff" : "none",
                }}/>
              ))}
            </div>
          </Field2>
          <Field2 label="子域名">
            <div style={{ display: "flex" }}>
              <input className="tz-input" defaultValue="xingchunge"
                style={{ fontSize: 12, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}/>
              <div style={{
                background: "var(--paper-deep)", border: "1px solid var(--paper-edge)", borderLeft: 0,
                borderRadius: "0 6px 6px 0", padding: "0 10px",
                display: "flex", alignItems: "center", fontSize: 10.5, color: "var(--ink-2)",
                fontFamily: "var(--mono)",
              }}>.tongzhou.app</div>
            </div>
            <div style={{ fontSize: 10, color: "var(--accent)", marginTop: 4 }}>✓ 可用</div>
          </Field2>
          <button className="tz-btn tz-btn-primary" style={{ width: "100%", marginTop: 14, justifyContent: "center" }}>
            下一步 · 上传视频
          </button>
        </OnbStep>

        {/* Step 3 — 上传视频 */}
        <OnbStep step={3} total={5} title="上传第一个视频" time="15 min">
          <p style={{ margin: "0 0 14px", fontSize: 11.5, color: "var(--ink-2)" }}>
            OSS 直传 · 单文件 ≤ 2 GB · 边播边转
          </p>

          {/* 已上传文件 */}
          <div style={{
            background: "#fff", border: "1px solid var(--paper-edge)",
            borderRadius: 8, padding: "12px 14px", marginBottom: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <I.video size={14} style={{ color: "var(--accent)" }}/>
              <span style={{ fontSize: 12, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                第一日·见我.mp4
              </span>
              <span style={{ fontSize: 10, color: "var(--ink-3)", fontFamily: "var(--mono)" }}>312 MB</span>
            </div>
            <Bar value={100} />
            <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--accent)" }}>
              <span>✓ 已上传 · 转码中</span>
              <span style={{ fontFamily: "var(--mono)" }}>1080p 完成 · 720p 进行中</span>
            </div>
          </div>

          {/* 上传中文件 */}
          <div style={{
            background: "#fff", border: "1px solid var(--paper-edge)",
            borderRadius: 8, padding: "12px 14px", marginBottom: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <I.video size={14} style={{ color: "var(--ink-3)" }}/>
              <span style={{ fontSize: 12, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                第二日·见物.mp4
              </span>
              <span style={{ fontSize: 10, color: "var(--ink-3)", fontFamily: "var(--mono)" }}>412 MB</span>
            </div>
            <Bar value={64} />
            <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--ink-2)" }}>
              <span>上传中 · 64%</span>
              <span style={{ fontFamily: "var(--mono)" }}>2 min 余</span>
            </div>
          </div>

          {/* 拖拽区 */}
          <div style={{
            padding: "20px 12px", textAlign: "center",
            border: "1.5px dashed var(--paper-edge)", borderRadius: 8,
            background: "var(--paper-deep)",
            fontSize: 11, color: "var(--ink-2)",
          }}>
            <I.upload size={18} style={{ color: "var(--accent)" }}/>
            <div style={{ marginTop: 6 }}>把视频文件拖到这里</div>
            <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4 }}>或 <a style={{ color: "var(--accent)" }}>从本地选择</a></div>
          </div>

          <button className="tz-btn tz-btn-primary" style={{ width: "100%", marginTop: 14, justifyContent: "center" }}>
            下一步 · 组织成课程
          </button>
        </OnbStep>

        {/* Step 4 — 发布课程 */}
        <OnbStep step={4} total={5} title="组织成课程并发布" time="6 min">
          <Field2 label="课程名称">
            <input className="tz-input" defaultValue="七天成长计划 · 习作启蒙" style={{ fontSize: 12 }}/>
          </Field2>
          <Field2 label="一句话简介">
            <input className="tz-input" defaultValue="七个清晨，从见我到见今。" style={{ fontSize: 12 }}/>
          </Field2>

          <div style={{ marginTop: 14, marginBottom: 8, fontSize: 11, fontWeight: 500 }}>课时（2）</div>
          {[
            { t: "第一日 · 见我", d: "09:12", ok: true },
            { t: "第二日 · 见物", d: "上传中…", ok: false },
          ].map((l, i) => (
            <div key={i} style={{
              background: "#fff", border: "1px solid var(--paper-edge)",
              borderRadius: 6, padding: "8px 10px", marginBottom: 6,
              display: "flex", alignItems: "center", gap: 8, fontSize: 11.5,
            }}>
              <I.grip size={12} style={{ color: "var(--ink-4)" }}/>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-3)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ flex: 1 }}>{l.t}</span>
              <span style={{ fontSize: 10, color: l.ok ? "var(--accent)" : "var(--ink-3)", fontFamily: "var(--mono)" }}>
                {l.d}
              </span>
            </div>
          ))}

          <button className="tz-btn tz-btn-ghost" style={{ width: "100%", marginTop: 4, padding: "8px", fontSize: 11.5, color: "var(--accent-deep)", border: "1px dashed var(--paper-edge)" }}>
            <I.plus size={11}/> 新增课时
          </button>

          <div style={{
            marginTop: 14, padding: "10px 12px", background: "var(--accent-soft)",
            borderRadius: 6, fontSize: 10.5, color: "var(--accent-deep)",
            display: "flex", gap: 6,
          }}>
            <I.info size={12} style={{ marginTop: 1, flex: "0 0 auto" }}/>
            <span>第二日仍在转码 · 发布后会自动开放，无需等待</span>
          </div>

          <button className="tz-btn tz-btn-accent" style={{ width: "100%", marginTop: 14, justifyContent: "center" }}>
            <I.check size={13}/> 发布课程
          </button>
        </OnbStep>

        {/* Step 5 — 拿到分享链接 */}
        <OnbStep step={5} total={5} title="拿到分享链接 · 完成" time="4 min">
          <div style={{
            padding: "16px 14px",
            background: "linear-gradient(180deg, var(--accent-soft), var(--paper))",
            border: "1px solid color-mix(in oklch, var(--accent) 18%, transparent)",
            borderRadius: 10, textAlign: "center", marginBottom: 16,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 999, margin: "0 auto 10px",
              background: "var(--accent)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <I.check size={18}/>
            </div>
            <div className="tz-serif" style={{ fontSize: 15, fontWeight: 500 }}>已发布</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
              用时 28 min · 在 30 分钟红线内 ✓
            </div>
          </div>

          {/* QR */}
          <div style={{
            background: "#fff", border: "1px solid var(--paper-edge)",
            borderRadius: 8, padding: 14,
            display: "flex", alignItems: "center", gap: 12, marginBottom: 12,
          }}>
            <div style={{
              width: 72, height: 72, flex: "0 0 auto",
              background: `
                repeating-linear-gradient(0deg, var(--ink) 0 2px, transparent 2px 4px),
                repeating-linear-gradient(90deg, var(--ink) 0 2px, #fff 2px 4px)
              `,
              borderRadius: 4, border: "3px solid #fff",
              outline: "1px solid var(--paper-edge)",
            }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 3 }}>分享链接</div>
              <div className="tz-mono" style={{
                fontSize: 11, color: "var(--accent-deep)", fontWeight: 500,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                marginBottom: 6,
              }}>
                xingchunge.tongzhou.app/c/qrqt
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="tz-btn" style={{ padding: "4px 8px", fontSize: 10.5 }}><I.copy size={10}/> 复制</button>
                <button className="tz-btn" style={{ padding: "4px 8px", fontSize: 10.5 }}><I.qr size={10}/> 海报</button>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11.5, fontWeight: 500, marginBottom: 8 }}>下一步建议</div>
          {[
            { i: <I.csv size={12}/>, t: "导入第一批学员名单（CSV）" },
            { i: <I.share size={12}/>, t: "把链接发到你已有的微信群" },
            { i: <I.usage size={12}/>, t: "在用量面板了解 Freemium 配额" },
          ].map((s, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 0", borderTop: "1px solid var(--paper-line)",
              fontSize: 11.5, color: "var(--ink-2)",
            }}>
              <span style={{ color: "var(--accent)" }}>{s.i}</span>
              <span style={{ flex: 1 }}>{s.t}</span>
              <I.chevR size={12} style={{ color: "var(--ink-4)" }}/>
            </div>
          ))}
        </OnbStep>
      </div>
    </div>
  );
}

function Field2({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginBottom: 6, letterSpacing: "0.04em" }}>{label}</div>
      {children}
    </div>
  );
}

Object.assign(window, { CreatorOnboarding });
