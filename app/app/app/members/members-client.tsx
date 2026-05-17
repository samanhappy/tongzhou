"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/components/auth-session-context";
import { I } from "@/components/icons";
import { Bar } from "@/components/primitives";
import { createMember, importMembersCsv } from "@/lib/creator-client";

type MemberRow = {
  id: string;
  name: string;
  phone: string;
  source: string;
  joinedAt: string;
  courseCount: number;
  playbackMinutes: number;
  lastActive: string;
  bound: boolean;
  anonymous: boolean;
};

function shortDate() {
  const date = new Date();
  return `${date.getMonth() + 1}/${String(date.getDate()).padStart(2, "0")}`;
}

export function MembersClient({
  initialMembers,
  activeCount,
  quotaMax,
}: {
  initialMembers: MemberRow[];
  activeCount: number;
  quotaMax: number;
}) {
  const router = useRouter();
  const { apiBase, session } = useAuthSession();
  const [members, setMembers] = useState<MemberRow[]>(initialMembers);
  const [keyword, setKeyword] = useState("");
  const [panel, setPanel] = useState<null | "add" | "import">(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("单加");
  const [csv, setCsv] = useState("李清,13800000001\n周舟,13800000002");
  const [csvSource, setCsvSource] = useState("CSV · 知识星球");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pct = quotaMax > 0 ? Math.round((activeCount / quotaMax) * 100) : 0;
  const filtered = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    if (!needle) return members;
    return members.filter((member) =>
      [member.name, member.phone, member.source].some((field) =>
        field.toLowerCase().includes(needle),
      ),
    );
  }, [keyword, members]);

  async function handleAddMember() {
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (!name.trim() && !phone.trim()) {
        throw new Error("姓名和手机号至少填写一个。");
      }

      if (!apiBase) {
        setMembers((current) => [
          {
            id: `mock-${Date.now()}`,
            name: name.trim() || "—",
            phone: phone.trim() || "—",
            source,
            joinedAt: shortDate(),
            courseCount: 0,
            playbackMinutes: 0,
            lastActive: "刚创建",
            bound: !!phone.trim(),
            anonymous: false,
          },
          ...current,
        ]);
        setNotice("离线演示模式：已在当前页面里新增一位学员。");
      } else {
        const { member } = await createMember(apiBase, {
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          source,
        });
        setMembers((current) => [
          {
            id: member.id,
            name: member.name,
            phone: member.phone,
            source: member.source,
            joinedAt: member.joined_at,
            courseCount: member.course_count,
            playbackMinutes: member.playback_minutes,
            lastActive: member.last_active || "刚创建",
            bound: !!member.bound,
            anonymous: !!member.anonymous,
          },
          ...current,
        ]);
        setNotice("学员已创建。");
      }

      setName("");
      setPhone("");
      setPanel(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "新增失败，请稍后再试。");
    } finally {
      setBusy(false);
    }
  }

  async function handleImportMembers() {
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const trimmed = csv.trim();
      if (!trimmed) throw new Error("请粘贴 CSV 内容。");

      if (!apiBase) {
        const rows = trimmed
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line, index) => {
            const [rawName, rawPhone] = line.split(",");
            return {
              id: `mock-import-${Date.now()}-${index}`,
              name: rawName?.trim() || "—",
              phone: rawPhone?.trim() || "—",
              source: csvSource,
              joinedAt: shortDate(),
              courseCount: 0,
              playbackMinutes: 0,
              lastActive: "刚导入",
              bound: !!rawPhone?.trim(),
              anonymous: false,
            } satisfies MemberRow;
          });
        setMembers((current) => [...rows.reverse(), ...current]);
        setNotice(`离线演示模式：已临时导入 ${rows.length} 位学员。`);
      } else {
        const { imported } = await importMembersCsv(apiBase, { csv: trimmed, source: csvSource });
        setNotice(`已导入 ${imported} 位学员。`);
        router.refresh();
      }

      setPanel(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "导入失败，请稍后再试。");
    } finally {
      setBusy(false);
    }
  }

  async function copyInviteLink() {
    const slug = session?.tenant.slug ?? "xingchunge";
    const inviteUrl = `${window.location.origin}/x/${slug}`;
    await navigator.clipboard.writeText(inviteUrl);
    setNotice("分享链接已复制，可以直接发给你的第一批学员。");
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 18,
          padding: "12px 16px",
          background: "#fff",
          border: "1px solid var(--paper-edge)",
          borderRadius: 8,
        }}
      >
        <I.member size={18} style={{ color: "var(--accent)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5 }}>
            <b style={{ fontVariantNumeric: "tabular-nums" }}>{activeCount}</b> 位本月活跃 ·
            <span style={{ color: "var(--ink-3)" }}> 计入 Freemium 配额 </span>
            <b style={{ fontVariantNumeric: "tabular-nums" }}>{quotaMax}</b>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 2 }}>
            学员在本月内有任意访问即视为活跃 · 月底清零
          </div>
        </div>
        <div style={{ width: 220 }}>
          <Bar value={activeCount} max={quotaMax} />
        </div>
        <span
          style={{
            fontSize: 11.5,
            color: "var(--ink-2)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {pct}%
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button className="tz-btn" type="button" onClick={() => setPanel(panel === "import" ? null : "import")}>
          <I.csv size={14} /> CSV 导入
        </button>
        <button className="tz-btn" type="button" onClick={copyInviteLink}>
          <I.link size={14} /> 邀请短链
        </button>
        <button
          className="tz-btn tz-btn-primary"
          type="button"
          onClick={() => setPanel(panel === "add" ? null : "add")}
        >
          <I.plus size={14} /> 单个添加
        </button>
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#fff",
            border: "1px solid var(--paper-edge)",
            borderRadius: 6,
            padding: "6px 10px",
            flex: "0 0 240px",
            fontSize: 12,
          }}
        >
          <I.search size={13} style={{ color: "var(--ink-3)" }} />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索姓名 / 手机号 / 来源"
            style={{
              border: 0,
              outline: 0,
              background: "transparent",
              flex: 1,
              fontSize: 12,
              color: "var(--ink)",
            }}
          />
        </div>
      </div>

      {panel === "add" && (
        <div className="tz-card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
            <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
              姓名
              <input className="tz-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：李清" />
            </label>
            <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
              手机号
              <input className="tz-input" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="可选" />
            </label>
            <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
              来源
              <input className="tz-input" value={source} onChange={(event) => setSource(event.target.value)} />
            </label>
            <button className="tz-btn tz-btn-primary" type="button" onClick={handleAddMember} disabled={busy}>
              {busy ? "保存中…" : "保存"}
            </button>
          </div>
        </div>
      )}

      {panel === "import" && (
        <div className="tz-card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
              导入来源
              <input className="tz-input" value={csvSource} onChange={(event) => setCsvSource(event.target.value)} />
            </label>
            <label style={{ fontSize: 11, color: "var(--ink-3)" }}>
              CSV 内容（每行：姓名,手机号）
              <textarea
                value={csv}
                onChange={(event) => setCsv(event.target.value)}
                rows={6}
                className="tz-input"
                style={{ lineHeight: 1.6, resize: "vertical" }}
              />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="tz-btn tz-btn-primary" type="button" onClick={handleImportMembers} disabled={busy}>
                {busy ? "导入中…" : "开始导入"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="tz-card" style={{ padding: 12, marginBottom: 12, color: "var(--danger)" }}>
          {error}
        </div>
      )}
      {notice && (
        <div className="tz-card" style={{ padding: 12, marginBottom: 12, color: "var(--accent-deep)" }}>
          {notice}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <button className="tz-btn">
          <I.filter size={13} /> 来源
        </button>
        <button className="tz-btn">
          <I.filter size={13} /> 已绑定
        </button>
        <button className="tz-btn">
          <I.filter size={13} /> 课程
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>共 {filtered.length} 位</span>
      </div>

      <div className="tz-card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr
              style={{
                background: "var(--paper-deep)",
                color: "var(--ink-3)",
                fontSize: 10.5,
                letterSpacing: "0.05em",
              }}
            >
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "var(--ink-3)", fontSize: 12 }}>
                  暂无学员 — 用 CSV 导入或单个添加
                </td>
              </tr>
            ) : (
              filtered.map((member) => (
                <tr key={member.id} style={{ borderTop: "1px solid var(--paper-line)" }}>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 999,
                          flex: "0 0 auto",
                          background: member.anonymous ? "var(--paper-deep)" : "var(--accent-ink)",
                          color: member.anonymous ? "var(--ink-3)" : "#fff",
                          fontFamily: "var(--serif)",
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {member.anonymous ? "?" : member.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: member.anonymous ? 400 : 500, color: member.anonymous ? "var(--ink-3)" : "var(--ink)" }}>
                          {member.anonymous ? <i>访客 · 未绑定</i> : member.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "11px 14px", color: member.phone === "—" ? "var(--ink-4)" : "var(--ink-2)", fontFamily: "var(--mono)", fontSize: 11.5 }}>
                    {member.phone}
                  </td>
                  <td style={{ padding: "11px 14px", color: "var(--ink-2)" }}>{member.source}</td>
                  <td style={{ padding: "11px 14px", color: "var(--ink-2)", fontVariantNumeric: "tabular-nums" }}>{member.joinedAt}</td>
                  <td style={{ padding: "11px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{member.courseCount}</td>
                  <td style={{ padding: "11px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{member.playbackMinutes}</td>
                  <td style={{ padding: "11px 14px", color: "var(--ink-2)" }}>{member.lastActive}</td>
                  <td style={{ padding: "11px 14px" }}>
                    {member.bound ? (
                      <span className="tz-chip is-accent" style={{ fontSize: 10 }}>已绑定</span>
                    ) : (
                      <span className="tz-chip" style={{ fontSize: 10 }}>访客</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
