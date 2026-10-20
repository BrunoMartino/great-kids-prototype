import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

describe("GpsPolicy", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("allows Parent to edit GPS and rejects Child wipe", async () => {
    // Break: Child is allowed to mutate answers, or Parent is denied.
    const { GpsPolicy } = await import("@/app/api/families/[id]/profile/gps-policy");
    expect(() => {
      GpsPolicy.assertCanEdit("Parent");
    }).not.toThrow();
    expect(() => {
      GpsPolicy.assertCanEdit("Child");
    }).toThrow();
  });

  it("allows Parent and Child to answer the quiz", async () => {
    // Break: Child cannot POST answers, or Admin is treated as family.
    const { GpsPolicy } = await import("@/app/api/families/[id]/profile/gps-policy");
    expect(() => {
      GpsPolicy.assertCanAnswer("Parent");
    }).not.toThrow();
    expect(() => {
      GpsPolicy.assertCanAnswer("Child");
    }).not.toThrow();
    expect(() => {
      GpsPolicy.assertCanAnswer("Admin");
    }).toThrow();
  });
});
