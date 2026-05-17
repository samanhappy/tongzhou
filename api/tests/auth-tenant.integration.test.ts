import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  bootTestApp,
  createTrack,
  registerOwner,
  responseJson,
  uniqueSlug,
} from "./helpers/test-app.js";

describe("auth session and tenant isolation", () => {
  let close: (() => Promise<void>) | undefined;
  let app: Awaited<ReturnType<typeof bootTestApp>>["app"];

  beforeAll(async () => {
    const boot = await bootTestApp();
    app = boot.app;
    close = boot.close;
  });

  afterAll(async () => {
    await close?.();
  });

  test("requires cookie auth and isolates creator data by tenant", async () => {
    const ownerA = await registerOwner(app, { slug: uniqueSlug("alpha") });
    const ownerB = await registerOwner(app, { slug: uniqueSlug("beta") });

    const noSession = await app.inject({ method: "GET", url: "/api/tracks" });
    expect(noSession.statusCode).toBe(401);

    const headerOnly = await app.inject({
      method: "GET",
      url: "/api/tracks",
      headers: { "x-tenant-slug": ownerA.tenant.slug },
    });
    expect(headerOnly.statusCode).toBe(401);

    const me = await app.inject({
      method: "GET",
      url: "/api/auth/me",
      headers: { cookie: ownerA.cookie },
    });
    expect(me.statusCode).toBe(200);
    expect(
      responseJson<{
        user: { email: string; role: string };
        tenant: { slug: string; name: string };
      }>(me),
    ).toMatchObject({
      user: { email: ownerA.email, role: "owner" },
      tenant: { slug: ownerA.tenant.slug, name: ownerA.tenant.name },
    });

    const track = await createTrack(app, ownerA.cookie, {
      slug: uniqueSlug("course"),
      title: "Tenant A Course",
    });

    const ownTrack = await app.inject({
      method: "GET",
      url: `/api/tracks/${track.id}`,
      headers: { cookie: ownerA.cookie },
    });
    expect(ownTrack.statusCode).toBe(200);

    const otherTenantTrack = await app.inject({
      method: "GET",
      url: `/api/tracks/${track.id}`,
      headers: { cookie: ownerB.cookie },
    });
    expect(otherTenantTrack.statusCode).toBe(404);
  });
});
