import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangePickFamily,
  arrangePublishedMission,
  insertCompletedFamilyMission,
  setMissionRepeatable,
} from "./helpers";

describe("CatalogPickStrategy history skip", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("skips a recently completed non-repeatable mission and returns the other published id", async () => {
    // Break: recent Completed non-repeatable is picked again.
    const arranged = await arrangePickFamily();
    const usedId: string = await arrangePublishedMission("Once only");
    const otherId: string = await arrangePublishedMission("Still available");
    await insertCompletedFamilyMission(arranged.familyId, usedId);
    const { CatalogPickStrategy } = await import("@/services/mission_pick/catalog-pick-strategy");
    const strategy: InstanceType<typeof CatalogPickStrategy> = new CatalogPickStrategy();
    const ids: string[] = strategy.filter({
      familyId: arranged.familyId,
    }).map((p_row: { id: string }) => p_row.id);
    expect(ids).toEqual([otherId]);
  });

  it("keeps a recently completed repeatable mission eligible", async () => {
    // Break: repeatable history is treated as a skip.
    const arranged = await arrangePickFamily();
    const repeatableId: string = await arrangePublishedMission("Bedtime story");
    await setMissionRepeatable(repeatableId, 1);
    await insertCompletedFamilyMission(arranged.familyId, repeatableId);
    const { CatalogPickStrategy } = await import("@/services/mission_pick/catalog-pick-strategy");
    const strategy: InstanceType<typeof CatalogPickStrategy> = new CatalogPickStrategy();
    const ids: string[] = strategy.filter({
      familyId: arranged.familyId,
    }).map((p_row: { id: string }) => p_row.id);
    expect(ids).toEqual([repeatableId]);
  });

  it("returns no candidate when the only published row is a skipped non-repeatable", async () => {
    // Break: skipped history still yields a generated mission (INV-001).
    const arranged = await arrangePickFamily();
    const usedId: string = await arrangePublishedMission("Spent");
    await insertCompletedFamilyMission(arranged.familyId, usedId);
    const { CatalogPickStrategy } = await import("@/services/mission_pick/catalog-pick-strategy");
    const strategy: InstanceType<typeof CatalogPickStrategy> = new CatalogPickStrategy();
    const ids: string[] = strategy.filter({
      familyId: arranged.familyId,
    }).map((p_row: { id: string }) => p_row.id);
    expect(ids).toEqual([]);
  });

  it("treats an injection-shaped family id as data when reading history", async () => {
    // Break: concatenated fam_id skips every mission.
    const arranged = await arrangePickFamily();
    const usedId: string = await arrangePublishedMission("Bound history");
    const otherId: string = await arrangePublishedMission("Other walk");
    await insertCompletedFamilyMission(arranged.familyId, usedId);
    const { CatalogPickStrategy } = await import("@/services/mission_pick/catalog-pick-strategy");
    const strategy: InstanceType<typeof CatalogPickStrategy> = new CatalogPickStrategy();
    const ids: string[] = strategy.filter({
      familyId: `${arranged.familyId}' OR '1'='1`,
    }).map((p_row: { id: string }) => p_row.id);
    expect([...ids].sort()).toEqual([usedId, otherId].sort());
  });
});
