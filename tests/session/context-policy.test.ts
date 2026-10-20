import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

describe("ContextPolicy", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("allows Parent to change plan and invite", async () => {
    // Break: Parent denied
    const { ContextPolicy } = await import("@/policies/role");
    expect(() => {
      ContextPolicy.assertCanChangePlan("Parent");
    }).not.toThrow();
    expect(() => {
      ContextPolicy.assertCanInvite("Parent");
    }).not.toThrow();
  });

  it("rejects Child changing plan", async () => {
    // Break: Child allowed to change plan (INV-002)
    const { ContextPolicy } = await import("@/policies/role");
    expect(() => {
      ContextPolicy.assertCanChangePlan("Child");
    }).toThrow();
  });

  it("rejects Child inviting adults", async () => {
    // Break: Child invite allowed
    const { ContextPolicy } = await import("@/policies/role");
    expect(() => {
      ContextPolicy.assertCanInvite("Child");
    }).toThrow();
  });

  it("rejects missing session", async () => {
    // Break: absent session treated as Parent
    const { ContextPolicy } = await import("@/policies/role");
    expect(() => {
      ContextPolicy.assertSessionPresent(false);
    }).toThrow();
  });
});
