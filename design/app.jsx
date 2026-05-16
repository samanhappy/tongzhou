// 同舟 V0 MVP · 设计入口
// 单文件 design canvas，承载所有变体。

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "hue": 162,
  "density": "regular",
  "serif": true
}/*EDITMODE-END*/;

const HUE_OPTIONS = [
  { id: "ink-green",  hue: 162, label: "墨青",  color: "#1a4d4a" },
  { id: "rouge",      hue: 28,  label: "胭脂",  color: "#7a2e1f" },
  { id: "indigo",     hue: 268, label: "藏蓝",  color: "#1e3a8a" },
  { id: "ink",        hue: 60,  label: "墨",    color: "#0c0c0c", chroma: 0.01 },
  { id: "dan",        hue: 38,  label: "丹",    color: "#c2410c" },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Map hue → accent colors
  const hue = t.hue;
  // For "ink" theme we want low chroma
  const chroma = HUE_OPTIONS.find((o) => o.hue === hue)?.chroma ?? 0.062;

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--hue", hue);
    root.style.setProperty("--accent",      `oklch(0.40 ${chroma} ${hue})`);
    root.style.setProperty("--accent-deep", `oklch(0.30 ${chroma} ${hue})`);
    root.style.setProperty("--accent-soft", `oklch(0.93 ${chroma * 0.35} ${hue})`);
    root.style.setProperty("--accent-ink",  `oklch(0.22 ${chroma * 0.65} ${hue})`);
  }, [hue, chroma]);

  return (
    <>
      <DesignCanvas>
        {/* ──────────────── 0 · 设计假设 ──────────────── */}
        <DCSection id="meta" title="同舟 · V0 MVP 设计 — 实现要点" subtitle="阅读顺序：先看假设，再展开各页面">
          <DCArtboard id="brief" label="设计假设" width={780} height={560}>
            <Brief />
          </DCArtboard>
          <DCArtboard id="system" label="视觉系统" width={780} height={560}>
            <SystemPlate />
          </DCArtboard>
        </DCSection>

        {/* ──────────────── 1 · Onboarding 30 分钟 ──────────────── */}
        <DCSection id="onb" title="① · Onboarding 30 分钟链路" subtitle="V0 DoD：注册 → 上传 → 发布 → 拿到分享链接，≤ 30 min">
          <DCArtboard id="onb-flow" label="5 步串联" width={1820} height={580}>
            <CreatorOnboarding />
          </DCArtboard>
        </DCSection>

        {/* ──────────────── 2 · 学员 H5 ──────────────── */}
        <DCSection id="h5" title="② · 学员 H5 · 醒春阁" subtitle="V0 极简：3 个页面 — 落地页 / 播放页 / 我的">
          <DCArtboard id="h5-landing" label="落地页 · 课程目录" width={420} height={900}>
            <PhoneFrame><H5Landing /></PhoneFrame>
          </DCArtboard>
          <DCArtboard id="h5-player" label="播放页 · 含手机号水印" width={420} height={900}>
            <PhoneFrame><H5Player /></PhoneFrame>
          </DCArtboard>
          <DCArtboard id="h5-me" label="我的 · 访客 / 绑定" width={420} height={900}>
            <PhoneFrame><H5Me /></PhoneFrame>
          </DCArtboard>
        </DCSection>

        {/* ──────────────── 3 · 创作者后台 ──────────────── */}
        <DCSection id="creator" title="③ · 创作者后台" subtitle="多租户 SaaS · 4 维度计量 · Freemium 配额">
          <DCArtboard id="dashboard" label="工作台 · 数据看板" width={1320} height={860}>
            <CreatorDashboard />
          </DCArtboard>
          <DCArtboard id="course-edit" label="课程编辑 · 课时拖拽 + 上传中" width={1320} height={1000}>
            <CreatorCourseEdit />
          </DCArtboard>
          <DCArtboard id="usage" label="用量计费 · 四维度 + 降级路径" width={1320} height={1080}>
            <CreatorUsage />
          </DCArtboard>
          <DCArtboard id="members" label="学员名单 · CSV / 单加 / 短链" width={1320} height={860}>
            <CreatorMembers />
          </DCArtboard>
          <DCArtboard id="settings" label="设置 · 品牌 + 子域名" width={1320} height={900}>
            <CreatorSettings />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      {/* ────── Tweaks ────── */}
      <TweaksPanel>
        <TweakSection label="主题色（品牌 → 学员 H5）" />
        <TweakColor
          label="品牌色"
          value={HUE_OPTIONS.find((o) => o.hue === hue)?.color || "#1a4d4a"}
          options={HUE_OPTIONS.map((o) => o.color)}
          onChange={(c) => {
            const o = HUE_OPTIONS.find((x) => x.color === c);
            if (o) setTweak("hue", o.hue);
          }}
        />
        <div style={{ fontSize: 10.5, color: "var(--ink-3)", padding: "0 4px 8px" }}>
          切换创作者品牌色 — 同时驱动后台重点色与学员 H5 主按钮
        </div>

        <TweakSection label="字体" />
        <TweakToggle
          label="衬线标题（书卷感）"
          value={t.serif}
          onChange={(v) => setTweak("serif", v)}
        />

        <TweakSection label="信息密度" />
        <TweakRadio
          label="密度"
          value={t.density}
          options={["compact", "regular", "comfy"]}
          onChange={(v) => setTweak("density", v)}
        />
      </TweaksPanel>
    </>
  );
}

