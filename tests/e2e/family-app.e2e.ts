import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  PHONE_VIEWPORT,
  SCREENSHOT_STYLE,
  SCREENS_DIR,
  collectErrors,
  expectNoHorizontalOverflow,
  resetParentSession,
  waitForScreen,
  type ErrorLog,
} from "./helpers";

type FamilyScreen = {
  name: string;
  path: string;
  title: RegExp;
  /** The screen keeps its single primary CTA in the bottom action bar. */
  hasActionBar: boolean;
  check?: (p_screen: Locator, p_page: Page) => Promise<void>;
};

async function expectHomeStructures(p_screen: Locator): Promise<void> {
  const hero: Locator = p_screen.locator("[data-gk-hero]");
  await expect(hero).toBeVisible();
  await expect(hero.locator("[data-gk-mission]")).toBeVisible();
  await expect(hero.locator("[data-gk-mission-copy]")).toBeVisible();
  await expect(hero.locator('[data-gk-btn="warm"]')).toHaveText("Start mission");
  const tiles: Locator = p_screen.locator("[data-gk-tiles]");
  await expect(tiles).toBeVisible();
  const columns: string = await tiles.evaluate((p_element: Element): string => getComputedStyle(p_element).gridTemplateColumns);
  expect(columns.trim().split(/\s+/)).toHaveLength(2);
  const pebbles: Locator = tiles.locator("[data-gk-pebble]");
  expect(await pebbles.count()).toBeGreaterThanOrEqual(2);
  for (const pebble of await pebbles.all()) {
    await expect(pebble.locator("[data-gk-well]")).toHaveCount(1);
    await expect(pebble.locator("[data-gk-num]")).toHaveText(/^\d+$/);
  }
  // Avatars, wherever they appear, are initials only (INV-002).
  for (const avatar of await p_screen.locator("[data-gk-avatar]").all()) {
    await expect(avatar).toHaveText(/^[A-Z?]{1,2}$/);
    await expect(avatar.locator("img")).toHaveCount(0);
  }
}

async function expectCalendarStructures(p_screen: Locator): Promise<void> {
  const days: Locator = p_screen.locator("[data-gk-week] [data-gk-day]");
  await expect(days).toHaveCount(7);
  await expect(p_screen.locator('[data-gk-week] [data-gk-day][aria-pressed="true"]')).toHaveCount(1);
  await expectOnlyTodayFilled(p_screen);
  await p_screen.locator('[data-gk-action-bar] [data-gk-btn="primary"]').click();
  const sheet: Locator = p_screen.locator("[data-gk-sheet-backdrop]");
  await expect(sheet).toHaveAttribute("data-open", "true");
  await expect(sheet.locator("[data-gk-grab]")).toBeVisible();
  await sheet.getByRole("button", { name: "Close" }).click();
  await expect(sheet).toHaveAttribute("data-open", "false");
}

async function expectQuizStructures(p_screen: Locator): Promise<void> {
  await expect(p_screen.getByRole("progressbar", { name: "Quiz progress" })).toBeVisible();
  await expect(p_screen.locator("[data-gk-qcard]")).toBeVisible();
  expect(await p_screen.locator("[data-gk-qcard] [data-gk-choice]").count()).toBeGreaterThanOrEqual(2);
  await expect(p_screen.locator('[data-gk-action-bar] [data-gk-btn="ghost"]')).toHaveText("Skip");
}

/** Preview Calendar: only today carries the filled primary pill; every other day is ink on no background. */
async function expectOnlyTodayFilled(p_screen: Locator): Promise<void> {
  const fills: { today: boolean; background: string; color: string }[] = await p_screen
    .locator("[data-gk-week] [data-gk-day]")
    .evaluateAll((p_days: Element[]) =>
      p_days.map((p_day: Element) => ({
        today: p_day.getAttribute("data-today") === "true",
        background: getComputedStyle(p_day).backgroundColor,
        color: getComputedStyle(p_day).color,
      })),
    );
  const filled = fills.filter((p_fill) => p_fill.background !== "rgba(0, 0, 0, 0)" && p_fill.background !== "transparent");
  expect(filled).toHaveLength(1);
  expect(filled[0]?.today).toBe(true);
  expect(filled[0]?.background).toBe("rgb(13, 92, 99)");
  for (const fill of fills.filter((p_fill) => !p_fill.today)) {
    expect(fill.color).toBe("rgb(11, 46, 51)");
  }
}

async function expectWeekStrip(p_screen: Locator): Promise<void> {
  await expect(p_screen.locator("[data-gk-week] [data-gk-day]")).toHaveCount(7);
  await expectOnlyTodayFilled(p_screen);
}

async function expectChildStructures(p_screen: Locator): Promise<void> {
  await expect(p_screen.locator("[data-gk-hero]")).toBeVisible();
  await expect(p_screen.locator('[data-gk-action-bar] [data-gk-btn="warm"]')).toBeVisible();
}

