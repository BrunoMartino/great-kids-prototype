import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeCalendarFamily,
  arrangePublishedMission,
  calendarRouteParams,
  familyRouteParams,
  jsonRequest,
} from "./helpers";

type AgendaBody = {
  id?: string;
  days?: Array<{
    day?: string;
    suggestions?: { suggestions?: Array<{ mission_id?: string; status?: string }> };
  }>;
  error?: string;
};

describe("GET /api/families/[id]/calendar agenda list", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns scheduled days for Parent", async () => {
    const arranged = await arrangeCalendarFamily();
    const missionId: string = await arrangePublishedMission("Agenda picnic");
    const { PUT } = await import("@/app/api/families/[id]/calendar/[day]/route");
    const putResponse: Response = await PUT(
      jsonRequest(`/api/families/${arranged.familyId}/calendar/2026-10-22`, "PUT", {
        suggestions: {
          id: crypto.randomUUID(),
          suggestions: [
            {
              id: crypto.randomUUID(),
              mission_id: missionId,
              curated_material_id: null,
              status: "scheduled",
            },
          ],
        },
        previous_weather: null,
        notifications: false,
      }),
      calendarRouteParams(arranged.familyId, "2026-10-22"),
    );
    expect(putResponse.status).toBe(200);

    const { GET } = await import("@/app/api/families/[id]/calendar/route");
    const response: Response = await GET(
      jsonRequest(`/api/families/${arranged.familyId}/calendar`, "GET"),
      familyRouteParams(arranged.familyId),
    );
    const body: AgendaBody = (await response.json()) as AgendaBody;
    expect(response.status).toBe(200);
    expect(body.id).toBe(arranged.familyId);
    expect(body.days?.length).toBeGreaterThanOrEqual(1);
    expect(body.days?.some((p_day) => p_day.day === "2026-10-22")).toBe(true);
  });

  it("rejects Child listing the agenda", async () => {
    const arranged = await arrangeCalendarFamily();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Child";
    const { applyRole } = await import("@/app/api/session/presentation-strategy");
    applyRole("Child");
    const { GET } = await import("@/app/api/families/[id]/calendar/route");
    const response: Response = await GET(
      jsonRequest(`/api/families/${arranged.familyId}/calendar`, "GET"),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(403);
  });
});
