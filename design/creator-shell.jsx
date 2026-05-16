// 创作者后台 · 通用 Shell（侧栏 + 顶栏 + 主内容）
// 信息架构来自 01-信息架构.md §2

const TZ_NAV = [
  { group: "工作台", items: [
    { id: "dashboard", label: "数据看板", icon: I.home, path: "/dashboard" },
  ]},
  { group: "交付", items: [
    { id: "tracks",    label: "课程",    icon: I.course,  path: "/tracks",  count: 3 },
    { id: "library",   label: "内容库",  icon: I.library, path: "/library" },
  ]},
  { group: "运营", items: [
    { id: "members",   label: "学员",    icon: I.member,  path: "/members", count: 142 },
    { id: "usage",     label: "用量计费", icon: I.usage,   path: "/usage", badge: "82%" },
  ]},
  { group: "系统", items: [
    { id: "settings",  label: "设置",    icon: I.cog,     path: "/settings" },
  ]},
];

function TZSidebar({ active = "dashboard" }) {
  return (
    <aside style={{
      width: 220, flex: "0 0 220px",
      background: "var(--paper-deep)",
      borderRight: "1px solid var(--paper-edge)",
      padding: "18px 14px",
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 18px" }}>
        <TZMark size={28} />
        <div>
          <div className="tz-serif" style={{ fontSize: 17, fontWeight: 500, letterSpacing: "0.04em" }}>同舟</div>
          <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 1, letterSpacing: "0.1em" }}>TONGZHOU</div>
        </div>
      </div>

      {/* Tenant switcher */}
      <button style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 8px",
        background: "#fff", border: "1px solid var(--paper-edge)", borderRadius: 6,
        cursor: "pointer", marginBottom: 12, textAlign: "left",
      }}>
        <XCMark size={20} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.2 }}>醒春阁</div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 1 }}>xingchunge.tongzhou.app</div>
        </div>
        <I.chevD size={12} style={{ color: "var(--ink-3)" }} />
      </button>

      {TZ_NAV.map((g) => (
        <div key={g.group} style={{ marginTop: 14 }}>
          <div style={{
            fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.18em",
            padding: "0 8px 8px", textTransform: "uppercase",
          }}>{g.group}</div>
          {g.items.map((it) => {
            const isActive = it.id === active;
            const Icn = it.icon;
            return (
              <div key={it.id} style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "7px 8px", borderRadius: 5,
                background: isActive ? "#fff" : "transparent",
                color: isActive ? "var(--ink)" : "var(--ink-2)",
                boxShadow: isActive ? "0 1px 0 var(--paper-edge), 0 1px 2px rgba(60,50,30,.05)" : "none",
                fontSize: 13, fontWeight: isActive ? 500 : 400,
                cursor: "pointer", position: "relative",
              }}>
                {isActive && <span style={{
                  position: "absolute", left: -14, top: 8, bottom: 8, width: 2,
                  background: "var(--accent)", borderRadius: 2,
                }} />}
                <Icn size={15} style={{ color: isActive ? "var(--accent)" : "var(--ink-3)" }} />
                <span style={{ flex: 1 }}>{it.label}</span>
                {it.count != null && (
                  <span style={{ fontSize: 10.5, color: "var(--ink-3)", fontVariantNumeric: "tabular-nums" }}>
                    {it.count}
                  </span>
                )}
                {it.badge && (
                  <span style={{
                    fontSize: 9.5, padding: "1px 5px", borderRadius: 999,
                    background: "var(--accent-soft)", color: "var(--accent-deep)",
                    fontWeight: 600, fontVariantNumeric: "tabular-nums",
                  }}>{it.badge}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <div style={{ flex: 1 }} />

      {/* Plan card */}
      <div style={{
        background: "#fff", border: "1px solid var(--paper-edge)", borderRadius: 8,
        padding: 12, fontSize: 11.5,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.05em" }}>当前方案</span>
          <span className="tz-chip">FREE</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-2)", marginBottom: 8 }}>
          本月用量 <b style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>82%</b>
        </div>
        <Bar value={82} />
        <button className="tz-btn tz-btn-primary" style={{ width: "100%", marginTop: 10, fontSize: 12, padding: "7px 10px", justifyContent: "center" }}>
          查看升级方案
        </button>
      </div>
    </aside>
  );
}

function TZTopbar({ title, breadcrumb, actions }) {
  return (
    <div style={{
      height: 56, flex: "0 0 56px",
      padding: "0 28px",
      borderBottom: "1px solid var(--paper-edge)",
      background: "rgba(250,249,247,0.8)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {breadcrumb && (
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 1 }}>
            {breadcrumb.map((b, i) => (
              <span key={i}>
                {i > 0 && <span style={{ margin: "0 6px", opacity: 0.5 }}>/</span>}
                {b}
              </span>
            ))}
          </div>
        )}
        <h1 className="tz-serif" style={{ margin: 0, fontSize: 17, fontWeight: 500 }}>{title}</h1>
      </div>
      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "var(--paper-deep)", border: "1px solid var(--paper-edge)",
        borderRadius: 6, padding: "5px 10px", width: 220, color: "var(--ink-3)", fontSize: 12,
      }}>
        <I.search size={13} />
        <span style={{ flex: 1 }}>搜索学员、课程…</span>
        <span className="tz-mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>⌘K</span>
      </div>
      {actions}
      <div style={{ position: "relative" }}>
        <I.bell size={17} style={{ color: "var(--ink-2)" }} />
        <span style={{
          position: "absolute", top: -2, right: -2, width: 6, height: 6,
          borderRadius: 999, background: "var(--seal)",
        }}/>
      </div>
      <div style={{
        width: 28, height: 28, borderRadius: 999, background: "var(--accent-ink)",
        color: "#fff", fontFamily: "var(--serif)", fontWeight: 500,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
      }}>春</div>
    </div>
  );
}

function TZShell({ active, title, breadcrumb, actions, children, contentBg }) {
  return (
    <div className="tz tz-paper" style={{
      width: "100%", height: "100%", display: "flex",
      fontFamily: "var(--sans)", color: "var(--ink)",
    }}>
      <TZSidebar active={active} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TZTopbar title={title} breadcrumb={breadcrumb} actions={actions} />
        <div style={{
          flex: 1, overflow: "auto",
          background: contentBg || "transparent",
          padding: "26px 32px 40px",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TZShell, TZSidebar, TZTopbar, TZ_NAV });