// 应用 serif/density 到全局
function ApplyGlobals() {
  const [t] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => {
    const r = document.documentElement;
    // Serif toggle: when off, fall back to sans for headlines
    document.querySelectorAll(".tz-serif").forEach((el) => {
      el.style.fontFamily = t.serif ? "var(--serif)" : "var(--sans)";
      el.style.letterSpacing = t.serif ? "" : "-0.01em";
    });
    // Density – just a marker class on body
    r.dataset.density = t.density;
  }, [t.serif, t.density]);
  return null;
}

// 简易手机外框（避免依赖 IOSDevice 复杂度，自绘）
function PhoneFrame({ children }) {
  return (
    <div style={{
      width: 390, height: 844, margin: "0 auto",
      borderRadius: 44, overflow: "hidden",
      background: "#000", padding: 10,
      boxShadow: "0 30px 60px -20px rgba(40,30,20,0.25), 0 0 0 1px rgba(40,30,20,0.15)",
      position: "relative",
    }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: 34, overflow: "auto",
        background: "var(--paper)", position: "relative",
      }}>
        {/* 状态栏 */}
        <div style={{
          height: 44, padding: "0 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontFamily: "system-ui", fontWeight: 600, fontSize: 14,
          color: "var(--ink)",
          position: "sticky", top: 0, zIndex: 10,
          background: "var(--paper)",
        }}>
          <span>9:41</span>
          <div style={{
            width: 100, height: 28, borderRadius: 999, background: "#000",
            position: "absolute", left: "50%", top: 10, transform: "translateX(-50%)",
          }}/>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="0.5" fill="currentColor"/><rect x="4.5" y="5" width="3" height="6" rx="0.5" fill="currentColor"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5" fill="currentColor"/><rect x="13.5" y="0" width="3" height="11" rx="0.5" fill="currentColor"/></svg>
            <svg width="25" height="11" viewBox="0 0 25 11"><rect x="0.5" y="0.5" width="21" height="10" rx="2.5" stroke="currentColor" fill="none"/><rect x="2" y="2" width="18" height="7" rx="1.5" fill="currentColor"/></svg>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// 设计假设
function Brief() {
  return (
    <div className="tz tz-paper" style={{ height: "100%", padding: "32px 36px", overflow: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
        <TZMark size={40}/>
        <div>
          <h1 className="tz-serif" style={{ margin: 0, fontSize: 26, fontWeight: 500 }}>同舟 · V0 MVP</h1>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4, letterSpacing: "0.1em" }}>
            轻量化课程交付 SaaS · 4 周交付 · Freemium + 按量计费
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <div>
          <Heading>取舍假设</Heading>
          <P><b>砍掉</b>装修 / 商城 / 营销 / 多售卖玩法；<b>留下</b>「上传视频 → 学员看视频」主链路 + 4 维度计量 + Freemium 降级。</P>
          <P><b>V0 学员端 = 3 个页面</b>，不是 4 Tab：落地页 · 播放页 · 我的（可选绑定）。班级 / 作业 / 签到推到 V1。</P>
          <P><b>红线：</b>学员看视频不被中断 — 即使创作者超额，已发布内容也将持续可播（与小鹅通差异化）。</P>
        </div>
        <div>
          <Heading>视觉与气质</Heading>
          <P>面向<b>独立创作者</b>（知识 IP、教练、咨询师）— 气质介于<b>工具理性</b>与<b>人文温度</b>之间。</P>
          <P>主题：<b>温润书卷 · 墨青</b> — 暖白纸 + 浓淡墨 + 极小面积印泥红。衬线题 + 无衬线正文。</P>
          <P>演示创作者：<b>醒春阁 · 七天成长计划</b> — 文学/晨课气质，与"同舟·一艘船"的隐喻呼应。</P>
        </div>
        <div>
          <Heading>本轮覆盖</Heading>
          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.9 }}>
            <li>Onboarding 30 分钟链路 · 5 屏串联</li>
            <li>学员 H5：落地页 / 播放页（含手机号水印）/ 我的</li>
            <li>创作者后台：Dashboard / 课程编辑 / 用量计费 / 学员 / 设置</li>
            <li>Tweaks：主题色、衬线标题、信息密度</li>
          </ul>
        </div>
        <div>
          <Heading>下一步</Heading>
          <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.9 }}>
            <li>V0.5：公众号 OAuth2 + 订阅消息 + 第三方付费 Webhook</li>
            <li>V1：Stage 分组 + 作业 + 签到 + 班级 + AI 反馈</li>
            <li>从开放问题 Q1-Q2 落定 Freemium 阈值 + 按量单价</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Heading({ children }) {
  return (
    <div style={{
      fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.18em",
      textTransform: "uppercase", marginBottom: 10,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ width: 16, height: 1, background: "var(--ink-4)" }}/>
      {children}
    </div>
  );
}
function P({ children }) {
  return <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.7 }}>{children}</p>;
}

