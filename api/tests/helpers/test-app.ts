import type { FastifyInstance } from "fastify";

export type RegisteredOwner = {
  cookie: string;
  email: string;
  password: string;
  user: { id: string; email: string; role: string };
  tenant: { id: string; slug: string; name: string };
};

export async function bootTestApp(): Promise<{
  app: FastifyInstance;
  close: () => Promise<void>;
}> {
  const [{ buildServer }, { getDb }] = await Promise.all([
    import("../../src/server.js"),
    import("../../src/db/index.js"),
  ]);

  const app = await buildServer();
  await app.ready();

  return {
    app,
    close: async () => {
      await app.close();
      await getDb().close();
    },
  };
}

export function uniqueSlug(prefix = "tenant") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function responseJson<T>(response: { body: string }): T {
  return JSON.parse(response.body) as T;
}

export function sessionCookie(response: {
  headers: Record<string, string | string[] | number | undefined>;
}): string {
  const header = response.headers["set-cookie"];
  const raw = Array.isArray(header) ? header[0] : header;
  if (!raw) {
    throw new Error(
      `missing set-cookie header: ${JSON.stringify(response.headers)}`,
    );
  }
  const text = String(raw);
  return text.split(";", 1)[0] ?? text;
}

export async function registerOwner(
  app: FastifyInstance,
  input?: Partial<{
    email: string;
    password: string;
    slug: string;
    name: string;
  }>,
): Promise<RegisteredOwner> {
  const slug = input?.slug ?? uniqueSlug("space");
  const email = input?.email ?? `${slug}@example.com`;
  const password = input?.password ?? "password123";
  const name = input?.name ?? `Space ${slug}`;

  const response = await app.inject({
    method: "POST",
    url: "/api/auth/register",
    payload: { email, password, slug, name },
  });

  if (response.statusCode !== 200) {
    throw new Error(`register failed: ${response.statusCode} ${response.body}`);
  }

  const body = responseJson<RegisteredOwner>(
    response as unknown as { body: string },
  );

  return {
    ...body,
    email,
    password,
    cookie: sessionCookie(response),
  };
}

export async function createTrack(
  app: FastifyInstance,
  cookie: string,
  input: { slug: string; title: string; subtitle?: string; oneLine?: string },
) {
  const response = await app.inject({
    method: "POST",
    url: "/api/tracks",
    headers: { cookie },
    payload: input,
  });

  if (response.statusCode !== 200) {
    throw new Error(
      `create track failed: ${response.statusCode} ${response.body}`,
    );
  }

  return responseJson<{
    track: { id: string; slug: string; title: string; status: string };
  }>(response as unknown as { body: string }).track;
}

export async function addMember(
  app: FastifyInstance,
  cookie: string,
  input: { name?: string; phone?: string; source?: string },
): Promise<{ id: string; name: string; phone: string }> {
  const res = await app.inject({
    method: "POST",
    url: "/api/members",
    headers: { cookie },
    payload: input,
  });
  if (res.statusCode !== 200) {
    throw new Error(`addMember failed: ${res.statusCode} ${res.body}`);
  }
  return responseJson<{ member: { id: string; name: string; phone: string } }>(
    res as unknown as { body: string },
  ).member;
}

export async function createMemberInvite(
  app: FastifyInstance,
  cookie: string,
  memberId: string,
  ttlDays?: number,
): Promise<{ id: string; token: string; expiresAt: number }> {
  const res = await app.inject({
    method: "POST",
    url: `/api/members/${memberId}/invite`,
    headers: { cookie },
    payload: ttlDays ? { ttlDays } : {},
  });
  if (res.statusCode !== 200) {
    throw new Error(`invite failed: ${res.statusCode} ${res.body}`);
  }
  return responseJson<{
    invite: { id: string; token: string; expiresAt: number };
  }>(res as unknown as { body: string }).invite;
}

/**
 * 走 dev driver 把 openid 绑到一个邀请 / 已绑定的 member,返回学员 session cookie。
 * `inviteToken` 留空走 silent re-login(必须 openid 已经绑过)。
 */
export async function bindStudent(
  app: FastifyInstance,
  slug: string,
  args: { openid: string; inviteToken?: string; next?: string },
): Promise<{ cookie: string }> {
  const startUrl = new URL(`http://127.0.0.1/api/x/${slug}/auth/start`);
  if (args.inviteToken) startUrl.searchParams.set("invite", args.inviteToken);
  if (args.next) startUrl.searchParams.set("next", args.next);
  const start = await app.inject({
    method: "GET",
    url: startUrl.pathname + startUrl.search,
  });
  if (start.statusCode !== 302) {
    throw new Error(`auth/start failed: ${start.statusCode} ${start.body}`);
  }
  const csrf = sessionCookie(start);
  const devUrl = String(start.headers.location);
  // 把 openid 拼进 dev stub,跳过表单
  const u = new URL(devUrl);
  u.searchParams.set("openid", args.openid);
  const devRes = await app.inject({
    method: "GET",
    url: u.pathname + u.search,
  });
  if (devRes.statusCode !== 302) {
    throw new Error(`dev authorize failed: ${devRes.statusCode} ${devRes.body}`);
  }
  const callbackUrl = String(devRes.headers.location);
  const cb = new URL(callbackUrl);
  const callback = await app.inject({
    method: "GET",
    url: cb.pathname + cb.search,
    headers: { cookie: csrf },
  });
  if (callback.statusCode !== 302) {
    throw new Error(`callback failed: ${callback.statusCode} ${callback.body}`);
  }
  // 提取 tz_student cookie
  const setCookie = callback.headers["set-cookie"];
  const cookies = Array.isArray(setCookie)
    ? setCookie
    : setCookie
      ? [String(setCookie)]
      : [];
  const student = cookies.find((c) => c.startsWith("tz_student="));
  if (!student) {
    throw new Error(
      `callback did not set tz_student cookie: ${JSON.stringify(cookies)}`,
    );
  }
  return { cookie: student.split(";", 1)[0]! };
}

export async function createLesson(
  app: FastifyInstance,
  cookie: string,
  trackId: string,
  input: {
    title: string;
    summary?: string;
    durationSec?: number;
    durationText?: string;
    videoId?: string;
    status?: "draft" | "uploading" | "transcoding" | "published" | "failed";
  },
) {
  const response = await app.inject({
    method: "POST",
    url: `/api/tracks/${trackId}/lessons`,
    headers: { cookie },
    payload: input,
  });

  if (response.statusCode !== 200) {
    throw new Error(
      `create lesson failed: ${response.statusCode} ${response.body}`,
    );
  }

  return responseJson<{
    lesson: {
      id: string;
      title: string;
      summary: string;
      status: string;
      duration_sec: number | null;
      duration_text: string;
      track_id: string;
    };
  }>(response as unknown as { body: string }).lesson;
}
