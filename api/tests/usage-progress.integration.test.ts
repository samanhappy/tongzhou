import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  bootTestApp,
  createLesson,
  createTrack,
  registerOwner,
  responseJson,
  uniqueSlug,
} from "./helpers/test-app.js";

describe("usage recompute and learner progress", () => {
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

  test("dedupes progress per learner and recomputes tenant meters", async () => {
    const owner = await registerOwner(app, { slug: uniqueSlug("usage") });
    const track = await createTrack(app, owner.cookie, {
      slug: uniqueSlug("usage-course"),
      title: "Usage Course",
    });

    const publishTrack = await app.inject({
      method: "PATCH",
      url: `/api/tracks/${track.id}`,
      headers: { cookie: owner.cookie },
      payload: { status: "published" },
    });
    expect(publishTrack.statusCode).toBe(200);

    const lesson = await createLesson(app, owner.cookie, track.id, {
      title: "第一课",
      status: "published",
      durationSec: 600,
      durationText: "10:00",
    });

    const { create: createUpload } = await import("../src/modules/uploads/repo.js");
    await createUpload(owner.tenant.id, {
      filename: "lesson-1.mp4",
      mime: "video/mp4",
      sizeBytes: 536870912,
      storageDriver: "local",
      storageKey: `videos/${owner.tenant.id}/lesson-1.mp4`,
      url: `http://127.0.0.1:4100/files/${owner.tenant.id}/lesson-1.mp4`,
      phase: "ready",
    });

    const firstProgress = await app.inject({
      method: "POST",
      url: `/api/x/${owner.tenant.slug}/progress`,
      payload: { lessonId: lesson.id, watchedSec: 120, anonToken: "anon-1" },
    });
    expect(firstProgress.statusCode).toBe(200);

    const secondProgress = await app.inject({
      method: "POST",
      url: `/api/x/${owner.tenant.slug}/progress`,
      payload: { lessonId: lesson.id, watchedSec: 240, completed: true, anonToken: "anon-1" },
    });
    expect(secondProgress.statusCode).toBe(200);

    const heartbeat = await app.inject({
      method: "POST",
      url: `/api/x/${owner.tenant.slug}/heartbeat`,
      payload: { lessonId: lesson.id, deltaSec: 180, anonToken: "anon-1" },
    });
    expect(heartbeat.statusCode).toBe(200);

    const { getDb } = await import("../src/db/index.js");
    const progressRows = await getDb()
      .prepare(
        `SELECT watched_sec, completed
         FROM lesson_progress
         WHERE tenant_id = ? AND lesson_id = ? AND anon_token = ?`,
      )
      .all<{ watched_sec: number; completed: number }>([
        owner.tenant.id,
        lesson.id,
        "anon-1",
      ]);

    expect(progressRows).toEqual([{ watched_sec: 240, completed: 1 }]);

    const recompute = await app.inject({
      method: "POST",
      url: "/api/usage/recompute",
      headers: { cookie: owner.cookie },
    });
    expect(recompute.statusCode).toBe(200);

    const meters = responseJson<{
      meters: Array<{
        key: string;
        value: number;
      }>;
    }>(recompute).meters;

    expect(Object.fromEntries(meters.map((meter) => [meter.key, meter.value]))).toMatchObject({
      "members.active_count": 1,
      "courses.count": 1,
      "storage.bytes": 0.5,
      "playback.minutes": 3,
    });
  });
});
