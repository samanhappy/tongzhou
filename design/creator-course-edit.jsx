// 创作者后台 · 课程编辑页（含课时拖拽排序 + 正在上传）
// 来自 V0 §3.1：课程 + 课时（极简）；视频 OSS 直传 + VOD 转码；防盗链 + 水印

function LessonRow({ idx, item, dragging, dropTarget, onDragStart, onDragOver, onDrop }) {
  const status = item.status; // published | draft | uploading | transcoding | failed
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, idx)}
      onDragOver={(e) => onDragOver && onDragOver(e, idx)}
      onDrop={(e) => onDrop && onDrop(e, idx)}
      style={{
        display: "grid",
        gridTemplateColumns: "20px 64px 1fr 90px 140px 60px",
        gap: 14, alignItems: "center",
        padding: "12px 14px",
        background: dragging ? "#fff" : (dropTarget ? "var(--accent-soft)" : "#fff"),
        border: dropTarget ? "1px dashed var(--accent)" : "1px solid var(--paper-edge)",
        borderRadius: 8,
        marginBottom: 8,
        opacity: dragging ? 0.5 : 1,
        cursor: "default",
        transition: "background .12s",
      }}
    >
      <span style={{ color: "var(--ink-4)", cursor: "grab", display: "flex", justifyContent: "center" }}>
        <I.grip size={16} />
      </span>
      <div style={{ position: "relative" }}>
        <Placeholder w={64} h={40} radius={4} label="" />
        {status === "uploading" || status === "transcoding" ? (
          <div style={{
            position: "absolute", inset: 0, borderRadius: 4,
            background: "rgba(20,18,15,0.65)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
          }}>
            <I.upload size={12} />
          </div>
        ) : status === "draft" ? (
          <div style={{
            position: "absolute", inset: 0, borderRadius: 4,
            background: "rgba(20,18,15,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 9, letterSpacing: "0.1em",
          }}>未发布</div>
        ) : (
          <div style={{
            position: "absolute", left: 4, bottom: 3, padding: "1px 4px", borderRadius: 2,
            background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 9,
            fontFamily: "var(--mono)", lineHeight: 1.2,
          }}>{item.dur}</div>
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 2, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--ink-3)" }}>
            {String(idx + 1).padStart(2, "0")}
          </span>
          {item.title}
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.summary}
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--ink-2)", fontVariantNumeric: "tabular-nums" }}>
        {status === "published" ? `观看 ${item.views}` : "—"}
      </div>
      <div>
        {status === "published" && <span className="tz-chip is-accent"><I.check size={10}/> 已发布</span>}
        {status === "draft"     && <span className="tz-chip">草稿</span>}
        {status === "uploading" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 10.5, color: "var(--accent-deep)", fontVariantNumeric: "tabular-nums" }}>
              上传中 · {item.progress}%
            </span>
            <Bar value={item.progress} height={4} />
          </div>
        )}
        {status === "transcoding" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 10.5, color: "var(--warn)", fontVariantNumeric: "tabular-nums" }}>
              转码中 · {item.progress}%
            </span>
            <Bar value={item.progress} height={4} color="var(--warn)" />
          </div>
        )}
        {status === "failed" && <span className="tz-chip" style={{ color: "var(--danger)", background: "color-mix(in oklch, var(--danger) 10%, #fff)" }}>转码失败</span>}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 2, color: "var(--ink-3)" }}>
        <button className="tz-btn tz-btn-ghost" style={{ padding: 6 }}><I.edit size={13}/></button>
        <button className="tz-btn tz-btn-ghost" style={{ padding: 6 }}><I.trash size={13}/></button>
      </div>
    </div>
  );
}

