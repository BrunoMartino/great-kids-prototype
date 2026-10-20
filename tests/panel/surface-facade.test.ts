import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

describe("SurfaceFacade", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("panel surface has no phone chrome", async () => {
    // Break: panel chrome is the iPhone frame.
    const { SurfaceFacade } = await import("@/app/api/panel/surface-facade");
    const facade: InstanceType<typeof SurfaceFacade> = new SurfaceFacade();
    expect(facade.panelSurface().chrome).toBe("none");
  });

  it("family surface uses iPhone 15 Pro Max chrome", async () => {
    // Break: family surface is undecorated like the panel.
    const { SurfaceFacade } = await import("@/app/api/panel/surface-facade");
    const facade: InstanceType<typeof SurfaceFacade> = new SurfaceFacade();
    expect(facade.familySurface().chrome).toBe("iphone-15-pro-max");
  });

  it("allows Operator through the panel facade", async () => {
    // Break: Operator assertPanel throws.
    const { SurfaceFacade } = await import("@/app/api/panel/surface-facade");
    const facade: InstanceType<typeof SurfaceFacade> = new SurfaceFacade();
    expect(() => {
      facade.assertPanel("Operator");
    }).not.toThrow();
  });
});
