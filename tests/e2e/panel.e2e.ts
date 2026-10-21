import { expect, test, type Locator } from "@playwright/test";
import { collectErrors, expectNoHorizontalOverflow, type ErrorLog } from "./helpers";

const PANEL_ROUTES: readonly string[] = [
  "/",
  "/catalog",
  "/materials",
  "/questions",
  "/contexts",
  "/families",
  "/users",
  "/plans",
  "/indicators",
];

test.use({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });

for (const route of PANEL_ROUTES) {
  test(`panel ${route} loads without the phone chrome`, async ({ page }): Promise<void> => {
    const errors: ErrorLog = collectErrors(page);
    const response = await page.goto(route);
    expect(response?.ok()).toBe(true);
    await expect(page.locator("[data-panel-shell]")).toBeVisible();
    await expect(page.locator("[data-panel-topbar] [data-panel-theme-toggle]")).toBeVisible();
    await expect(page.locator("[data-phone-chrome]")).toHaveCount(0);
    await page.waitForLoadState("networkidle");
    await expectNoHorizontalOverflow(page);
    expect(errors.messages).toEqual([]);
  });
}

test("panel defaults to light and the top bar toggle switches and remembers the theme", async ({ page }): Promise<void> => {
  const errors: ErrorLog = collectErrors(page);
  await page.goto("/catalog");
  await page.waitForLoadState("networkidle");
  const panel: Locator = page.locator('[data-surface="panel"]');
  const toggle: Locator = page.locator("[data-panel-theme-toggle]");
  const canvas = async (): Promise<string> =>
    panel.evaluate((p_element: Element): string =>
      getComputedStyle(p_element).getPropertyValue("--gk-bg").trim().toUpperCase(),
    );

  await expect(panel).toHaveAttribute("data-theme", "light");
  expect(await canvas()).toBe("#F5FAFA");
  await expect(toggle).toHaveText("Dark");

  await toggle.click();
  await expect(panel).toHaveAttribute("data-theme", "dark");
  expect(await canvas()).toBe("#071C1F");
  await expect(toggle).toHaveText("Light");
  await page.screenshot({ path: "test-results/screens/panel-dark.png" });

  await page.reload();
  await expect(panel).toHaveAttribute("data-theme", "dark");

  await toggle.click();
  await expect(panel).toHaveAttribute("data-theme", "light");
  expect(await canvas()).toBe("#F5FAFA");
  await page.screenshot({ path: "test-results/screens/panel-light.png" });
  expect(errors.messages).toEqual([]);
});