const SCREENS: readonly FamilyScreen[] = [
  { name: "home", path: "/context-switch", title: /^Good (morning|afternoon|evening), family$/, hasActionBar: false, check: expectHomeStructures },
  { name: "child", path: "/child", title: /Your missions/, hasActionBar: true, check: expectChildStructures },
  { name: "calendar", path: "/calendar", title: /^Calendar$/, hasActionBar: true, check: expectCalendarStructures },
  { name: "quiz", path: "/quiz", title: /^Family quiz$/, hasActionBar: true, check: expectQuizStructures },
  { name: "forecast", path: "/forecast", title: /^Week forecast$/, hasActionBar: false, check: expectWeekStrip },
  { name: "diary", path: "/diary", title: /^Family diary$/, hasActionBar: true },
  { name: "missions-cycle", path: "/missions/cycle", title: /^Mission cycle$/, hasActionBar: true },
  { name: "missions-completed", path: "/missions/completed", title: /^Completed missions$/, hasActionBar: false },
  { name: "missions-mascot", path: "/missions/mascot", title: /^Today's mission$/, hasActionBar: true },
  { name: "missions-surprise", path: "/missions/surprise", title: /^Surprise mission$/, hasActionBar: true },
  { name: "profile", path: "/profile", title: /^Family GPS$/, hasActionBar: false },
  { name: "plan", path: "/plan", title: /^Family plan$/, hasActionBar: true },
];

test.use({ viewport: PHONE_VIEWPORT, colorScheme: "dark" });

test.beforeEach(async ({ page }): Promise<void> => {
  await resetParentSession(page);
});

for (const screenDef of SCREENS) {
  test(`family ${screenDef.name} renders the preview structures inside the phone chrome`, async ({ page }): Promise<void> => {
    const errors: ErrorLog = collectErrors(page);
    const response = await page.goto(screenDef.path);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('[data-phone-chrome="iphone-15-pro-max"]')).toBeVisible();
    const screen: Locator = await waitForScreen(page);
    await expect(screen.locator("[data-phone-statusbar]")).toBeVisible();
    await expect(screen.locator("[data-phone-island]")).toBeVisible();

    const title: Locator = screen.locator("[data-gk-head] h1");
    await expect(title).toHaveText(screenDef.title);

    const screenBox = await screen.boundingBox();
    const hamburger: Locator = screen.locator("[data-phone-hamburger]");
    const hamburgerBox = await hamburger.boundingBox();
    expect(screenBox).not.toBeNull();
    expect(hamburgerBox).not.toBeNull();
    if (screenBox !== null && hamburgerBox !== null) {
      expect(hamburgerBox.x + hamburgerBox.width).toBeGreaterThan(screenBox.x + screenBox.width - 48);
      expect(hamburgerBox.y).toBeLessThan(screenBox.y + 140);
    }

    if (screenDef.hasActionBar) {
      const cta: Locator = screen.locator("[data-gk-action-bar] [data-gk-btn]").last();
      await expect(cta).toBeVisible();
      const ctaBox = await cta.boundingBox();
      if (screenBox !== null && ctaBox !== null) {
        expect(ctaBox.y).toBeGreaterThan(screenBox.y + screenBox.height * 0.8);
      }
    }

    if (screenDef.check !== undefined) {
      await screenDef.check(screen, page);
    }

    // The family app is always light, even when the OS asks for dark.
    const canvas: string = await screen.evaluate((p_element: Element): string =>
      getComputedStyle(p_element).getPropertyValue("--gk-bg").trim().toUpperCase(),
    );
    expect(canvas).toBe("#F5FAFA");

    await expectNoHorizontalOverflow(page);
    await screen.screenshot({ path: `${SCREENS_DIR}/app-${screenDef.name}.png`, style: SCREENSHOT_STYLE });

    await hamburger.click();
    const drawer: Locator = page.locator("#family-drawer");
    await expect(drawer).toHaveAttribute("data-open", "true");
    await expect(drawer.getByText("Sign out")).toBeVisible();
    const drawerBox = await drawer.boundingBox();
    if (screenBox !== null && drawerBox !== null) {
      expect(Math.abs(drawerBox.x + drawerBox.width - (screenBox.x + screenBox.width))).toBeLessThan(2);
      expect(drawerBox.x).toBeGreaterThan(screenBox.x + screenBox.width * 0.1);
    }
    if (screenDef.name === "home") {
      await screen.screenshot({ path: `${SCREENS_DIR}/app-home-drawer.png`, style: SCREENSHOT_STYLE });
    }
    await page.keyboard.press("Escape");
    await expect(drawer).toHaveAttribute("data-open", "false");

    expect(errors.messages).toEqual([]);
  });
}

test("the Parent lands on the family Home and the drawer Home item returns there", async ({ page }): Promise<void> => {
  const errors: ErrorLog = collectErrors(page);
  await page.goto("/catalog");
  await page.locator("[data-surface-mode-switch]").getByRole("link", { name: "User" }).click();
  await expect(page).toHaveURL(/\/context-switch$/);
  let screen: Locator = await waitForScreen(page);
  await expect(screen.locator("[data-gk-hero] [data-gk-mission]")).toBeVisible();
  await expect(screen.locator("[data-home-summary]")).toBeVisible();

  await page.goto("/calendar");
  screen = await waitForScreen(page);
  await screen.locator("[data-phone-hamburger]").click();
  const drawer: Locator = page.locator("#family-drawer");
  const firstItem: Locator = drawer.locator("[data-phone-drawer-nav] a").first();
  await expect(firstItem).toHaveText("Home");
  await firstItem.click();
  await expect(page).toHaveURL(/\/context-switch$/);
  screen = await waitForScreen(page);
  await expect(screen.locator("[data-gk-hero]")).toBeVisible();
  await expect(drawer).toHaveAttribute("data-open", "false");
  expect(errors.messages).toEqual([]);
});
