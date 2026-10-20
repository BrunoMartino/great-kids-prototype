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

  it("rejects Parent", async () => {
    // Break: Parent assertStaff succeeds.
    const { PanelPolicy } = await import("@/app/api/panel/panel-policy");
    expect(() => {
      PanelPolicy.assertStaff("Parent");
    }).toThrow();
  });

  it("rejects an empty role", async () => {
    // Break: blank role is treated as staff.
    const { PanelPolicy } = await import("@/app/api/panel/panel-policy");
    expect(() => {
      PanelPolicy.assertStaff("");
    }).toThrow();
  });

  it("rejects Child", async () => {
    // Break: Child assertStaff succeeds (INV-002).
    const { PanelPolicy } = await import("@/app/api/panel/panel-policy");
    expect(() => {
      PanelPolicy.assertStaff("Child");
    }).toThrow();
  });
});
