import { expect, type Locator, type Page } from "@playwright/test";

/** Family app viewport: the iPhone 15 Pro Max logical screen. */
export const PHONE_VIEWPORT: { width: number; height: number } = { width: 430, height: 932 };

export const SCREENS_DIR: string = "test-results/screens";

/** Desk-only overlays (dev indicator, User/Admin switch) stay out of the comparison shots. */
export const SCREENSHOT_STYLE: string = `
nextjs-portal,
[data-surface-mode-switch] {
  visibility: hidden !important;
}
`;

export type ErrorLog = { messages: string[] };

export function collectErrors(p_page: Page): ErrorLog {
  const log: ErrorLog = { messages: [] };
  p_page.on("console", (p_message): void => {
    if (p_message.type() === "error") {
      log.messages.push(`console: ${p_message.text()}`);
    }
  });
  p_page.on("pageerror", (p_error: Error): void => {
    log.messages.push(`pageerror: ${p_error.message}`);
  });
  return log;
}

/** Waits until no loading card or fallback is busy inside the phone screen. */
export async function waitForScreen(p_page: Page): Promise<Locator> {
  const screen: Locator = p_page.locator("[data-phone-screen]");
  await expect(screen).toBeVisible();
  await expect(screen.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 30_000 });
  await p_page.waitForLoadState("networkidle");
  return screen;
}

/** No horizontal overflow on the page or inside any phone scroll area. */
export async function expectNoHorizontalOverflow(p_page: Page): Promise<void> {
  const offenders: string[] = await p_page.evaluate((): string[] => {
    const found: string[] = [];
    const root: HTMLElement = document.documentElement;
    if (root.scrollWidth > root.clientWidth + 1) {
      found.push(`document ${String(root.scrollWidth)} > ${String(root.clientWidth)}`);
    }
    document.querySelectorAll<HTMLElement>("[data-gk-scroll], [data-gk-sheet], [data-phone-drawer]").forEach(
      (p_element: HTMLElement): void => {
        if (p_element.scrollWidth > p_element.clientWidth + 1) {
          const name: string = p_element.getAttributeNames().find((p_attr: string): boolean => p_attr.startsWith("data-")) ?? p_element.tagName;
          found.push(`${name} ${String(p_element.scrollWidth)} > ${String(p_element.clientWidth)}`);
        }
      },
    );
    return found;
  });
  expect(offenders).toEqual([]);
}

/** Resets the shared mock session to Parent so every test starts from the same view. */
export async function resetParentSession(p_page: Page): Promise<void> {
  const response = await p_page.request.post("/api/session/context", { data: { role: "Parent" } });
  expect(response.ok()).toBe(true);
}
