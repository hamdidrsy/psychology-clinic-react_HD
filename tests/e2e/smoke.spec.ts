import { expect, test } from "@playwright/test";

test("loads the public appointment page", async ({ page }) => {
  await page.goto("/iletisim");
  await expect(page.getByRole("main")).toBeVisible();
});
