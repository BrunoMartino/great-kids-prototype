import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeFamilyViaHusk, FREE_PLAN_ID } from "./helpers";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type PlanRecord = {
  id: string;
  name: string;
  status: string;
};

type FamilyPlanRow = {
  plan_id: string | null;
};

type SqliteMasterRow = {
  name: string;
};

describe("Plan Active Record", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("finds the seeded Free plan", async () => {
    // Break: Free seed is missing or name is not the literal Free.
    const { getConnection } = await import("@/internal/db/connection");
    getConnection();
    const { Plan } = await import("@/models/plan");
    const free: PlanRecord = Plan.instance.findFree() as PlanRecord;
    expect(free.name).toBe("Free");
    expect(free.id).toBe(FREE_PLAN_ID);
  });

  it("rejects deleting a plan still referenced by family.plan_id", async () => {
    // Break: referenced plan row is deleted (RESTRICT ignored).
    const arranged = await arrangeFamilyViaHusk();
    const { Plan } = await import("@/models/plan");
    const { Family } = await import("@/models/family");
    Family.instance.updatePlanId(arranged.familyId, FREE_PLAN_ID);
    expect(() => {
      Plan.instance.delete(FREE_PLAN_ID);
    }).toThrow();
  });

  it("returns null for an unknown plan id", async () => {
    // Break: findById invents a row for a missing uuid.
    const { getConnection } = await import("@/internal/db/connection");
    getConnection();
    const { Plan } = await import("@/models/plan");
    const missing: PlanRecord | null = Plan.instance.findById(
      "00000000-0000-4000-8000-000000000000",
    );
    expect(missing).toBeNull();
  });

  it("treats an injection-shaped name as a lookup key", async () => {
    // Break: findByName concatenates SQL so plan is dropped.
    const { getConnection, queryRaw } = await import("@/internal/db/connection");
    getConnection();
    const { Plan } = await import("@/models/plan");
    const injectedName: string = "Free'; DROP TABLE plan;--";
    Plan.instance.findByName(injectedName);
    const tables: SqliteMasterRow[] = queryRaw<SqliteMasterRow>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      ["plan"],
    );
    expect(tables).toEqual([{ name: "plan" }]);
  });

  it("updates family.plan_id to Free and rejects an unknown plan_id", async () => {
    // Break: updatePlanId does not persist Free, or unknown uuid is stored.
    const arranged = await arrangeFamilyViaHusk();
    const { Family } = await import("@/models/family");
    const { queryRaw } = await import("@/internal/db/connection");
    Family.instance.updatePlanId(arranged.familyId, FREE_PLAN_ID);
    const rows: FamilyPlanRow[] = queryRaw<FamilyPlanRow>(
      "SELECT plan_id FROM family WHERE id = ?",
      [arranged.familyId],
    );
    expect(rows[0].plan_id).toBe(FREE_PLAN_ID);
    expect(() => {
      Family.instance.updatePlanId(
        arranged.familyId,
        "00000000-0000-4000-8000-000000000099",
      );
    }).toThrow();
  });
});
