// 创作者后台 · 学员 / 用量计费 / 设置

// ─────────────────────────────────────────────────────────────
// 学员名单（V0：单加 + CSV 导入；V0.5 起加 Webhook）
// ─────────────────────────────────────────────────────────────
function CreatorMembers() {
  const rows = [
    { name: "李 ·· 茜",  phone: "138****2204", src: "CSV · 知识星球",   join: "5/02",  course: 6, mins: 482, last: "刚刚",       bound: true  },
    { name: "周 ·· 屿",  phone: "—",         src: "邀请短链",          join: "5/12",  course: 3, mins: 192, last: "12 分钟前",   bound: false },
    { name: "陈 ·· 鹿",  phone: "139****8810", src: "单加",             join: "5/03",  course: 5, mins: 391, last: "26 分钟前",   bound: true  },
    { name: "吴 ·· 默",  phone: "186****4119", src: "CSV · 小报童",     join: "5/01",  course: 7, mins: 612, last: "1 小时前",   bound: true  },
    { name: "苏 ·· 砚",  phone: "—",         src: "邀请短链",          join: "5/16",  course: 1, mins: 12,  last: "2 小时前",   bound: false },
    { name: "顾 ·· 行",  phone: "135****0327", src: "单加",             join: "4/28",  course: 6, mins: 540, last: "今早",       bound: true  },
    { name: "卫 ·· 棠",  phone: "151****6620", src: "CSV · 知识星球",   join: "5/06",  course: 4, mins: 268, last: "昨日",       bound: true  },
    { name: "—",       phone: "—",         src: "邀请短链 · 未绑定",  join: "5/15",  course: 2, mins: 38,  last: "昨日",       bound: false, anon: true },
    { name: "金 ·· 砚", phone: "153****0044", src: "单加",             join: "4/22",  course: 8, mins: 720, last: "3 日前",     bound: true  },
  ];

  return (
    <TZShell active="members" breadcrumb={["醒春阁", "运营"]} title="学员"
      actions={
        <>
          <button className="tz-btn"><I.csv size={14}/> CSV 导入</button>
          <button className="tz-btn"><I.link size={14}/> 邀请短链</button>
          <button className="tz-btn tz-btn-primary"><I.plus size={14}/> 单个添加</button>
        </>
      }>

      {/* 计量提示 */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14, marginBottom: 18,
        padding: "12px 16px", background: "#fff",
        border: "1px solid var(--paper-edge)", borderRadius: 8,
      }}>
        <I.member size={18} style={{ color: "var(--accent)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5 }}>
            <b style={{ fontVariantNumeric: "tabular-nums" }}>142</b> 位本月活跃 ·
            <span style={{ color: "var(--ink-3)" }}> 计入 Freemium 配额 </span>
            <b style={{ fontVariantNumeric: "tabular-nums" }}>200</b>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>
            学员在本月内有任意访问即视为活跃 · 月底清零
          </div>
        </div>
        <div style={{ width: 220 }}><Bar value={142} max={200} /></div>
        <span style={{ fontSize: 11.5, color: "var(--ink-2)", fontVariantNumeric: "tabular-nums" }}>71%</span>
      </div>

      {/* 过滤栏 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#fff", border: "1px solid var(--paper-edge)",
          borderRadius: 6, padding: "6px 10px", flex: "0 0 240px", fontSize: 12,
        }}>
          <I.search size={13} style={{ color: "var(--ink-3)" }} />
          <input placeholder="搜索姓名 / 手机号" style={{
            border: 0, outline: 0, background: "transparent", flex: 1, fontSize: 12,
            color: "var(--ink)",
          }} />
        </div>
        <button className="tz-btn"><I.filter size={13}/> 来源</button>
        <button className="tz-btn"><I.filter size={13}/> 已绑定</button>
        <button className="tz-btn"><I.filter size={13}/> 课程</button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>共 142 位</span>
      </div>

      {/* 表格 */}
      <div className="tz-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: "var(--paper-deep)", color: "var(--ink-3)", fontSize: 10.5, letterSpacing: "0.05em" }}>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 400, width: 24 }}>
                <input type="checkbox" />
              </th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 400 }}>学员</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 400 }}>手机号</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 400 }}>来源</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 400 }}>加入</th>
              <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 400 }}>课时</th>
              <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 400 }}>播放分钟</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 400 }}>最近活跃</th>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 400, width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--paper-line)" }}>
                <td style={{ padding: "11px 14px" }}><input type="checkbox" /></td>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 999, flex: "0 0 auto",
                      background: r.anon ? "var(--paper-deep)" : "var(--accent-ink)",
                      color: r.anon ? "var(--ink-3)" : "#fff",
                      fontFamily: "var(--serif)", fontSize: 12,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{r.anon ? "?" : r.name[0]}</div>
                    <div>
                      <div style={{ fontWeight: r.anon ? 400 : 500, color: r.anon ? "var(--ink-3)" : "var(--ink)" }}>
                        {r.anon ? <i>访客 · 未绑定</i> : r.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "11px 14px", color: r.phone === "—" ? "var(--ink-4)" : "var(--ink-2)", fontFamily: "var(--mono)", fontSize: 11.5 }}>
                  {r.phone}
                </td>
                <td style={{ padding: "11px 14px", color: "var(--ink-2)" }}>{r.src}</td>
                <td style={{ padding: "11px 14px", color: "var(--ink-2)", fontVariantNumeric: "tabular-nums" }}>{r.join}</td>
                <td style={{ padding: "11px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.course}</td>
                <td style={{ padding: "11px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.mins}</td>
                <td style={{ padding: "11px 14px", color: "var(--ink-2)" }}>{r.last}</td>
                <td style={{ padding: "11px 14px" }}>
                  {r.bound ? <span className="tz-chip is-accent" style={{ fontSize: 10 }}>已绑定</span>
                           : <span className="tz-chip" style={{ fontSize: 10 }}>访客</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TZShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 用量计费（V0 核心差异化页面）
// ─────────────────────────────────────────────────────────────
function MeterCard({ name, key_, value, max, unit, color, sub, sample }) {
  const pct = Math.round((value / max) * 100);
  const tone = pct > 100 ? "var(--danger)" : pct > 80 ? "var(--warn)" : "var(--accent)";
  return (
    <div className="tz-card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 500 }}>{name}</div>
          <div className="tz-mono" style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 2 }}>{key_}</div>
        </div>
        <span className="tz-chip" style={{
          background: tone === "var(--accent)" ? "var(--accent-soft)" : `color-mix(in oklch, ${tone} 12%, #fff)`,
          color: tone,
        }}>{pct > 100 ? "超额" : pct > 80 ? "警戒" : "健康"} · {pct}%</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "10px 0 8px" }}>
        <span className="tz-serif" style={{ fontSize: 30, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{value}</span>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>/ {max} {unit}</span>
      </div>
      <Bar value={Math.min(value, max)} max={max} color={tone} />
      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8, lineHeight: 1.6 }}>
        {sub}
      </div>
      <div style={{
        marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--paper-line)",
        display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--ink-3)",
      }}>
        <span>采样：{sample}</span>
        <span>本月对账日 6/01</span>
      </div>
    </div>
  );
}

