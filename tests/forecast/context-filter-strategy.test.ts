import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

const WATCH_ID: string = "f43929c0-ec67-51da-aeb9-9e461f57f364";
const RAIN_ID: string = "26533182-4f8b-58e3-83ef-3e551d134baf";

async function createPaperBoatsDraft(): Promise<string> {
  const { DraftMissionFactory } = await import("@/app/api/missions/mission-factory");
  const factory: InstanceType<typeof DraftMissionFactory> = new DraftMissionFactory();
  const created: { id: string } = await factory.create({
    category_id: WATCH_ID,
    title: "Paper boats",
  });
  return created.id;
}

async function publishMission(p_missionId: string): Promise<void> {
  const { ReviewState } = await import("@/app/api/missions/[id]/review-state");
  const { Mission } = await import("@/models/mission");
  const inReview: string = ReviewState.transition("draft", "in_review");
  Mission.instance.updateReviewStatus(p_missionId, inReview);
  const published: string = ReviewState.transition("in_review", "published");
  Mission.instance.updateReviewStatus(p_missionId, published);
}

describe("ContextFilterStrategy", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns a published mission id tagged rain", async () => {
    // Break: published rain-tagged id is missing (INV-001).
    const missionId: string = await createPaperBoatsDraft();
    await publishMission(missionId);
    const { MissionForecastContext } = await import("@/models/mission_forecast_context");
    MissionForecastContext.instance.replaceSet(missionId, [RAIN_ID]);
    const { ContextFilterStrategy } = await import(
      "@/app/api/forecast-contexts/context-filter-strategy"
    );
    const strategy: InstanceType<typeof ContextFilterStrategy> = new ContextFilterStrategy();
    const ids: string[] = strategy.publishedMissionIds(RAIN_ID);
    expect(ids).toEqual([missionId]);
  });

  it("omits an unpublished mission tagged rain", async () => {
    // Break: draft id is returned (INV-005).
    const missionId: string = await createPaperBoatsDraft();
    const { MissionForecastContext } = await import("@/models/mission_forecast_context");
    MissionForecastContext.instance.replaceSet(missionId, [RAIN_ID]);
    const { ContextFilterStrategy } = await import(
      "@/app/api/forecast-contexts/context-filter-strategy"
    );
    const strategy: InstanceType<typeof ContextFilterStrategy> = new ContextFilterStrategy();
    const ids: string[] = strategy.publishedMissionIds(RAIN_ID);
    expect(ids).toEqual([]);
  });

  it("returns an empty list when no published row matches", async () => {
    // Break: strategy invents a mission id (INV-001).
    const { ContextFilterStrategy } = await import(
      "@/app/api/forecast-contexts/context-filter-strategy"
    );
    const strategy: InstanceType<typeof ContextFilterStrategy> = new ContextFilterStrategy();
    const ids: string[] = strategy.publishedMissionIds(RAIN_ID);
    expect(ids).toEqual([]);
  });

  it("treats an injection-shaped context id as data", async () => {
    // Break: concatenated filter drops mission.
    const missionId: string = await createPaperBoatsDraft();
    await publishMission(missionId);
    const { queryRaw } = await import("@/internal/db/connection");
    const { ContextFilterStrategy } = await import(
      "@/app/api/forecast-contexts/context-filter-strategy"
    );
    const strategy: InstanceType<typeof ContextFilterStrategy> = new ContextFilterStrategy();
    const ids: string[] = strategy.publishedMissionIds(
      "26533182-4f8b-58e3-83ef-3e551d134baf'; DROP TABLE mission;--",
    );
    expect(ids).toEqual([]);
    const tables: Array<{ name: string }> = queryRaw<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      ["mission"],
    );
    expect(tables).toEqual([{ name: "mission" }]);
  });
});