// 视觉系统板
function SystemPlate() {
  return (
    <div className="tz tz-paper" style={{ height: "100%", padding: 28, overflow: "auto" }}>
      <h2 className="tz-serif" style={{ margin: "0 0 18px", fontSize: 18, fontWeight: 500 }}>视觉系统</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 22 }}>
        <div>
          <Heading>纸 · 墨</Heading>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[
              ["#faf8f3", "paper"],
              ["#f3f0e9", "paper-deep"],
              ["#e8e4dc", "edge"],
              ["#222018", "ink"],
              ["#69655c", "ink-2"],
            ].map(([c, l]) => (
              <div key={c} style={{ flex: 1 }}>
                <div style={{ height: 56, borderRadius: 6, background: c, border: "1px solid var(--paper-edge)" }}/>
                <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4, fontFamily: "var(--mono)" }}>{l}</div>
                <div style={{ fontSize: 9, color: "var(--ink-4)", fontFamily: "var(--mono)" }}>{c}</div>
              </div>
            ))}
          </div>

          <Heading>重点 · 印</Heading>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            <SwatchCol c="var(--accent)" l="accent" />
            <SwatchCol c="var(--accent-deep)" l="accent-deep" />
            <SwatchCol c="var(--accent-soft)" l="accent-soft" />
            <SwatchCol c="var(--accent-ink)" l="accent-ink" />
            <SwatchCol c="var(--seal)" l="seal" />
          </div>
        </div>

        <div>
          <Heading>字</Heading>
          <div className="tz-serif" style={{ fontSize: 28, lineHeight: 1.2, marginBottom: 4 }}>同舟 · 一艘船</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--mono)", marginBottom: 14 }}>Noto Serif SC · 500</div>
          <div className="tz-serif" style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>七天成长计划 · 习作启蒙</div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontFamily: "var(--mono)", marginBottom: 14 }}>题头 18 / 500</div>
          <div style={{ fontSize: 13, color: "var(--ink)", marginBottom: 3 }}>正文 — 在七个清晨，从「见我」走到「见今」。</div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontFamily: "var(--mono)", marginBottom: 12 }}>Inter / PingFang · 400</div>
          <div className="tz-mono" style={{ fontSize: 11, color: "var(--ink-2)", letterSpacing: "0.04em" }}>SF Mono · 1,284 min · 86%</div>

          <Heading style={{ marginTop: 14 }}>原子</Heading>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
            <button className="tz-btn tz-btn-primary">主按钮</button>
            <button className="tz-btn">次按钮</button>
            <button className="tz-btn tz-btn-accent">强调</button>
            <span className="tz-chip is-accent">已发布</span>
            <span className="tz-chip is-seal">本期</span>
            <span className="tz-stamp">舟</span>
          </div>
        </div>
      </div>
    </div>
  );
}
function SwatchCol({ c, l }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ height: 56, borderRadius: 6, background: c, border: "1px solid var(--paper-edge)" }}/>
      <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4, fontFamily: "var(--mono)" }}>{l}</div>
    </div>
  );
}

// 挂载
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<><App /><ApplyGlobals /></>);
