import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeDraftMission,
  arrangePickFamily,
  arrangePublishedMission,
  insertCompletedFamilyMission,
  setMissionRepeatable,
} from "./helpers";

describe("SurpriseSelectionStrategy", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("selects a published catalog id", async () => {
    // Break: surprise selects a draft or invents an id not in mission.
    const arranged = await arrangePickFamily();
    const publishedId: string = await arrangePublishedMission("Surprise picnic");
    const { SurpriseSelectionStrategy } = await import(
      "@/app/api/families/[id]/missions/surprise/selection-strategy"
    );
    const chosen: string | null = new SurpriseSelectionStrategy().choose({
      familyId: arranged.familyId,
    });
    expect(chosen).toBe(publishedId);
  });

  it("returns null when only drafts exist", async () => {
    // Break: empty published set still returns a fabricated catalog id.
    const arranged = await arrangePickFamily();
    await arrangeDraftMission("Draft surprise");
    const { SurpriseSelectionStrategy } = await import(
      "@/app/api/families/[id]/missions/surprise/selection-strategy"
    );
    const chosen: string | null = new SurpriseSelectionStrategy().choose({
      familyId: arranged.familyId,
    });
    expect(chosen).toBeNull();
  });

  it("skips a completed non-repeatable instead of reusing unpublished", async () => {
    // Break: exhausted non-repeatable history falls back to a draft.
    const arranged = await arrangePickFamily();
    const publishedId: string = await arrangePublishedMission("Once only");
    await setMissionRepeatable(publishedId, 0);
    await insertCompletedFamilyMission(arranged.familyId, publishedId);
    const draftId: string = await arrangeDraftMission("Do not reuse");
    const { SurpriseSelectionStrategy } = await import(
      "@/app/api/families/[id]/missions/surprise/selection-strategy"
    );
    const chosen: string | null = new SurpriseSelectionStrategy().choose({
      familyId: arranged.familyId,
    });
    expect(chosen).toBeNull();
    expect(chosen).not.toBe(draftId);
  });

  it("treats an injection-shaped family id as data", async () => {
    // Break: concatenated family id throws 500-equivalent or invents copy.
    await arrangePickFamily();
    const publishedId: string = await arrangePublishedMission("Safe surprise");
    const { SurpriseSelectionStrategy } = await import(
      "@/app/api/families/[id]/missions/surprise/selection-strategy"
    );
    const dirtyId: string = "abc' OR '1'='1";
    const chosen: string | null = new SurpriseSelectionStrategy().choose({ familyId: dirtyId });
    expect(chosen === null || chosen === publishedId).toBe(true);
  });
});
