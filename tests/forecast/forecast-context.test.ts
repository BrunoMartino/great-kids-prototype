import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

const RAIN_ID: string = "26533182-4f8b-58e3-83ef-3e551d134baf";
const HOLIDAY_ID: string = "4a8e6fcd-1549-5ce9-bcc2-f47370659e34";
const CHRISTMAS_ID: string = "7c17c48d-fb07-5e87-8600-2c159a549832";
const BACK_TO_SCHOOL_ID: string = "2ff3462e-70ba-5dca-b4ce-992c39a414c6";

type ForecastContextRecord = {
  id: string;
  slug: string;
  name: string;
};

describe("ForecastContext Active Record", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("lists the four seeded slugs", async () => {
    // Break: seed count is not 4 or slugs drift.
    const { getConnection } = await import("@/internal/db/connection");
    getConnection();
    const { ForecastContext } = await import("@/models/forecast_context");
    const rows: ForecastContextRecord[] = ForecastContext.instance.list();
    expect(rows).toHaveLength(4);
    expect(rows.map((p_row) => p_row.slug).sort()).toEqual(
      ["back-to-school", "christmas", "holiday", "rain"].sort(),
    );
  });

  it("finds rain by slug with the Wave 0 id", async () => {
    // Break: rain seed id or name is wrong.
    const { getConnection } = await import("@/internal/db/connection");
    getConnection();
    const { ForecastContext } = await import("@/models/forecast_context");
    const rain: ForecastContextRecord | null = ForecastContext.instance.findBySlug("rain");
    expect(rain).toEqual({ id: RAIN_ID, slug: "rain", name: "Rain" });
  });

  it("returns null for an unknown slug", async () => {
    // Break: findBySlug invents a row.
    const { getConnection } = await import("@/internal/db/connection");
    getConnection();
    const { ForecastContext } = await import("@/models/forecast_context");
    expect(ForecastContext.instance.findBySlug("snow")).toBeNull();
  });

  it("treats an injection-shaped slug as a lookup key", async () => {
    // Break: slug is concatenated so forecast_context is dropped.
    const { getConnection, queryRaw } = await import("@/internal/db/connection");
    getConnection();
    const { ForecastContext } = await import("@/models/forecast_context");
    ForecastContext.instance.findBySlug("rain'; DROP TABLE forecast_context;--");
    const tables: Array<{ name: string }> = queryRaw<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      ["forecast_context"],
    );
    expect(tables).toEqual([{ name: "forecast_context" }]);
    expect(ForecastContext.instance.findById(HOLIDAY_ID)?.slug).toBe("holiday");
    expect(ForecastContext.instance.findById(CHRISTMAS_ID)?.slug).toBe("christmas");
    expect(ForecastContext.instance.findById(BACK_TO_SCHOOL_ID)?.slug).toBe("back-to-school");
  });
});
