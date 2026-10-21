import path from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test, type Locator } from "@playwright/test";
import { SCREENS_DIR } from "./helpers";

/** Renders the approved preview phones 1:1 (430 × 932) so they sit next to the app shots. */
const PREVIEW_URL: string = pathToFileURL(
  path.resolve(__dirname, "../../Design-System/design-system-preview.html"),
).href;

const ONE_TO_ONE: string = `
.phones { grid-template-columns: repeat(3, 450px) !important; justify-content: start !important; }
.phone { width: 450px !important; }
.app { transform: none !important; }
`;

test.use({ viewport: { width: 1500, height: 1100 }, colorScheme: "light" });

test("preview phones are captured at the app scale for comparison", async ({ page }): Promise<void> => {
  await page.goto(PREVIEW_URL, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({ content: ONE_TO_ONE });
  await page.waitForTimeout(800);
  for (const name of ["home", "cal", "quiz"]) {
    const screen: Locator = page.locator(`#phone-${name}`).locator("xpath=..");
    await expect(screen).toBeVisible();
    await screen.screenshot({ path: `${SCREENS_DIR}/preview-${name}.png` });
  }
  await page.locator("#phone-home [data-drawer-open]").click();
  await page.waitForTimeout(400);
  await page.locator("#phone-home").locator("xpath=..").screenshot({ path: `${SCREENS_DIR}/preview-home-drawer.png` });
});
