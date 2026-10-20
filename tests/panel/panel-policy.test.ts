import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

describe("PanelPolicy", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("allows Admin and Operator", async () => {
    // Break: Admin or Operator assertStaff throws.
    const { PanelPolicy } = await import("@/app/api/panel/panel-policy");
    expect(() => {
      PanelPolicy.assertStaff("Admin");
    }).not.toThrow();
    expect(() => {
      PanelPolicy.assertStaff("Operator");
    }).not.toThrow();
  });
});
