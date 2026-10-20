import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeCalendarFamily,
  arrangeDraftMission,
  arrangePublishedMission,
  calendarRouteParams,
  jsonRequest,
} from "./helpers";

describe("ScheduleOnDay rejects unpublished missions", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns 422 when a draft mission_id is scheduled", async () => {
    // Break: unpublished catalog id is stored on the day (INV-001 / INV-005).
    const arranged = await arrangeCalendarFamily();
    const draftId: string = await arrangeDraftMission("Draft picnic");
    const { PUT } = await import("@/app/api/families/[id]/calendar/[day]/route");
    const response: Response = await PUT(
      jsonRequest(`/api/families/${arranged.familyId}/calendar/2026-11-01`, "PUT", {
        suggestions: {
          id: "env-draft",
          suggestions: [
            {
              id: "sug-draft",
              mission_id: draftId,
              curated_material_id: null,
              status: "scheduled",
            },
          ],
        },
      }),
      calendarRouteParams(arranged.familyId, "2026-11-01"),
    );
    expect(response.status).toBe(422);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: Array<{ n: number }> = queryRaw<{ n: number }>(
      "SELECT count(*) AS n FROM family_calendar WHERE family_id = ? AND day = ?",
      [arranged.familyId, "2026-11-01"],
    );
    expect(rows[0].n).toBe(0);
  });

  it("accepts a published mission_id as scheduled", async () => {
    // Break: published id is rejected the same as draft.
    const arranged = await arrangeCalendarFamily();
    const publishedId: string = await arrangePublishedMission("Published picnic");
    const { PUT } = await import("@/app/api/families/[id]/calendar/[day]/route");
    const response: Response = await PUT(
      jsonRequest(`/api/families/${arranged.familyId}/calendar/2026-11-02`, "PUT", {
        suggestions: {
          id: "env-pub",
          suggestions: [
            {
              id: "sug-pub",
              mission_id: publishedId,
              curated_material_id: null,
              status: "scheduled",
            },
          ],
        },
      }),
      calendarRouteParams(arranged.familyId, "2026-11-02"),
    );
    expect(response.status).toBe(200);
  });

  it("rejects a moved suggestion that still points at a draft id", async () => {
    // Break: status moved skips the published check.
    const arranged = await arrangeCalendarFamily();
    const draftId: string = await arrangeDraftMission("Moved draft");
    const { PUT } = await import("@/app/api/families/[id]/calendar/[day]/route");
    const response: Response = await PUT(
      jsonRequest(`/api/families/${arranged.familyId}/calendar/2026-11-03`, "PUT", {
        suggestions: {
          id: "env-moved",
          suggestions: [
            {
              id: "sug-moved",
              mission_id: draftId,
              curated_material_id: null,
              status: "moved",
            },
          ],
        },
      }),
      calendarRouteParams(arranged.familyId, "2026-11-03"),
    );
    expect(response.status).toBe(422);
  });
});
