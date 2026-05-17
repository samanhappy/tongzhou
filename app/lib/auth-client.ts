import type { AuthSession } from "./auth-shared";

export type RegisterInput = {
  email: string;
  password: string;
  slug: string;
  name: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

async function request<T>(
  base: string,
  path: string,
  init: RequestInit,
): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    let message = `请求失败 (${res.status})`;
    try {
      const json = (await res.json()) as { error?: string; message?: string };
      message = json.error || json.message || message;
    } catch {
      const text = await res.text().catch(() => "");
      if (text) message = text;
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export async function registerAuth(
  base: string,
  input: RegisterInput,
): Promise<AuthSession> {
  return request<AuthSession>(base, "/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function loginAuth(
  base: string,
  input: LoginInput,
): Promise<AuthSession> {
  return request<AuthSession>(base, "/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logoutAuth(base: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(base, "/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}
