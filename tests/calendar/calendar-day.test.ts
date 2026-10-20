import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeCalendarFamily,
  arrangePublishedMission,
  calendarRouteParams,
  jsonRequest,
} from "./helpers";

type SuggestionItem = {
  id: string;
  mission_id: string;
  curated_material_id: string | null;
  status: string;
};

type DayDocument = {
  id: string;
  family_id: string;
  day: string;
  previous_weather: string | null;
  notifications: boolean;
  suggestions: { id: string; suggestions: SuggestionItem[] };
};

describe("GET/PUT /api/families/[id]/calendar/[day]", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("PUTs a day document with a suggestions envelope", async () => {
    // Break: PUT missing, or suggestions is a bare array.
    const arranged = await arrangeCalendarFamily();
    const missionId: string = await arrangePublishedMission("Park walk");
    const { PUT } = await import("@/app/api/families/[id]/calendar/[day]/route");
    const response: Response = await PUT(
      jsonRequest(`/api/families/${arranged.familyId}/calendar/2026-10-20`, "PUT", {
        previous_weather: "sunny",
        suggestions: {
          id: "sug-env-1",
          suggestions: [
            {
              id: "sug-1",
              mission_id: missionId,
              curated_material_id: null,
              status: "scheduled",
            },
          ],
        },
      }),
      calendarRouteParams(arranged.familyId, "2026-10-20"),
    );
    const body: DayDocument = (await response.json()) as DayDocument;
    expect(response.status).toBe(200);
    expect(body.family_id).toBe(arranged.familyId);
    expect(body.day).toBe("2026-10-20");
    expect(body.previous_weather).toBe("sunny");
    expect(typeof body.suggestions.id).toBe("string");
    expect(body.suggestions.suggestions).toEqual([
      {
        id: "sug-1",
        mission_id: missionId,
        curated_material_id: null,
        status: "scheduled",
      },
    ]);
  });

  it("returns an empty suggestions envelope when the day has no row", async () => {
    // Break: GET missing day is 404 or suggestions is a list root.
    const arranged = await arrangeCalendarFamily();
    const { GET } = await import("@/app/api/families/[id]/calendar/[day]/route");
    const response: Response = await GET(
      jsonRequest(`/api/families/${arranged.familyId}/calendar/2026-10-21`, "GET"),
      calendarRouteParams(arranged.familyId, "2026-10-21"),
    );
    const body: DayDocument = (await response.json()) as DayDocument;
    expect(response.status).toBe(200);
    expect(body.day).toBe("2026-10-21");
    expect(Array.isArray(body.suggestions)).toBe(false);
    expect(body.suggestions.suggestions).toEqual([]);
  });

  it("rejects a second row for the same family+day with 409", async () => {
    // Break: unique (family_id, day) is not enforced on a second insert.
    const arranged = await arrangeCalendarFamily();
    const missionId: string = await arrangePublishedMission("First drop");
    const envelope = {
      id: "sug-env-dup",
      suggestions: [
        {
          id: "sug-dup",
          mission_id: missionId,
          curated_material_id: null,
          status: "scheduled",
        },
      ],
    };
    const { PUT } = await import("@/app/api/families/[id]/calendar/[day]/route");
    const first: Response = await PUT(
      jsonRequest(`/api/families/${arranged.familyId}/calendar/2026-10-22`, "PUT", {
        suggestions: envelope,
      }),
      calendarRouteParams(arranged.familyId, "2026-10-22"),
    );
    expect(first.status).toBe(200);
    const second: Response = await PUT(
      jsonRequest(`/api/families/${arranged.familyId}/calendar/2026-10-22`, "PUT", {
        suggestions: envelope,
      }),
      calendarRouteParams(arranged.familyId, "2026-10-22"),
    );
    expect(second.status).toBe(409);
  });

  it("allows a different day for the same family", async () => {
    // Break: unique is on family_id alone.
    const arranged = await arrangeCalendarFamily();
    const missionId: string = await arrangePublishedMission("Two days");
    const { PUT } = await import("@/app/api/families/[id]/calendar/[day]/route");
    const first: Response = await PUT(
      jsonRequest(`/api/families/${arranged.familyId}/calendar/2026-10-23`, "PUT", {
        suggestions: {
          id: "env-a",
          suggestions: [
            {
              id: "a",
              mission_id: missionId,
              curated_material_id: null,
              status: "scheduled",
            },
          ],
        },
      }),
      calendarRouteParams(arranged.familyId, "2026-10-23"),
    );
    const second: Response = await PUT(
      jsonRequest(`/api/families/${arranged.familyId}/calendar/2026-10-24`, "PUT", {
        suggestions: {
          id: "env-b",
          suggestions: [
            {
              id: "b",
              mission_id: missionId,
              curated_material_id: null,
              status: "done",
            },
          ],
        },
      }),
      calendarRouteParams(arranged.familyId, "2026-10-24"),
    );
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });

  it("rejects a bare suggestions array with 400", async () => {
    // Break: bare array is stored (INV-004).
    const arranged = await arrangeCalendarFamily();
    const { PUT } = await import("@/app/api/families/[id]/calendar/[day]/route");
    const response: Response = await PUT(
      jsonRequest(`/api/families/${arranged.familyId}/calendar/2026-10-25`, "PUT", {
        suggestions: [],
      }),
      calendarRouteParams(arranged.familyId, "2026-10-25"),
    );
    expect(response.status).toBe(400);
  });

  it("treats an injection-shaped day as data", async () => {
    // Break: day string runs as SQL.
    const arranged = await arrangeCalendarFamily();
    const injected: string = "2026-10-26'; DROP TABLE family_calendar;--";
    const { GET } = await import("@/app/api/families/[id]/calendar/[day]/route");
    const response: Response = await GET(
      jsonRequest(`/api/families/${arranged.familyId}/calendar/${injected}`, "GET"),
      calendarRouteParams(arranged.familyId, injected),
    );
    expect(response.status).not.toBe(500);
    const { queryRaw } = await import("@/internal/db/connection");
    const tables: Array<{ name: string }> = queryRaw<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'family_calendar'",
      [],
    );
    expect(tables).toHaveLength(1);
  });
});
