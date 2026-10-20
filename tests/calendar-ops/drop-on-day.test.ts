import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeCalendarFamily,
  arrangeDraftMission,
  arrangePublishedMission,
  calendarRouteParams,
  familyRouteParams,
  jsonRequest,
  putScheduledDay,
} from "./helpers";

type SuggestionItem = {
  id: string;
  mission_id: string;
  status: string;
};

type DayDocument = {
  id?: string;
  family_id?: string;
  day?: string;
  suggestions?: { id: string; suggestions: SuggestionItem[] };
  error?: string;
};

describe("POST /api/families/[id]/forecast/week DropOnDay", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("writes a scheduled suggestion on the chosen day", async () => {
    // Break: drop does not persist a scheduled catalog id on family_calendar.
    const arranged = await arrangeCalendarFamily();
    const missionId: string = await arrangePublishedMission("Kitchen bake");
    const { POST } = await import("@/app/api/families/[id]/forecast/week/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/forecast/week`, "POST", {
        day: "2026-10-22",
        mission_id: missionId,
      }),
      familyRouteParams(arranged.familyId),
    );
    const body: DayDocument = (await response.json()) as DayDocument;
    expect(response.status).toBe(200);
    expect(body.family_id).toBe(arranged.familyId);
    expect(body.day).toBe("2026-10-22");
    expect(body.suggestions?.suggestions.map((p_row: SuggestionItem) => p_row.mission_id)).toEqual([
      missionId,
    ]);
    expect(body.suggestions?.suggestions[0]?.status).toBe("scheduled");
  });

  it("merges onto an existing day instead of conflicting on unique family+day", async () => {
    // Break: second drop on the same day 409s or replaces the first suggestion.
    const arranged = await arrangeCalendarFamily();
    const firstId: string = await arrangePublishedMission("First drop");
    const secondId: string = await arrangePublishedMission("Second drop");
    await putScheduledDay(arranged.familyId, "2026-10-23", "sug-existing", firstId);
    const { POST } = await import("@/app/api/families/[id]/forecast/week/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/forecast/week`, "POST", {
        day: "2026-10-23",
        mission_id: secondId,
      }),
      familyRouteParams(arranged.familyId),
    );
    const body: DayDocument = (await response.json()) as DayDocument;
    expect(response.status).toBe(200);
    const missionIds: string[] =
      body.suggestions?.suggestions.map((p_row: SuggestionItem) => p_row.mission_id) ?? [];
    expect(missionIds).toContain(firstId);
    expect(missionIds).toContain(secondId);
    const { GET } = await import("@/app/api/families/[id]/calendar/[day]/route");
    const stored: Response = await GET(
      jsonRequest(`/api/families/${arranged.familyId}/calendar/2026-10-23`, "GET"),
      calendarRouteParams(arranged.familyId, "2026-10-23"),
    );
    const storedBody: DayDocument = (await stored.json()) as DayDocument;
    expect(storedBody.suggestions?.suggestions.map((p_row: SuggestionItem) => p_row.mission_id)).toEqual(
      expect.arrayContaining([firstId, secondId]),
    );
  });

  it("returns 422 and writes nothing when day is missing", async () => {
    // Break: tap without a day silently picks a day and inserts a calendar row.
    const arranged = await arrangeCalendarFamily();
    const missionId: string = await arrangePublishedMission("No day bake");
    const { POST } = await import("@/app/api/families/[id]/forecast/week/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/forecast/week`, "POST", {
        mission_id: missionId,
      }),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(422);
    const { FamilyCalendar } = await import("@/models/family_calendar");
    expect(FamilyCalendar.instance.findByFamilyDay(arranged.familyId, "2026-10-22")).toBeNull();
  });

  it("returns 422 when the mission is unpublished", async () => {
    // Break: DropOnDay schedules a draft catalog id (INV-001).
    const arranged = await arrangeCalendarFamily();
    const draftId: string = await arrangeDraftMission("Draft drop");
    const { POST } = await import("@/app/api/families/[id]/forecast/week/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/forecast/week`, "POST", {
        day: "2026-10-24",
        mission_id: draftId,
      }),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(422);
    const { FamilyCalendar } = await import("@/models/family_calendar");
    expect(FamilyCalendar.instance.findByFamilyDay(arranged.familyId, "2026-10-24")).toBeNull();
  });
});
