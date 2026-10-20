import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeCalendarFamily,
  arrangeDraftMission,
  arrangePublishedMission,
  familyRouteParams,
  jsonRequest,
} from "./helpers";

type WeekBody = {
  id?: string;
  suggestions?: Array<{ mission_id?: string; title?: string }>;
  title?: string;
  description?: string;
  error?: string;
};

describe("GET /api/families/[id]/forecast/week", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns a finite published suggestions envelope for Parent", async () => {
    // Break: GET week missing, or envelope is a bare array / includes unpublished.
    const arranged = await arrangeCalendarFamily();
    const publishedId: string = await arrangePublishedMission("Family walk");
    await arrangeDraftMission("Hidden draft");
    const { GET } = await import("@/app/api/families/[id]/forecast/week/route");
    const response: Response = await GET(
      jsonRequest(`/api/families/${arranged.familyId}/forecast/week`, "GET"),
      familyRouteParams(arranged.familyId),
    );
    const body: WeekBody = (await response.json()) as WeekBody;
    expect(response.status).toBe(200);
    expect(typeof body.id).toBe("string");
    expect(Array.isArray(body.suggestions)).toBe(true);
    expect(body.suggestions).toEqual([{ mission_id: publishedId, title: "Family walk" }]);
  });

  it("returns an empty suggestions envelope when nothing is published", async () => {
    // Break: empty catalog invents a suggestion title/description (INV-001).
    const arranged = await arrangeCalendarFamily();
    await arrangeDraftMission("Not ready");
    const { GET } = await import("@/app/api/families/[id]/forecast/week/route");
    const response: Response = await GET(
      jsonRequest(`/api/families/${arranged.familyId}/forecast/week`, "GET"),
      familyRouteParams(arranged.familyId),
    );
    const body: WeekBody = (await response.json()) as WeekBody;
    expect(response.status).toBe(200);
    expect(typeof body.id).toBe("string");
    expect(body.suggestions).toEqual([]);
    expect(typeof body.title === "string" && body.title.length > 0).toBe(false);
    expect(typeof body.description === "string" && body.description.length > 0).toBe(false);
  });

  it("returns 404 for an unknown family", async () => {
    // Break: missing family still returns a week list.
    await arrangeCalendarFamily();
    const { GET } = await import("@/app/api/families/[id]/forecast/week/route");
    const missingId: string = "00000000-0000-4000-8000-000000000404";
    const response: Response = await GET(
      jsonRequest(`/api/families/${missingId}/forecast/week`, "GET"),
      familyRouteParams(missingId),
    );
    expect(response.status).toBe(404);
  });

  it("rejects Child with 403", async () => {
    // Break: Child can read the family forecast week.
    const arranged = await arrangeCalendarFamily();
    await arrangePublishedMission("Child leak");
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Child";
    const { applyRole } = await import("@/app/api/session/presentation-strategy");
    applyRole("Child");
    const { GET } = await import("@/app/api/families/[id]/forecast/week/route");
    const response: Response = await GET(
      jsonRequest(`/api/families/${arranged.familyId}/forecast/week`, "GET"),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(403);
  });
});
