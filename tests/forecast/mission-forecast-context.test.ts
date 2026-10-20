import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

const WATCH_ID: string = "f43929c0-ec67-51da-aeb9-9e461f57f364";
const RAIN_ID: string = "26533182-4f8b-58e3-83ef-3e551d134baf";
const HOLIDAY_ID: string = "4a8e6fcd-1549-5ce9-bcc2-f47370659e34";
const UNKNOWN_CONTEXT_ID: string = "00000000-0000-4000-8000-000000000099";

type LinkRow = {
  mission_id: string;
  context_id: string;
};

async function createDraftMission(): Promise<string> {
  const { DraftMissionFactory } = await import("@/app/api/missions/mission-factory");
  const factory: InstanceType<typeof DraftMissionFactory> = new DraftMissionFactory();
  const created: { id: string } = await factory.create({
    category_id: WATCH_ID,
    title: "Paper boats",
  });
  return created.id;
}

describe("MissionForecastContext Active Record", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("replaces the context set for a mission including drafts", async () => {
    // Break: replaceSet does not persist rain+holiday, or rejects unpublished.
    const missionId: string = await createDraftMission();
    const { MissionForecastContext } = await import("@/models/mission_forecast_context");
    const { queryRaw } = await import("@/internal/db/connection");
    MissionForecastContext.instance.replaceSet(missionId, [RAIN_ID, HOLIDAY_ID]);
    const rows: LinkRow[] = queryRaw<LinkRow>(
      "SELECT mission_id, context_id FROM mission_forecast_context WHERE mission_id = ? ORDER BY context_id",
      [missionId],
    );
    expect(rows).toHaveLength(2);
    expect(rows.map((p_row) => p_row.context_id).sort()).toEqual([HOLIDAY_ID, RAIN_ID].sort());
  });

  it("rejects a duplicate pair in the same set", async () => {
    // Break: duplicate (mission_id, context_id) is stored.
    const missionId: string = await createDraftMission();
    const { MissionForecastContext } = await import("@/models/mission_forecast_context");
    expect(() => {
      MissionForecastContext.instance.replaceSet(missionId, [RAIN_ID, RAIN_ID]);
    }).toThrow();
  });

  it("rejects an unknown context_id", async () => {
    // Break: unknown uuid is stored.
    const missionId: string = await createDraftMission();
    const { MissionForecastContext } = await import("@/models/mission_forecast_context");
    expect(() => {
      MissionForecastContext.instance.replaceSet(missionId, [UNKNOWN_CONTEXT_ID]);
    }).toThrow();
  });

  it("treats an injection-shaped context id as data", async () => {
    // Break: concatenated id drops mission_forecast_context.
    const missionId: string = await createDraftMission();
    const { MissionForecastContext } = await import("@/models/mission_forecast_context");
    const { queryRaw } = await import("@/internal/db/connection");
    expect(() => {
      MissionForecastContext.instance.replaceSet(missionId, [
        "26533182-4f8b-58e3-83ef-3e551d134baf'; DROP TABLE mission_forecast_context;--",
      ]);
    }).toThrow();
    const tables: Array<{ name: string }> = queryRaw<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      ["mission_forecast_context"],
    );
    expect(tables).toEqual([{ name: "mission_forecast_context" }]);
  });
});
