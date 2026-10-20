import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeDraftMission,
  arrangePickFamily,
  arrangePublishedMission,
  familyRouteParams,
  jsonRequest,
} from "./helpers";

type PickBody = {
  id?: string;
  mission_id?: string;
  title?: string;
  body?: string;
  error?: string;
};

describe("POST /api/families/[id]/missions/pick", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns a published catalog mission_id for Parent", async () => {
    // Break: POST pick missing, or response is free-text copy instead of a catalog id.
    const arranged = await arrangePickFamily();
    const publishedId: string = await arrangePublishedMission("Family walk");
    const { POST } = await import("@/app/api/families/[id]/missions/pick/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/missions/pick`, "POST", {}),
      familyRouteParams(arranged.familyId),
    );
    const body: PickBody = (await response.json()) as PickBody;
    expect(response.status).toBe(200);
    expect(typeof body.id).toBe("string");
    expect(body.mission_id).toBe(publishedId);
    expect(body.title).toBeUndefined();
    expect(body.body).toBeUndefined();
  });

  it("returns an error without title or body when no published candidate exists", async () => {
    // Break: empty catalog invents a mission title/body (INV-001).
    const arranged = await arrangePickFamily();
    await arrangeDraftMission("Still a draft");
    const { POST } = await import("@/app/api/families/[id]/missions/pick/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/missions/pick`, "POST", {}),
      familyRouteParams(arranged.familyId),
    );
    const body: PickBody = (await response.json()) as PickBody;
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(body.mission_id).toBeUndefined();
    expect(body.title).toBeUndefined();
    expect(body.body).toBeUndefined();
    expect(typeof body.error).toBe("string");
  });

  it("rejects Child with 403", async () => {
    // Break: Child can pick a family mission.
    const arranged = await arrangePickFamily();
    await arrangePublishedMission("Child leak");
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Child";
    const { applyRole } = await import("@/app/api/session/presentation-strategy");
    applyRole("Child");
    const { POST } = await import("@/app/api/families/[id]/missions/pick/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/missions/pick`, "POST", {}),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(403);
  });

  it("treats an injection-shaped family id as data", async () => {
    // Break: concatenated id causes 500 or drops the family row.
    const arranged = await arrangePickFamily();
    await arrangePublishedMission("Safe pick");
    const { POST } = await import("@/app/api/families/[id]/missions/pick/route");
    const dirtyId: string = `${arranged.familyId}' OR '1'='1`;
    const response: Response = await POST(
      jsonRequest(`/api/families/${dirtyId}/missions/pick`, "POST", {}),
      familyRouteParams(dirtyId),
    );
    expect(response.status).not.toBe(500);
    const body: PickBody = (await response.json()) as PickBody;
    expect(body.title).toBeUndefined();
    expect(body.body).toBeUndefined();
  });
});
