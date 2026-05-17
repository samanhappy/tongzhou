import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  bootTestApp,
  createTrack,
  registerOwner,
  uniqueSlug,
} from "./helpers/test-app.js";

const pgUrl = process.env.TEST_PG_DATABASE_URL;

describe.skipIf(!pgUrl)("postgres row level security", () => {
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

  test("enforces tenant visibility even when SQL asks for another tenant", async () => {
    const ownerA = await registerOwner(app, { slug: uniqueSlug("pg-a") });
    const ownerB = await registerOwner(app, { slug: uniqueSlug("pg-b") });
    const track = await createTrack(app, ownerA.cookie, {
      slug: uniqueSlug("pg-course"),
      title: "RLS Course",
    });

    const [{ getDb, requestScope }, { pgHooks }] = await Promise.all([
      import("../src/db/index.js"),
      import("../src/db/postgres.js"),
    ]);

    const db = getDb() as unknown as { __pool: import("pg").Pool };
    const scope: { client?: unknown; tenantId?: string } = {};

    await pgHooks.attachClient(db.__pool, scope, ownerA.tenant.id);
    try {
      const tenantMarker = await requestScope.run(scope, async () =>
        getDb()
          .prepare(`SELECT app_current_tenant() AS tenant`)
          .get<{ tenant: string }>([]),
      );
      expect(tenantMarker?.tenant).toBe(ownerA.tenant.id);

      const visibleOwn = await requestScope.run(scope, async () =>
        getDb()
          .prepare(`SELECT id FROM tracks WHERE tenant_id = ?`)
          .all<{ id: string }>([ownerA.tenant.id]),
      );
      expect(visibleOwn.map((row) => row.id)).toContain(track.id);

      const visibleOther = await requestScope.run(scope, async () =>
        getDb()
          .prepare(`SELECT id FROM tracks WHERE tenant_id = ?`)
          .all<{ id: string }>([ownerB.tenant.id]),
      );
      expect(visibleOther).toEqual([]);
    } finally {
      await pgHooks.finishClient(scope, true);
    }
  });
});