function CreatorCourseEdit() {
  // Hooks
  const [items, setItems] = React.useState([
    { id: "s1", title: "开篇·一支笔之外", summary: "写作不是技巧，是看世界的方式。", dur: "08:24", status: "published", views: 38 },
    { id: "s2", title: "第一日·见我",   summary: "从一个清晨开始，把第一念落到纸上。", dur: "09:12", status: "published", views: 31 },
    { id: "s3", title: "第二日·见物",   summary: "练习观察一件物，把它写成一篇 300 字短札。", dur: "11:02", status: "published", views: 24 },
    { id: "s4", title: "第三日·见人",   summary: "把今日遇到的一个人写下来——不评价，只描述。", dur: "—",     status: "uploading",   progress: 64 },
    { id: "s5", title: "第四日·见事",   summary: "今日的一件事，从五个角度复写。", dur: "—",     status: "transcoding", progress: 38 },
    { id: "s6", title: "第五日·见念",   summary: "心里冒出来的一念，捕住它，落墨。", dur: "10:30", status: "draft", views: 0 },
    { id: "s7", title: "第六日·见旧",   summary: "重读一年前的自己——只写感受，不改。", dur: "—",     status: "failed" },
    { id: "s8", title: "第七日·见今",   summary: "把这七日写成一封给自己的信。", dur: "12:45", status: "draft", views: 0 },
  ]);
  const [dragIdx, setDragIdx] = React.useState(null);
  const [overIdx, setOverIdx] = React.useState(null);

  const onDragStart = (e, i) => { setDragIdx(i); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver  = (e, i) => { e.preventDefault(); setOverIdx(i); };
  const onDrop      = (e, i) => {
    e.preventDefault();
    if (dragIdx == null || dragIdx === i) return;
    const next = [...items];
    const [m] = next.splice(dragIdx, 1);
    next.splice(i, 0, m);
    setItems(next);
    setDragIdx(null); setOverIdx(null);
  };

  // Simulate progress
  React.useEffect(() => {
    const id = setInterval(() => {
      setItems((arr) => arr.map((it) => {
        if (it.status === "uploading"   && it.progress < 100) return { ...it, progress: Math.min(100, it.progress + 1.2) };
        if (it.status === "transcoding" && it.progress < 100) return { ...it, progress: Math.min(100, it.progress + 0.4) };
        return it;
      }));
    }, 220);
    return () => clearInterval(id);
  }, []);

  return (
    <TZShell active="tracks"
      breadcrumb={["醒春阁", "课程", "七天成长计划 · 习作启蒙"]}
      title="七天成长计划 · 习作启蒙"
      actions={
        <>
          <button className="tz-btn"><I.share size={14}/> 分享</button>
          <button className="tz-btn tz-btn-primary"><I.check size={14}/> 发布修改</button>
        </>
      }>

      {/* 子导航 */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--paper-line)", marginBottom: 22, marginTop: -10 }}>
        {[
          { k: "overview", l: "概览" },
          { k: "sessions", l: "课时", active: true },
          { k: "enroll",   l: "报名" },
          { k: "settings", l: "设置" },
        ].map((t) => (
          <button key={t.k} className="tz-btn tz-btn-ghost" style={{
            borderRadius: 0, padding: "8px 12px",
            color: t.active ? "var(--ink)" : "var(--ink-3)",
            borderBottom: t.active ? "2px solid var(--accent)" : "2px solid transparent",
            marginBottom: -1, fontWeight: t.active ? 500 : 400,
          }}>{t.l}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        {/* 主：课时列表 */}
        <div>
          {/* 概览条 */}
          <div style={{
            display: "flex", alignItems: "stretch", gap: 14, marginBottom: 18,
            padding: 16, background: "#fff", border: "1px solid var(--paper-edge)", borderRadius: 10,
          }}>
            <Placeholder w={88} h={88} radius={6} label="课程封面" />
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <h2 className="tz-serif" style={{ margin: 0, fontSize: 19, fontWeight: 500 }}>七天成长计划 · 习作启蒙</h2>
                  <span className="tz-chip is-accent">已发布</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "var(--ink-2)", maxWidth: 540 }}>
                  在七个清晨，从「见我」走到「见今」。每日 10 分钟，写一张札。
                </p>
              </div>
              <div style={{ display: "flex", gap: 22, fontSize: 11.5 }}>
                <span><b style={{ fontVariantNumeric: "tabular-nums" }}>8</b> <span style={{ color: "var(--ink-3)" }}>课时</span></span>
                <span><b style={{ fontVariantNumeric: "tabular-nums" }}>62 min</b> <span style={{ color: "var(--ink-3)" }}>总时长</span></span>
                <span><b style={{ fontVariantNumeric: "tabular-nums" }}>96</b> <span style={{ color: "var(--ink-3)" }}>累计观看人</span></span>
                <span><b style={{ fontVariantNumeric: "tabular-nums" }}>54%</b> <span style={{ color: "var(--ink-3)" }}>完播率</span></span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button className="tz-btn"><I.qr size={13}/> 海报二维码</button>
              <button className="tz-btn"><I.copy size={13}/> 复制链接</button>
            </div>
          </div>

          {/* 课时列表 + 上传区 */}
          <SectionLabel stamp="时" title="课时" sub={`共 ${items.length} 节 · 拖拽调整顺序`} right={
            <button className="tz-btn"><I.plus size={13}/> 新增课时</button>
          } />

          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "20px 64px 1fr 90px 140px 60px",
            gap: 14, padding: "0 14px 6px",
            fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.08em",
          }}>
            <span></span>
            <span>视频</span>
            <span>标题 / 简介</span>
            <span style={{ textAlign: "right" }}>观看</span>
            <span>状态</span>
            <span></span>
          </div>

          {items.map((it, i) => (
            <LessonRow key={it.id} idx={i} item={it}
              dragging={dragIdx === i}
              dropTarget={overIdx === i && dragIdx !== null && dragIdx !== i}
              onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} />
          ))}

          {/* Drop zone — 大文件直传 */}
          <div style={{
            marginTop: 6, padding: "20px 16px",
            border: "1.5px dashed var(--paper-edge)", borderRadius: 8,
            background: "var(--paper-deep)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            color: "var(--ink-2)", fontSize: 12.5,
          }}>
            <I.upload size={16} style={{ color: "var(--accent)" }} />
            <span>把视频拖到这里上传 · 单文件 ≤ 2 GB · OSS 直传</span>
            <span style={{ color: "var(--ink-4)" }}>—</span>
            <button className="tz-btn" style={{ padding: "5px 10px", fontSize: 12 }}>选择文件</button>
          </div>
        </div>

        {/* 侧栏：上传队列 + 防盗链 + 水印 */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="tz-card" style={{ padding: 14 }}>
            <SectionLabel title="上传队列" sub="2 进行中" />
            <UploadRow name="第三日·见人.mp4" size="412 MB" prog={64} phase="uploading" eta="2 min 余" />
            <UploadRow name="第四日·见事.mp4" size="528 MB" prog={38} phase="transcoding" eta="转码 · 约 3 min" />
            <UploadRow name="第六日·见旧.mp4" size="—"      prog={100} phase="failed" eta="编码不兼容" />
          </div>

          <div className="tz-card" style={{ padding: 14 }}>
            <SectionLabel title="播放保护" />
            <Toggle label="限时 playAuth" desc="链接 6 小时失效" on />
            <Toggle label="学员手机号水印" desc="斜向 22°, 自动平铺" on />
            <Toggle label="禁右键 / 选择" desc="对常见盗录有限作用" on={false} />
            <div style={{ marginTop: 8, paddingTop: 10, borderTop: "1px solid var(--paper-line)",
                          fontSize: 11, color: "var(--ink-3)" }}>
              已对接 <b style={{ color: "var(--ink-2)" }}>阿里云 VOD</b> · 1080p 转码 · 边播边转
            </div>
          </div>

          <div className="tz-card" style={{ padding: 14, background: "var(--accent-soft)", border: "1px solid color-mix(in oklch, var(--accent) 20%, transparent)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, color: "var(--accent-deep)", fontSize: 11.5 }}>
              <I.sparkle size={14} style={{ marginTop: 1, flex: "0 0 auto" }}/>
              <div>
                <b>V0 简化：</b> 课时直挂在课程下；
                到 V1 会启用「成长路径 · Stage」分组，已上传内容会自动归入"未分组"，无需迁移。
              </div>
            </div>
          </div>
        </aside>
      </div>
    </TZShell>
  );
}

function UploadRow({ name, size, prog, phase, eta }) {
  const color = phase === "failed" ? "var(--danger)" : (phase === "transcoding" ? "var(--warn)" : "var(--accent)");
  return (
    <div style={{ padding: "10px 0", borderTop: "1px solid var(--paper-line)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <I.video size={13} style={{ color: "var(--ink-3)" }}/>
        <span style={{ fontSize: 12, fontWeight: 500, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </span>
        <span style={{ fontSize: 10.5, color: "var(--ink-3)", fontVariantNumeric: "tabular-nums" }}>{size}</span>
      </div>
      <div style={{ marginTop: 7 }}>
        <Bar value={prog} color={color} />
      </div>
      <div style={{ marginTop: 5, display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--ink-3)" }}>
        <span style={{ color }}>
          {phase === "uploading" && `上传中 · ${Math.round(prog)}%`}
          {phase === "transcoding" && `转码中 · ${Math.round(prog)}%`}
          {phase === "failed" && `失败 · 编码不兼容`}
        </span>
        <span>{eta}</span>
      </div>
    </div>
  );
}

function Toggle({ label, desc, on }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 0", borderTop: "1px solid var(--paper-line)" }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 1 }}>{desc}</div>
      </div>
      <div style={{
        width: 30, height: 17, borderRadius: 999, padding: 2,
        background: on ? "var(--accent)" : "var(--ink-4)",
        display: "flex", alignItems: "center", justifyContent: on ? "flex-end" : "flex-start",
        transition: "background .15s",
      }}>
        <div style={{ width: 13, height: 13, borderRadius: 999, background: "#fff" }} />
      </div>
    </div>
  );
}

Object.assign(window, { CreatorCourseEdit });
