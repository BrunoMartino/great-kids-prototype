import { expect, test } from "@playwright/test";

type Edge = { name: string; left: number; right: number };

const ROUTES: readonly string[] = ["/catalog", "/materials", "/plans"];
const WIDTHS: readonly number[] = [1440, 1280, 1024];

for (const width of WIDTHS) {
  for (const route of ROUTES) {
    test(`panel ${route} blocks share one container edge at ${String(width)}px`, async ({ page }): Promise<void> => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(route);
      const table = page.locator("[data-panel-page] [data-panel-table-wrap]");
      await page.waitForLoadState("networkidle");
      if ((await table.count()) === 0) {
        // The staff session is shared: make sure the Admin role is selected.
        await page.locator("[data-staff-toolbar] button", { hasText: "Admin" }).click();
      }
      await expect(table).toBeVisible({ timeout: 30_000 });
      const edges: Edge[] = await page.evaluate((): Edge[] => {
        const names: readonly string[] = [
          "[data-panel-page]",
          "[data-panel-page] [data-panel-toolbar]",
          "[data-panel-page] h1",
          "[data-panel-page] [data-panel-form]",
          "[data-panel-page] [data-panel-table-wrap]",
        ];
        return names.flatMap((p_selector: string): Edge[] => {
          const element: Element | null = document.querySelector(p_selector);
          if (element === null) {
            return [];
          }
          const box: DOMRect = element.getBoundingClientRect();
          return [{ name: p_selector, left: box.left, right: box.right }];
        });
      });
      expect(edges.length).toBe(5);
      const pageEdge: Edge | undefined = edges[0];
      for (const edge of edges) {
        expect(Math.abs(edge.left - (pageEdge?.left ?? 0)), `${edge.name} left edge`).toBeLessThanOrEqual(1);
      }
      for (const edge of edges.filter((p_edge: Edge): boolean => /form|table-wrap/.test(p_edge.name))) {
        expect(Math.abs(edge.right - (pageEdge?.right ?? 0)), `${edge.name} right edge`).toBeLessThanOrEqual(1);
      }
      // Create form: the first two fields (Type | Title, Category | Title, Name | Status) share one label row.
      const labelTops: number[] = await page
        .locator("[data-panel-form] > [data-panel-field] > span:first-child")
        .evaluateAll((p_labels: Element[]): number[] => p_labels.slice(0, 2).map((p_label: Element): number => p_label.getBoundingClientRect().top));
      expect(labelTops).toHaveLength(2);
      expect(Math.abs((labelTops[0] ?? 0) - (labelTops[1] ?? 0))).toBeLessThanOrEqual(1);
      await expect(page.locator("[data-panel-form] [data-panel-form-head] h2")).toBeVisible();
      const actions = page.locator("[data-panel-form] [data-panel-form-actions] button[type=\"submit\"]");
      await expect(actions).toHaveText("Create");
      const formBox = await page.locator("[data-panel-page] [data-panel-form]").boundingBox();
      const submitBox = await actions.boundingBox();
      if (formBox !== null && submitBox !== null) {
        expect(formBox.x + formBox.width - (submitBox.x + submitBox.width)).toBeLessThanOrEqual(24);
      }
      // Row tooltips stay hidden until hover, also with reduced motion.
      const tooltipOpacity: string | null = await page.evaluate((): string | null => {
        const element: Element | null = document.querySelector("[data-panel-page] [data-tooltip]");
        return element === null ? null : getComputedStyle(element, "::after").opacity;
      });
      if (tooltipOpacity !== null) {
        expect(tooltipOpacity).toBe("0");
      }
    });
  }
}
