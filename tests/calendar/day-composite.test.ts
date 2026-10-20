import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

describe("DayComposite envelope", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("builds an empty suggestions envelope for a day", async () => {
    // Break: empty day is a bare array or missing suggestions key.
    const { DayComposite } = await import("@/app/api/families/[id]/calendar/day-composite");
    const day = DayComposite.empty("fam-1", "2026-12-01");
    const document = day.toDocument();
    expect(document.family_id).toBe("fam-1");
    expect(document.day).toBe("2026-12-01");
    expect(Array.isArray(document.suggestions)).toBe(false);
    expect(document.suggestions.suggestions).toEqual([]);
  });

  it("rejects a bare suggestions array", async () => {
    // Break: Composite.fromStored accepts [].
    const { DayComposite } = await import("@/app/api/families/[id]/calendar/day-composite");
    expect(() => {
      DayComposite.fromStored({
        id: "cal-1",
        family_id: "fam-1",
        day: "2026-12-02",
        previous_weather: null,
        notifications: 0,
        suggestions: "[]",
      });
    }).toThrow();
  });

  it("keeps scheduled, done, and moved status literals", async () => {
    // Break: unknown status is stored, or done/moved are rewritten.
    const { DayComposite } = await import("@/app/api/families/[id]/calendar/day-composite");
    const day = DayComposite.fromEnvelope("fam-1", "2026-12-03", {
      id: "env-status",
      suggestions: [
        {
          id: "s1",
          mission_id: "m1",
          curated_material_id: null,
          status: "scheduled",
        },
        {
          id: "s2",
          mission_id: "m2",
          curated_material_id: null,
          status: "done",
        },
        {
          id: "s3",
          mission_id: "m3",
          curated_material_id: null,
          status: "moved",
        },
      ],
    });
    expect(day.toDocument().suggestions.suggestions.map((p_row) => p_row.status)).toEqual([
      "scheduled",
      "done",
      "moved",
    ]);
    expect(() => {
      DayComposite.fromEnvelope("fam-1", "2026-12-04", {
        id: "env-bad",
        suggestions: [
          {
            id: "s4",
            mission_id: "m4",
            curated_material_id: null,
            status: "pending",
          },
        ],
      });
    }).toThrow();
  });
});
