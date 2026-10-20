import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

describe("HolderPolicy", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("allows Parent as titular", async () => {
    // Break: Parent is rejected as titular.
    const { HolderPolicy } = await import("@/app/api/app-users/holder-policy");
    expect(() => {
      HolderPolicy.assertCanBeTitular("Parent");
    }).not.toThrow();
  });

  it("rejects Child as titular", async () => {
    // Break: Child is accepted as titular (INV-002).
    const { HolderPolicy } = await import("@/app/api/app-users/holder-policy");
    expect(() => {
      HolderPolicy.assertCanBeTitular("Child");
    }).toThrow();
  });

  it("allows the holder Parent to change plan", async () => {
    // Break: holder is denied plan change.
    const { HolderPolicy } = await import("@/app/api/app-users/holder-policy");
    expect(() => {
      HolderPolicy.assertCanChangePlan("user-holder-1", "user-holder-1", "Parent");
    }).not.toThrow();
  });

  it("rejects an invited adult Parent from changing plan", async () => {
    // Break: invited adult is allowed to change plan.
    const { HolderPolicy } = await import("@/app/api/app-users/holder-policy");
    expect(() => {
      HolderPolicy.assertCanChangePlan("user-invited-2", "user-holder-1", "Parent");
    }).toThrow();
  });
});
