"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Heading, TZMark } from "@/components/primitives";
import { loginAuth, registerAuth } from "@/lib/auth-client";

type AuthMode = "login" | "register";

function suggestSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
}

export function AuthEntry({
  mode,
  apiBase,
  nextHref = "/app/dashboard",
}: {
  mode: AuthMode;
  apiBase: string | null;
  nextHref?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(mode === "register" ? "hello@xingchunge.com" : "");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("醒春阁");
  const [slug, setSlug] = useState("xingchunge");
  const [slugTouched, setSlugTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageTitle = useMemo(
    () => (mode === "login" ? "登录创作者后台" : "创建你的创作者空间"),
    [mode],
  );

  const subtitle =
    mode === "login"
      ? "邮箱 + 密码即可进入，同步拿到 httpOnly cookie 会话。"
      : "注册完成后会立即创建 tenant + owner 账号，并自动登录。";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!apiBase) {
      router.push(mode === "login" ? "/app/dashboard" : "/onboarding");
      return;
    }

    setPending(true);
    try {
      if (mode === "login") {
        await loginAuth(apiBase, { email, password });
      } else {
        await registerAuth(apiBase, { email, password, name, slug });
      }
      router.push(nextHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败，请稍后重试");
    } finally {
      setPending(false);
    }
  }

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
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <TZMark size={28} />
            <span className="tz-serif" style={{ fontSize: 18, fontWeight: 500 }}>
              同舟
            </span>
          </div>
          <h1 className="tz-serif" style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>
            {pageTitle}
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--ink-3)", lineHeight: 1.7 }}>
            {subtitle}
          </p>
        </div>

        <div className="tz-card" style={{ padding: 18, boxShadow: "var(--shadow-1)" }}>
          <Heading>创作者入口</Heading>

          {!apiBase && (
            <div
              style={{
                padding: "12px 14px",
                background: "var(--paper-deep)",
                borderRadius: 8,
                fontSize: 11.5,
                color: "var(--ink-2)",
                lineHeight: 1.7,
                marginBottom: 16,
              }}
            >
              当前未配置 <span className="tz-mono">API_BASE</span>，页面会保留离线演示模式。
              你仍然可以直接进入 Demo，不会被认证拦住。
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}>邮箱</span>
              <input
                data-testid="auth-email"
                className="tz-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}>密码</span>
              <input
                data-testid="auth-password"
                className="tz-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="至少 8 位"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
            </label>

            {mode === "register" && (
              <>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}>
                    创作者名 / 空间名
                  </span>
                  <input
                    data-testid="auth-name"
                    className="tz-input"
                    value={name}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setName(nextValue);
                      if (!slugTouched) setSlug(suggestSlug(nextValue) || "xingchunge");
                    }}
                    placeholder="例如：醒春阁"
                    required
                  />
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em" }}>空间 slug</span>
                  <div style={{ display: "flex", alignItems: "stretch" }}>
                    <input
                      data-testid="auth-slug"
                      className="tz-input"
                      value={slug}
                      onChange={(event) => {
                        setSlugTouched(true);
                        setSlug(event.target.value.toLowerCase());
                      }}
                      placeholder="xingchunge"
                      required
                      style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    />
                    <div
                      style={{
                        padding: "0 10px",
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid var(--paper-edge)",
                        borderLeft: 0,
                        borderRadius: "0 6px 6px 0",
                        background: "var(--paper-deep)",
                        color: "var(--ink-3)",
                        fontSize: 11,
                        fontFamily: "var(--mono)",
                      }}
                    >
                      .tongzhou.app
                    </div>
                  </div>
                </label>
              </>
            )}

            {error && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  background: "color-mix(in oklch, var(--seal) 10%, var(--paper))",
                  color: "var(--seal)",
                  fontSize: 11.5,
                }}
              >
                {error}
              </div>
            )}

            <button
              data-testid="auth-submit"
              type="submit"
              className="tz-btn tz-btn-primary"
              disabled={pending}
              style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: pending ? 0.8 : 1 }}
            >
              {pending ? "提交中…" : mode === "login" ? (
                "登录"
              ) : (
                "创建并进入后台"
              )}
            </button>
          </form>

          <div style={{ marginTop: 14, fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.7 }}>
            {mode === "login" ? "还没有空间？" : "已经有账号了？"}
            <Link
              href={mode === "login" ? "/register" : "/login"}
              style={{ color: "var(--accent-deep)", marginLeft: 6, textDecoration: "underline" }}
            >
              {mode === "login" ? "去注册" : "去登录"}
            </Link>
          </div>

          {!apiBase && (
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Link
                href={mode === "login" ? "/app/dashboard" : "/onboarding"}
                className="tz-btn tz-btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {mode === "login" ? "直接进入 Demo" : "继续离线演示"}
              </Link>
              <Link href="/" className="tz-btn" style={{ justifyContent: "center" }}>
                返回首页
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
