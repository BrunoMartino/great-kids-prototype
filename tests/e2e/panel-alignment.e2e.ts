import { expect, test } from "@playwright/test";

type Edge = { name: string; left: number; right: number };

const ROUTES: readonly string[] = ["/catalog", "/materials", "/plans"];
const WIDTHS: readonly number[] = [1440, 1280, 1024];

for (const width of WIDTHS) {
  for (const route of ROUTES) {
    test(`panel ${route} blocks share one container edge at ${String(width)}px`, async ({ page }): Promise<void> => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(route);
      await expect(page.locator("[data-panel-page] [data-panel-table-wrap]")).toBeVisible({ timeout: 30_000 });
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
