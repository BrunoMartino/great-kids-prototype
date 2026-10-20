import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  asStaff,
  getIndicators,
  seedCompletedRows,
  seedRepeatedMission,
  seedScheduledAndDone,
} from "./helpers";

type IndicatorsBody = {
  id?: string;
  scheduled?: number;
  completed?: number;
  repeated?: number;
  error?: string;
};

type CountRow = {
  n: number;
};

type TableRow = {
  name: string;
};

describe("GET /api/panel/indicators", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns zeros on an empty dataset", async () => {
    // Break: empty data is an error splash instead of zeros.
    await asStaff("Operator");
    const response: Response = await getIndicators();
    const body: IndicatorsBody = (await response.json()) as IndicatorsBody;
    expect(response.status).toBe(200);
    expect(body.scheduled).toBe(0);
    expect(body.completed).toBe(0);
    expect(body.repeated).toBe(0);
    expect(typeof body.id).toBe("string");
  });

  it("matches Completed SQL count", async () => {
    // Break: completed count disagrees with family_mission Completed rows.
    await seedCompletedRows(2);
    await asStaff("Operator");
    const { queryRaw } = await import("@/internal/db/connection");
    const sql: CountRow[] = queryRaw<CountRow>(
      "SELECT COUNT(*) AS n FROM family_mission WHERE status = 'Completed'",
      [],
    );
    expect(sql[0]?.n).toBe(2);
    const response: Response = await getIndicators();
    const body: IndicatorsBody = (await response.json()) as IndicatorsBody;
    expect(response.status).toBe(200);
    expect(body.completed).toBe(2);
  });

  it("counts only scheduled suggestion items", async () => {
    // Break: done/moved items are counted as scheduled.
    await seedScheduledAndDone();
    await asStaff("Admin");
    const response: Response = await getIndicators();
    const body: IndicatorsBody = (await response.json()) as IndicatorsBody;
    expect(response.status).toBe(200);
    expect(body.scheduled).toBe(1);
  });

  it("counts a repeatable mission completed twice as repeated", async () => {
    // Break: two Completes of the same mission_id are unique-only (repeated 0).
    await seedRepeatedMission();
    await asStaff("Operator");
    const { queryRaw } = await import("@/internal/db/connection");
    const completed: CountRow[] = queryRaw<CountRow>(
      "SELECT COUNT(*) AS n FROM family_mission WHERE status = 'Completed'",
      [],
    );
    expect(completed[0]?.n).toBe(2);
    const response: Response = await getIndicators();
    const body: IndicatorsBody = (await response.json()) as IndicatorsBody;
    expect(response.status).toBe(200);
    expect(body.completed).toBe(2);
    expect(body.repeated).toBe(1);
  });

  it("does not require an indicators table", async () => {
    // Break: GET 500 unless a fact table named indicators exists.
    await asStaff("Operator");
    const { queryRaw } = await import("@/internal/db/connection");
    const tables: TableRow[] = queryRaw<TableRow>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'indicators'",
      [],
    );
    expect(tables).toEqual([]);
    const response: Response = await getIndicators();
    expect(response.status).toBe(200);
  });
});
