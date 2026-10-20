import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

const WATCH_ID: string = "f43929c0-ec67-51da-aeb9-9e461f57f364";
const UNKNOWN_CATEGORY_ID: string = "00000000-0000-4000-8000-000000000001";

type MissionRow = {
  id: string;
  title: string;
  category_id: string;
  review_status: string;
  value_json: string;
};

type ValuesEnvelope = {
  id: string;
  values: unknown[];
};

describe("MissionFactory", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("creates a draft mission with a values envelope", async () => {
    // Break: published by default, or values is a bare array, or missing category_id allowed.
    const { DraftMissionFactory } = await import("@/app/api/missions/mission-factory");
    const { queryRaw } = await import("@/internal/db/connection");
    const factory: InstanceType<typeof DraftMissionFactory> = new DraftMissionFactory();
    const created: { id: string } = await factory.create({
      category_id: WATCH_ID,
      title: "Paper boats",
    });
    const rows: MissionRow[] = queryRaw<MissionRow>(
      'SELECT id, title, category_id, review_status, "values" AS value_json FROM mission WHERE id = ?',
      [created.id],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].review_status).toBe("draft");
    expect(rows[0].category_id).toBe(WATCH_ID);
    const values: ValuesEnvelope = JSON.parse(rows[0].value_json) as ValuesEnvelope;
    expect(typeof values.id).toBe("string");
    expect(values.values).toEqual([]);
  });

  it("rejects an unknown category_id", async () => {
    // Break: mission stored with missing FK.
    const { DraftMissionFactory } = await import("@/app/api/missions/mission-factory");
    const factory: InstanceType<typeof DraftMissionFactory> = new DraftMissionFactory();
    await expect(
      factory.create({
        category_id: UNKNOWN_CATEGORY_ID,
        title: "Ghost",
      }),
    ).rejects.toThrow();
  });

  it("rejects a missing category_id", async () => {
    // Break: insert succeeds without category.
    const { DraftMissionFactory } = await import("@/app/api/missions/mission-factory");
    const factory: InstanceType<typeof DraftMissionFactory> = new DraftMissionFactory();
    await expect(
      factory.create({
        title: "No category",
      }),
    ).rejects.toThrow();
  });
});
