import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  bootTestApp,
  createLesson,
  createTrack,
  registerOwner,
  responseJson,
  uniqueSlug,
} from "./helpers/test-app.js";

describe("lesson reorder persistence", () => {
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

  test("persists reordered lessons through the HTTP API", async () => {
    const owner = await registerOwner(app, { slug: uniqueSlug("reorder") });
    const track = await createTrack(app, owner.cookie, {
      slug: uniqueSlug("drag-course"),
      title: "Drag Course",
    });

    const first = await createLesson(app, owner.cookie, track.id, { title: "第一课" });
    const second = await createLesson(app, owner.cookie, track.id, { title: "第二课" });
    const third = await createLesson(app, owner.cookie, track.id, { title: "第三课" });

    const reorder = await app.inject({
      method: "POST",
      url: `/api/tracks/${track.id}/lessons/reorder`,
      headers: { cookie: owner.cookie },
      payload: { orderedIds: [third.id, first.id, second.id] },
    });

    expect(reorder.statusCode).toBe(200);
    expect(
      responseJson<{ lessons: Array<{ id: string }> }>(reorder).lessons.map((lesson) => lesson.id),
    ).toEqual([third.id, first.id, second.id]);

    const detail = await app.inject({
      method: "GET",
      url: `/api/tracks/${track.id}`,
      headers: { cookie: owner.cookie },
    });

    expect(detail.statusCode).toBe(200);
    expect(
      responseJson<{ lessons: Array<{ id: string }> }>(detail).lessons.map((lesson) => lesson.id),
    ).toEqual([third.id, first.id, second.id]);
  });
});
