import { expect, test } from "@playwright/test";

test("creator can drag to reorder lessons and keep the saved order", async ({ page }) => {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  await page.goto("/register");
  await page.getByTestId("auth-email").fill(`creator-${token}@example.com`);
  await page.getByTestId("auth-password").fill("password123");
  await page.getByTestId("auth-name").fill(`同舟测试空间 ${token}`);
  await page.getByTestId("auth-slug").fill(`space-${token}`);
  await page.getByTestId("auth-submit").click();

  await expect(page).toHaveURL(/\/app\/dashboard$/);

  await page.goto("/app/tracks");
  await page.getByTestId("track-create-toggle").click();
  await page.getByTestId("track-title-input").fill("拖拽排序回归课");
  await page.getByTestId("track-subtitle-input").fill("Playwright 回归");
  await page.getByTestId("track-slug-input").fill(`drag-course-${token}`);
  await page.getByTestId("track-create-submit").click();

  await expect(page).toHaveURL(/\/app\/tracks\/.+/);

  await page.getByTestId("lesson-add-toggle").click();
  await page.getByTestId("new-lesson-title").fill("第一课");
  await page.getByTestId("new-lesson-summary").fill("先写第一节");
  await page.getByTestId("new-lesson-save").click();
  await expect(page.getByText("新课时已创建。", { exact: true })).toBeVisible();

  await page.getByTestId("lesson-add-toggle").click();
  await page.getByTestId("new-lesson-title").fill("第二课");
  await page.getByTestId("new-lesson-summary").fill("再写第二节");
  await page.getByTestId("new-lesson-save").click();
  await expect(page.getByText("新课时已创建。", { exact: true })).toBeVisible();

  const lessonCards = page.getByTestId("lesson-card");
  await expect(lessonCards).toHaveCount(2);
  await expect(lessonCards.nth(0).getByTestId("lesson-card-title")).toHaveText("第一课");
  await expect(lessonCards.nth(1).getByTestId("lesson-card-title")).toHaveText("第二课");

  await lessonCards.nth(1).dragTo(lessonCards.nth(0));
  await expect(page.getByText("课时顺序已保存。", { exact: true })).toBeVisible();
  await expect(lessonCards.nth(0).getByTestId("lesson-card-title")).toHaveText("第二课");
  await expect(lessonCards.nth(1).getByTestId("lesson-card-title")).toHaveText("第一课");

  await page.reload();

  const reloadedCards = page.getByTestId("lesson-card");
  await expect(reloadedCards).toHaveCount(2);
  await expect(reloadedCards.nth(0).getByTestId("lesson-card-title")).toHaveText("第二课");
  await expect(reloadedCards.nth(1).getByTestId("lesson-card-title")).toHaveText("第一课");
});
