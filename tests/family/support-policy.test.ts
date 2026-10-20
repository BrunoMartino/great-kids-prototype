import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

describe("SupportPolicy", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("allows Operator and Admin on the panel", async () => {
    // Break: Operator or Admin assertPanel throws.
    const { SupportPolicy } = await import("@/app/api/panel/families/support-policy");
    expect(() => {
      SupportPolicy.assertPanel("Operator");
    }).not.toThrow();
    expect(() => {
      SupportPolicy.assertPanel("Admin");
    }).not.toThrow();
  });

  it("lets only the titular Parent change the family plan", async () => {
    // Break: invited Parent can change plan, or titular is denied.
    const { SupportPolicy } = await import("@/app/api/panel/families/support-policy");
    const holderId: string = "holder-ana-1";
    expect(() => {
      SupportPolicy.assertCanChangeFamilyPlan(holderId, holderId, "Parent");
    }).not.toThrow();
    expect(() => {
      SupportPolicy.assertCanChangeFamilyPlan("invited-bia-2", holderId, "Parent");
    }).toThrow();
  });
});
