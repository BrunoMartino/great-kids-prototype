import { expect, test, type Locator, type Page } from "@playwright/test";
import { PHONE_VIEWPORT, resetParentSession, waitForScreen } from "./helpers";

type AnimationState = { name: string; playState: string };

async function animationOf(p_locator: Locator): Promise<AnimationState> {
  return p_locator.evaluate((p_element: Element): AnimationState => {
    const style: CSSStyleDeclaration = getComputedStyle(p_element);
    return { name: style.animationName, playState: style.animationPlayState };
  });
}

async function expectRunning(p_locator: Locator): Promise<void> {
  const state: AnimationState = await animationOf(p_locator);
  expect(state.name).not.toBe("none");
  expect(state.playState).toBe("running");
}

async function expectTideRunning(p_page: Page): Promise<void> {
  const tide: Locator = p_page.locator("[data-tide]");
  await expect(tide).toHaveAttribute("data-tide-mode", "animated");
  await expect(tide).toHaveAttribute("data-tide-paused", "false");
  for (const layer of ["1", "2", "3"]) {
    await expectRunning(tide.locator(`[data-tide-wave="${layer}"]`));
  }
  await expectRunning(tide.locator('[data-tide-pool="sea"]'));
}

/** Motion ON (no reduced-motion preference): every family screen moves. */
test.use({ viewport: PHONE_VIEWPORT, reducedMotion: "no-preference" });

test.beforeEach(async ({ page }): Promise<void> => {
  await resetParentSession(page);
});

const ROUTES: readonly string[] = [
  "/context-switch",
  "/child",
  "/calendar",
  "/quiz",
  "/forecast",
  "/diary",
  "/missions/cycle",
  "/missions/completed",
  "/missions/mascot",
  "/missions/surprise",
  "/profile",
  "/plan",
];

for (const route of ROUTES) {
  test(`tide and view enter animate on ${route}`, async ({ page }): Promise<void> => {
    await page.goto(route);
    await waitForScreen(page);
    await expectTideRunning(page);
    const entering: Locator = page.locator("[data-phone-screen] [data-gk-enter]").first();
    if ((await entering.count()) > 0) {
      expect((await animationOf(entering)).name).toBe("gk-enter");
    }
  });
}

test("home mission copy is typed out and the drawer slides", async ({ page }): Promise<void> => {
  await page.goto("/context-switch");
  const screen: Locator = await waitForScreen(page);
  const caret: Locator = screen.locator("[data-gk-mission] [data-gk-caret]");
  const typed: Locator = screen.locator("[data-gk-mission-copy] > span[aria-hidden]");
  const full: string = (await screen.locator("[data-gk-mission-copy] [data-gk-visually-hidden]").textContent()) ?? "";
  expect(full.length).toBeGreaterThan(0);
  if ((await caret.count()) > 0) {
    await expectRunning(caret);
  }
  await expect(typed).toHaveText(full, { timeout: 10_000 });

  const drawer: Locator = page.locator("#family-drawer");
  const duration: string = await drawer.evaluate((p_element: Element): string => getComputedStyle(p_element).transitionDuration);
  expect(duration).not.toMatch(/^0s(, 0s)*$/);
  await screen.locator("[data-phone-hamburger]").click();
  await expect(drawer).toHaveAttribute("data-open", "true");
  await expect
    .poll(async (): Promise<string> => drawer.evaluate((p_element: Element): string => getComputedStyle(p_element).transform))
    .toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
});

test("the calendar sheet slides in with a transition", async ({ page }): Promise<void> => {
  await page.goto("/calendar");
  const screen: Locator = await waitForScreen(page);
  const sheet: Locator = screen.locator("[data-gk-sheet]");
  const duration: string = await sheet.evaluate((p_element: Element): string => getComputedStyle(p_element).transitionDuration);
  expect(duration).not.toBe("0s");
  await screen.locator('[data-gk-action-bar] [data-gk-btn="primary"]').click();
  await expect(screen.locator("[data-gk-sheet-backdrop]")).toHaveAttribute("data-open", "true");
});
