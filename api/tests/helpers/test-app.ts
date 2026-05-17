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
