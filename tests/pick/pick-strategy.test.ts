import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeDraftMission,
  arrangePickFamily,
  arrangePublishedMission,
  RAIN_CONTEXT_ID,
} from "./helpers";

describe("CatalogPickStrategy", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns a published catalog mission id", async () => {
    // Break: pick invents an id or returns a non-catalog row (INV-001).
    const arranged = await arrangePickFamily();
    const publishedId: string = await arrangePublishedMission("Park walk");
    const { CatalogPickStrategy } = await import("@/services/mission_pick/catalog-pick-strategy");
    const strategy: InstanceType<typeof CatalogPickStrategy> = new CatalogPickStrategy();
    const ids: string[] = strategy.filter({
      familyId: arranged.familyId,
    }).map((p_row: { id: string }) => p_row.id);
    expect(ids).toEqual([publishedId]);
  });

  it("omits a draft mission id", async () => {
    // Break: draft id is returned to the family (INV-005).
    const arranged = await arrangePickFamily();
    await arrangeDraftMission("Unreviewed picnic");
    const { CatalogPickStrategy } = await import("@/services/mission_pick/catalog-pick-strategy");
    const strategy: InstanceType<typeof CatalogPickStrategy> = new CatalogPickStrategy();
    const ids: string[] = strategy.filter({
      familyId: arranged.familyId,
    }).map((p_row: { id: string }) => p_row.id);
    expect(ids).toEqual([]);
  });

  it("returns no candidate when the catalog has no published row", async () => {
    // Break: empty catalog still yields a generated title/body (INV-001).
    const arranged = await arrangePickFamily();
    const { CatalogPickStrategy } = await import("@/services/mission_pick/catalog-pick-strategy");
    const strategy: InstanceType<typeof CatalogPickStrategy> = new CatalogPickStrategy();
    const ids: string[] = strategy.filter({
      familyId: arranged.familyId,
    }).map((p_row: { id: string }) => p_row.id);
    expect(ids).toEqual([]);
  });

  it("treats an injection-shaped family id as data", async () => {
    // Break: concatenated family id drops the published row.
    const arranged = await arrangePickFamily();
    const publishedId: string = await arrangePublishedMission("Bound walk");
    const { CatalogPickStrategy } = await import("@/services/mission_pick/catalog-pick-strategy");
    const strategy: InstanceType<typeof CatalogPickStrategy> = new CatalogPickStrategy();
    const ids: string[] = strategy.filter({
      familyId: `${arranged.familyId}' OR '1'='1`,
    }).map((p_row: { id: string }) => p_row.id);
    expect(ids).toEqual([publishedId]);
  });

  it("keeps only published missions tagged with the requested forecast context", async () => {
    // Break: context_id is ignored and an untagged id is returned.
    const arranged = await arrangePickFamily();
    const rainId: string = await arrangePublishedMission("Puddle jump");
    const otherId: string = await arrangePublishedMission("Indoor reading");
    const { MissionForecastContext } = await import("@/models/mission_forecast_context");
    MissionForecastContext.instance.replaceSet(rainId, [RAIN_CONTEXT_ID]);
    const { CatalogPickStrategy } = await import("@/services/mission_pick/catalog-pick-strategy");
    const strategy: InstanceType<typeof CatalogPickStrategy> = new CatalogPickStrategy();
    const ids: string[] = strategy.filter({
      familyId: arranged.familyId,
      contextId: RAIN_CONTEXT_ID,
    }).map((p_row: { id: string }) => p_row.id);
    expect(ids).toEqual([rainId]);
    expect(ids).not.toContain(otherId);
  });

  it("skips a published mission whose age range misses the family ages", async () => {
    // Break: age_min/age_max are ignored and a too-old mission is picked.
    const arranged = await arrangePickFamily();
    const toddlerId: string = await arrangePublishedMission("Toddler craft");
    const tweenId: string = await arrangePublishedMission("Tween debate");
    const { Mission } = await import("@/models/mission");
    Mission.instance.update(toddlerId, { age_min: 3, age_max: 6 });
    Mission.instance.update(tweenId, { age_min: 10, age_max: 12 });
    const { CatalogPickStrategy } = await import("@/services/mission_pick/catalog-pick-strategy");
    const strategy: InstanceType<typeof CatalogPickStrategy> = new CatalogPickStrategy();
    const ids: string[] = strategy.filter({
      familyId: arranged.familyId,
      ages: [5],
    }).map((p_row: { id: string }) => p_row.id);
    expect(ids).toEqual([toddlerId]);
  });

  it("scores with live answers and ignores deleted GPS answers", async () => {
    // Break: deleted quiz_answer still steers pick, or live tastes are ignored.
    const arranged = await arrangePickFamily();
    const hikeId: string = await arrangePublishedMission("Forest hike");
    const bakeId: string = await arrangePublishedMission("Bake bread");
    const { Mission } = await import("@/models/mission");
    const hike = Mission.instance.findById(hikeId);
    const bake = Mission.instance.findById(bakeId);
    if (hike === null || bake === null) {
      throw new Error("expected published fiches");
    }
    Mission.instance.update(hikeId, { values: { id: hike.values.id, values: ["hiking"] } });
    Mission.instance.update(bakeId, { values: { id: bake.values.id, values: ["baking"] } });
    const { FamilyProfile } = await import("@/models/family_profile");
    const profile = FamilyProfile.instance.findByFamilyId(arranged.familyId);
    if (profile === null) {
      throw new Error("expected family profile");
    }
    FamilyProfile.instance.replaceAnswers(arranged.familyId, {
      id: profile.quiz_answer.id,
      answers: [
        { question_id: "q-live", answer_text: "hiking", deleted: false },
        { question_id: "q-dead", answer_text: "baking", deleted: true },
      ],
    });
    const { CatalogPickStrategy } = await import("@/services/mission_pick/catalog-pick-strategy");
    const strategy: InstanceType<typeof CatalogPickStrategy> = new CatalogPickStrategy();
    const ids: string[] = strategy.filter({
      familyId: arranged.familyId,
    }).map((p_row: { id: string }) => p_row.id);
    expect(ids[0]).toBe(hikeId);
    expect(ids).toContain(bakeId);
  });
});
