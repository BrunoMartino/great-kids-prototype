import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeCalendarFamily,
  arrangePublishedMission,
  calendarRouteParams,
  jsonRequest,
  putScheduledDay,
  suggestionRouteParams,
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
};

type PatchBody = {
  days?: DayDocument[];
  proposal?: { source_mission_id: string; weekday: string } | null;
  error?: string;
};

describe("PATCH /api/families/[id]/calendar/[day]/suggestions/[sid]", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("persists done on the suggestion", async () => {
    // Break: PATCH status is ignored and the leaf stays scheduled.
    const arranged = await arrangeCalendarFamily();
    const missionId: string = await arrangePublishedMission("Mark done walk");
    await putScheduledDay(arranged.familyId, "2026-10-20", "sug-done", missionId);
    const { PATCH } = await import(
      "@/app/api/families/[id]/calendar/[day]/suggestions/[sid]/route"
    );
    const response: Response = await PATCH(
      jsonRequest(
        `/api/families/${arranged.familyId}/calendar/2026-10-20/suggestions/sug-done`,
        "PATCH",
        { status: "done" },
      ),
      suggestionRouteParams(arranged.familyId, "2026-10-20", "sug-done"),
    );
    const body: PatchBody = (await response.json()) as PatchBody;
    expect(response.status).toBe(200);
    const source: DayDocument | undefined = body.days?.find(
      (p_day: DayDocument) => p_day.day === "2026-10-20",
    );
    expect(source?.suggestions?.suggestions).toEqual([
      expect.objectContaining({ id: "sug-done", mission_id: missionId, status: "done" }),
    ]);
  });

  it("merges a moved suggestion into an existing target day", async () => {
    // Break: move inserts a second (family_id, day) row or drops the target's existing leaf.
    const arranged = await arrangeCalendarFamily();
    const movingId: string = await arrangePublishedMission("Moving walk");
    const stayingId: string = await arrangePublishedMission("Staying walk");
    await putScheduledDay(arranged.familyId, "2026-10-20", "sug-move", movingId);
    await putScheduledDay(arranged.familyId, "2026-10-21", "sug-stay", stayingId);
    const { PATCH } = await import(
      "@/app/api/families/[id]/calendar/[day]/suggestions/[sid]/route"
    );
    const response: Response = await PATCH(
      jsonRequest(
        `/api/families/${arranged.familyId}/calendar/2026-10-20/suggestions/sug-move`,
        "PATCH",
        { status: "moved", target_day: "2026-10-21" },
      ),
      suggestionRouteParams(arranged.familyId, "2026-10-20", "sug-move"),
    );
    expect(response.status).toBe(200);
    const { GET } = await import("@/app/api/families/[id]/calendar/[day]/route");
    const target: DayDocument = (await (
      await GET(
        jsonRequest(`/api/families/${arranged.familyId}/calendar/2026-10-21`, "GET"),
        calendarRouteParams(arranged.familyId, "2026-10-21"),
      )
    ).json()) as DayDocument;
    const targetMissions: string[] =
      target.suggestions?.suggestions.map((p_row: SuggestionItem) => p_row.mission_id) ?? [];
    expect(targetMissions).toContain(movingId);
    expect(targetMissions).toContain(stayingId);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: Array<{ n: number }> = queryRaw<{ n: number }>(
      "SELECT COUNT(*) AS n FROM family_calendar WHERE family_id = ? AND day = ?",
      [arranged.familyId, "2026-10-21"],
    );
    expect(rows[0]?.n).toBe(1);
  });

  it("returns 422 when moved is missing target_day", async () => {
    // Break: move without a target still rewrites the source as done or invents a day.
    const arranged = await arrangeCalendarFamily();
    const missionId: string = await arrangePublishedMission("No target walk");
    await putScheduledDay(arranged.familyId, "2026-10-20", "sug-notarget", missionId);
    const { PATCH } = await import(
      "@/app/api/families/[id]/calendar/[day]/suggestions/[sid]/route"
    );
    const response: Response = await PATCH(
      jsonRequest(
        `/api/families/${arranged.familyId}/calendar/2026-10-20/suggestions/sug-notarget`,
        "PATCH",
        { status: "moved" },
      ),
      suggestionRouteParams(arranged.familyId, "2026-10-20", "sug-notarget"),
    );
    expect(response.status).toBe(422);
    const { GET } = await import("@/app/api/families/[id]/calendar/[day]/route");
    const stored: DayDocument = (await (
      await GET(
        jsonRequest(`/api/families/${arranged.familyId}/calendar/2026-10-20`, "GET"),
        calendarRouteParams(arranged.familyId, "2026-10-20"),
      )
    ).json()) as DayDocument;
    expect(stored.suggestions?.suggestions[0]?.status).toBe("scheduled");
  });

  it("rejects Child with 403", async () => {
    // Break: Child can mark a suggestion done.
    const arranged = await arrangeCalendarFamily();
    const missionId: string = await arrangePublishedMission("Child patch");
    await putScheduledDay(arranged.familyId, "2026-10-20", "sug-child", missionId);
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Child";
    const { applyRole } = await import("@/app/api/session/presentation-strategy");
    applyRole("Child");
    const { PATCH } = await import(
      "@/app/api/families/[id]/calendar/[day]/suggestions/[sid]/route"
    );
    const response: Response = await PATCH(
      jsonRequest(
        `/api/families/${arranged.familyId}/calendar/2026-10-20/suggestions/sug-child`,
        "PATCH",
        { status: "done" },
      ),
      suggestionRouteParams(arranged.familyId, "2026-10-20", "sug-child"),
    );
    expect(response.status).toBe(403);
  });
});