function CreatorUsage() {
  return (
    <TZShell active="usage" breadcrumb={["醒春阁", "运营"]} title="用量计费"
      actions={
        <>
          <button className="tz-btn"><I.cloud size={13}/> 重算事件流</button>
          <button className="tz-btn tz-btn-accent">升级到 Pro</button>
        </>
      }>

      {/* 当前方案与总览 */}
      <div className="tz-card" style={{
        padding: "20px 22px", marginBottom: 22,
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 220px", gap: 18, alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.08em", marginBottom: 4 }}>当前方案</div>
          <div className="tz-serif" style={{ fontSize: 19, fontWeight: 500 }}>FREE · Freemium</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>2026 年 5 月 · 计费周期</div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.08em", marginBottom: 4 }}>本月用量比例</div>
          <div className="tz-serif" style={{ fontSize: 22, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>82%</div>
          <div style={{ fontSize: 11, color: "var(--warn)", marginTop: 2 }}>距软超额还有 18%</div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.08em", marginBottom: 4 }}>预估超额费用</div>
          <div className="tz-serif" style={{ fontSize: 22, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>¥ 0</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>当前在免费额内</div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.08em", marginBottom: 4 }}>下次对账</div>
          <div className="tz-serif" style={{ fontSize: 22, fontWeight: 500 }}>6 月 1 日</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>15 天后</div>
        </div>
        <div style={{ borderLeft: "1px solid var(--paper-line)", paddingLeft: 18 }}>
          <div style={{ fontSize: 11, color: "var(--ink-2)", marginBottom: 8, lineHeight: 1.5 }}>
            升级到 <b>Pro</b> 解锁更多额度 + 按量阶梯单价
          </div>
          <button className="tz-btn tz-btn-primary" style={{ width: "100%", justifyContent: "center" }}>查看方案</button>
        </div>
      </div>

      {/* 4 维度计量 */}
      <SectionLabel stamp="量" title="本月用量 · 四维度" sub="每日刷新 · 事件流可重算" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 22 }}>
        <MeterCard
          name="月活学员"
          key_="members.active_count"
          value={142} max={200} unit="人"
          sub="学员任意一次访问即视为本月活跃 · 月底清零去重"
          sample="访问事件 / 实时"
        />
        <MeterCard
          name="发布课程"
          key_="courses.count"
          value={6} max={10} unit="门"
          sub="status = published 的课程数 · 取本月最大值"
          sample="课程状态变更 / 实时"
        />
        <MeterCard
          name="视频存储"
          key_="storage.bytes"
          value={3.8} max={5} unit="GB"
          sub="OSS bucket 用量 · 每日 03:00 快照 · 月内取平均"
          sample="OSS 用量快照 / 每日"
        />
        <MeterCard
          name="播放分钟"
          key_="playback.minutes"
          value={1284} max={1500} unit="分钟"
          sub="播放器 30 秒心跳累加 · 当月加总"
          sample="心跳事件 / 30 秒"
        />
      </div>

      {/* 降级策略 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div className="tz-card" style={{ padding: 20 }}>
          <SectionLabel stamp="级" title="超额降级路径" sub="学员观看体验永不受影响" />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ color: "var(--ink-3)", fontSize: 10.5, letterSpacing: "0.05em" }}>
                <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 400 }}>用量比例</th>
                <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 400 }}>状态</th>
                <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 400 }}>创作者侧</th>
                <th style={{ textAlign: "left", padding: "6px 0", fontWeight: 400 }}>学员侧</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["0 – 80%", "healthy",         "var(--accent)", "正常", "正常"],
                ["80 – 100%", "warning",       "var(--warn)",   "横幅 + 邮件提示", "正常"],
                ["100 – 120%", "over_soft",    "var(--seal)",   "上传 / 加学员置灰 · 元数据可编辑", "正常播放"],
                [">120% (7 日后)", "over_hard", "var(--danger)", "后台只读", "正常播放 ✓"],
              ].map((r, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--paper-line)" }}>
                  <td style={{ padding: "11px 0", fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-2)" }}>{r[0]}</td>
                  <td style={{ padding: "11px 0" }}>
                    <span style={{
                      fontFamily: "var(--mono)", fontSize: 10.5,
                      padding: "2px 7px", borderRadius: 3,
                      background: `color-mix(in oklch, ${r[2]} 12%, #fff)`,
                      color: r[2],
                    }}>{r[1]}</span>
                  </td>
                  <td style={{ padding: "11px 0", color: "var(--ink-2)" }}>{r[3]}</td>
                  <td style={{ padding: "11px 0", color: i >= 2 ? "var(--accent)" : "var(--ink-2)", fontWeight: i >= 2 ? 500 : 400 }}>{r[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{
            marginTop: 14, padding: "10px 12px", borderRadius: 6,
            background: "color-mix(in oklch, var(--seal) 9%, transparent)",
            color: "var(--seal)", fontSize: 11.5, display: "flex", gap: 8,
          }}>
            <I.warn size={14} style={{ flex: "0 0 auto", marginTop: 1 }} />
            <span><b>承诺：</b>「学员看视频不被中断」是同舟与小鹅通的差异化红线 — 即使创作者超额，已发布内容也将持续可播。</span>
          </div>
        </div>

        <div className="tz-card" style={{ padding: 18 }}>
          <SectionLabel title="月账单" />
          {[
            { p: "2026-05", st: "draft",  amt: "—" },
            { p: "2026-04", st: "paid",   amt: "¥ 0.00" },
            { p: "2026-03", st: "paid",   amt: "¥ 0.00" },
          ].map((b, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 0", borderTop: i ? "1px solid var(--paper-line)" : "none",
            }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 500, fontFamily: "var(--mono)" }}>{b.p}</div>
                <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>
                  {b.st === "draft" ? "进行中 · 仍在累计" : "已结清"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{b.amt}</div>
                {b.st === "paid" && <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>查看明细</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TZShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 设置 · 品牌
// ─────────────────────────────────────────────────────────────
function CreatorSettings() {
  return (
    <TZShell active="settings" breadcrumb={["醒春阁", "系统"]} title="设置 · 品牌">
      <div style={{ display: "flex", gap: 0, marginBottom: 22, borderBottom: "1px solid var(--paper-line)", marginTop: -10 }}>
        {[
          { k: "brand",   l: "品牌",     active: true },
          { k: "domain",  l: "域名" },
          { k: "team",    l: "团队成员", soon: true },
          { k: "wechat",  l: "微信",     soon: true },
          { k: "api",     l: "API Key", soon: true },
        ].map((t) => (
          <button key={t.k} className="tz-btn tz-btn-ghost" style={{
            borderRadius: 0, padding: "8px 14px",
            color: t.active ? "var(--ink)" : (t.soon ? "var(--ink-4)" : "var(--ink-3)"),
            borderBottom: t.active ? "2px solid var(--accent)" : "2px solid transparent",
            marginBottom: -1, fontWeight: t.active ? 500 : 400,
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            {t.l}
            {t.soon && <span style={{ fontSize: 9.5, color: "var(--ink-4)", letterSpacing: "0.06em" }}>V1</span>}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Logo */}
          <Field label="Logo" desc="正方形 · 推荐 240 × 240 · PNG / SVG">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <XCMark size={64} />
              <div>
                <button className="tz-btn">替换</button>
                <button className="tz-btn tz-btn-ghost" style={{ marginLeft: 4 }}>移除</button>
              </div>
            </div>
          </Field>

          <Field label="空间名称" desc="将显示在学员 H5 页头与浏览器标签">
            <input className="tz-input" defaultValue="醒春阁" />
          </Field>

          <Field label="一句话简介" desc="学员落地页副标 · ≤ 40 字">
            <input className="tz-input" defaultValue="七天清晨的写作陪跑 · 一念一札，从见我到见今。" />
          </Field>

          <Field label="主题色" desc="将应用于学员 H5 主按钮与重点色">
            <div style={{ display: "flex", gap: 8 }}>
              {[
                ["#1a4d4a", true, "墨青"],
                ["#7a2e1f", false, "胭脂"],
                ["#1e3a8a", false, "藏蓝"],
                ["#0c0c0c", false, "墨"],
                ["#c2410c", false, "丹"],
              ].map(([c, on, n]) => (
                <button key={c} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: 6, borderRadius: 6,
                  border: on ? "1px solid var(--ink)" : "1px solid var(--paper-edge)",
                  background: "#fff", cursor: "pointer",
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: 999, background: c }} />
                  <span style={{ fontSize: 10.5, color: "var(--ink-2)" }}>{n}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="子域名" desc="学员可通过此地址访问">
            <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
              <input className="tz-input" defaultValue="xingchunge" style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, flex: 1 }}/>
              <div style={{
                background: "var(--paper-deep)", border: "1px solid var(--paper-edge)", borderLeft: 0,
                borderRadius: "0 6px 6px 0", padding: "0 12px",
                display: "flex", alignItems: "center", fontSize: 12, color: "var(--ink-2)",
                fontFamily: "var(--mono)",
              }}>
                .tongzhou.app
              </div>
            </div>
            <div style={{ fontSize: 10.5, color: "var(--accent)", marginTop: 4 }}>✓ 可用</div>
          </Field>

          <Field label="加群链接" desc="学员页底部「加群联系老师」按钮指向">
            <input className="tz-input" defaultValue="https://work.weixin.qq.com/kfid/xingchunge" />
          </Field>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button className="tz-btn tz-btn-primary">保存修改</button>
            <button className="tz-btn">取消</button>
          </div>
        </div>

        {/* 实时预览 */}
        <div style={{ position: "sticky", top: 0 }}>
          <SectionLabel title="预览 · 学员落地页" />
          <div style={{
            border: "1px solid var(--paper-edge)", borderRadius: 14, overflow: "hidden",
            background: "#fff", aspectRatio: "9 / 16", maxHeight: 480, position: "relative",
          }}>
            <div style={{ padding: "30px 22px 12px", textAlign: "center" }}>
              <XCMark size={48} />
              <div className="tz-serif" style={{ fontSize: 18, fontWeight: 500, marginTop: 10 }}>醒春阁</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
                七天清晨的写作陪跑
              </div>
            </div>
            <div style={{ padding: "0 16px 16px" }}>
              <div className="tz-serif" style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                七天成长计划 · 习作启蒙
              </div>
              <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginBottom: 12 }}>
                8 节 · 62 分钟
              </div>
              {["开篇·一支笔之外", "第一日·见我", "第二日·见物"].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderTop: "1px solid var(--paper-line)" }}>
                  <I.playC size={16} style={{ color: "#1a4d4a" }}/>
                  <span style={{ fontSize: 12 }}>{t}</span>
                </div>
              ))}
              <button style={{
                width: "100%", marginTop: 14, padding: "10px 14px",
                background: "#1a4d4a", color: "#fff", border: 0, borderRadius: 6,
                fontSize: 12, fontWeight: 500,
              }}>加群联系老师</button>
            </div>
          </div>
        </div>
      </div>
    </TZShell>
  );
}

function Field({ label, desc, children }) {
  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

// Input style (defined as global CSS-in-JS via a one-time inject)
if (typeof document !== "undefined" && !document.getElementById("tz-input-style")) {
  const s = document.createElement("style");
  s.id = "tz-input-style";
  s.textContent = `
    .tz-input {
      width: 100%; box-sizing: border-box;
      padding: 9px 12px; font: 500 13px/1.4 var(--sans);
      color: var(--ink);
      background: #fff;
      border: 1px solid var(--paper-edge);
      border-radius: 6px; outline: none;
      transition: border-color .12s, box-shadow .12s;
    }
    .tz-input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { CreatorMembers, CreatorUsage, CreatorSettings });
