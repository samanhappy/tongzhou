// 创作者后台 · Dashboard 页
// 来自 PRD §4.6 + V0 §3.1：用量看板 + 学员观看 + 4 维度计量

function StatCard({ label, value, unit, delta, trend, foot }) {
  return (
    <div className="tz-card" style={{ padding: "16px 18px", flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11.5, color: "var(--ink-3)", letterSpacing: "0.05em" }}>{label}</span>
        {delta && (
          <span style={{
            fontSize: 10.5, color: delta > 0 ? "var(--accent)" : "var(--ink-3)",
            fontVariantNumeric: "tabular-nums",
          }}>{delta > 0 ? "↑" : "↓"} {Math.abs(delta)}%</span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8, marginBottom: 4 }}>
        <span className="tz-serif" style={{ fontSize: 28, fontWeight: 500, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{unit}</span>}
      </div>
      {trend && (
        <div style={{ marginTop: 8, marginBottom: 4, marginLeft: -2 }}>
          <Sparkline values={trend} w={150} h={26} />
        </div>
      )}
      {foot && (
        <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 6 }}>{foot}</div>
      )}
    </div>
  );
}

function QuotaRow({ label, value, max, unit, color }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{label}</span>
        <span style={{ fontSize: 11.5, color: pct > 80 ? "var(--warn)" : "var(--ink-2)", fontVariantNumeric: "tabular-nums" }}>
          <b style={{ color: "var(--ink)", fontWeight: 500 }}>{value}</b> / {max} {unit}
        </span>
      </div>
      <Bar value={value} max={max} color={color} />
    </div>
  );
}

function CreatorDashboard() {
  const watch = [
    { name: "习作十讲 · 第一章", view: 38, mins: 482, complete: 72 },
    { name: "习作十讲 · 第二章", view: 31, mins: 312, complete: 58 },
    { name: "晨课 · 春分", view: 24, mins: 178, complete: 64 },
    { name: "晨课 · 谷雨", view: 19, mins: 142, complete: 52 },
    { name: "夜读 · 蒹葭", view: 12, mins: 88,  complete: 41 },
  ];
  const recent = [
    { who: "李 ·· 茜", what: "看完《晨课 · 春分》", t: "刚刚" },
    { who: "周 ·· 屿", what: "进入《习作十讲》第二章", t: "12 分钟前" },
    { who: "陈 ·· 鹿", what: "绑定了手机号", t: "26 分钟前" },
    { who: "吴 ·· 默", what: "看完《习作十讲》第一章", t: "1 小时前" },
    { who: "苏 ·· 砚", what: "首次进入醒春阁", t: "2 小时前" },
  ];

  return (
    <TZShell active="dashboard" breadcrumb={["醒春阁", "工作台"]} title="今日 · 五月十六"
      actions={
        <button className="tz-btn">
          <I.share size={14}/> 复制本期分享链接
        </button>
      }>

      {/* 顶部 4 维度统计 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 22 }}>
        <StatCard label="月活学员" value="142" unit="人" delta={12}
                  trend={[20, 28, 35, 41, 52, 68, 84, 92, 108, 124, 131, 142]}
                  foot="本月 +18 · 含 7 位绑定手机号" />
        <StatCard label="已发布课程" value="6" unit="门" delta={0}
                  trend={[2,2,3,3,4,4,5,5,5,6,6,6]}
                  foot="2 门草稿中" />
        <StatCard label="累计播放" value="1,284" unit="分钟" delta={24}
                  trend={[40, 60, 80, 120, 180, 240, 320, 420, 580, 740, 980, 1284]}
                  foot="均时长 9.0 分钟 / 次" />
        <StatCard label="视频存储" value="3.8" unit="GB" delta={6}
                  trend={[0.4, 0.8, 1.0, 1.4, 1.8, 2.1, 2.5, 2.8, 3.1, 3.4, 3.6, 3.8]}
                  foot="共 12 个视频 · 平均 320 MB" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        {/* 左：课程观看 */}
        <div className="tz-card" style={{ padding: 20 }}>
          <SectionLabel
            stamp="观"
            title="课程观看 · 近 7 日"
            sub="谁看了什么 · 看了多久"
            right={
              <div style={{ display: "flex", gap: 6, fontSize: 11 }}>
                <span className="tz-chip is-accent">7 日</span>
                <span className="tz-chip">30 日</span>
                <span className="tz-chip">本期</span>
              </div>
            }
          />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ color: "var(--ink-3)", fontSize: 11, fontWeight: 400, textAlign: "left" }}>
                <th style={{ padding: "8px 0", fontWeight: 400, letterSpacing: "0.05em" }}>课时</th>
                <th style={{ padding: "8px 0", fontWeight: 400, width: 80, textAlign: "right" }}>观看人数</th>
                <th style={{ padding: "8px 0", fontWeight: 400, width: 100, textAlign: "right" }}>播放分钟</th>
                <th style={{ padding: "8px 0", fontWeight: 400, width: 140 }}>完播率</th>
              </tr>
            </thead>
            <tbody>
              {watch.map((r, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--paper-line)" }}>
                  <td style={{ padding: "11px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Placeholder w={36} h={22} radius={3} label="" />
                      {r.name}
                    </div>
                  </td>
                  <td style={{ padding: "11px 0", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {r.view}
                  </td>
                  <td style={{ padding: "11px 0", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {r.mins}
                  </td>
                  <td style={{ padding: "11px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1 }}><Bar value={r.complete} /></div>
                      <span style={{ fontSize: 11, color: "var(--ink-2)", fontVariantNumeric: "tabular-nums", width: 28, textAlign: "right" }}>
                        {r.complete}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 右：Quota + 最近活动 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="tz-card" style={{ padding: 18 }}>
            <SectionLabel stamp="量" title="本月 Freemium" sub="距升级还有 18%" />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <QuotaRow label="月活学员"     value={142}  max={200}  unit="人" color="var(--accent)" />
              <QuotaRow label="发布课程"     value={6}    max={10}   unit="门" color="var(--accent)" />
              <QuotaRow label="视频存储"     value={3.8}  max={5}    unit="GB" color="var(--warn)" />
              <QuotaRow label="播放分钟"     value={1284} max={1500} unit="分钟" color="var(--warn)" />
            </div>
            <div style={{
              marginTop: 14, padding: "10px 12px", background: "var(--accent-soft)",
              borderRadius: 6, fontSize: 11.5, color: "var(--accent-deep)",
              display: "flex", alignItems: "flex-start", gap: 8,
            }}>
              <I.info size={13} style={{ marginTop: 1, flex: "0 0 auto" }}/>
              <span><b>播放分钟</b>已用 86%。任何超额仅冻结上传，学员观看不受影响。</span>
            </div>
          </div>

          <div className="tz-card" style={{ padding: 18 }}>
            <SectionLabel stamp="动" title="最近活动" />
            {recent.map((r, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                borderTop: i ? "1px solid var(--paper-line)" : "none",
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 999,
                  background: "var(--paper-deep)", color: "var(--ink-2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--serif)", fontSize: 11.5,
                }}>{r.who[0]}</div>
                <div style={{ flex: 1, fontSize: 12 }}>
                  <div><b style={{ fontWeight: 500 }}>{r.who}</b> · <span style={{ color: "var(--ink-2)" }}>{r.what}</span></div>
                </div>
                <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{r.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TZShell>
  );
}

Object.assign(window, { CreatorDashboard });
