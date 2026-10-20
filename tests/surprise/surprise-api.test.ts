import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeDraftMission,
  arrangePickFamily,
  arrangePublishedMission,
  familyRouteParams,
  jsonRequest,
} from "./helpers";

type SurpriseBody = {
  id?: string;
  mission_id?: string | null;
  status?: string;
  title?: string;
  description?: string | null;
  review_status?: string;
  error?: string;
};

describe("POST /api/families/[id]/missions/surprise", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns one published Accepted family_mission", async () => {
    // Break: POST surprise missing, or copy is free-text instead of catalog fields.
    const arranged = await arrangePickFamily();
    const publishedId: string = await arrangePublishedMission("Mascot picnic");
    const { POST } = await import("@/app/api/families/[id]/missions/surprise/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/missions/surprise`, "POST", {}),
      familyRouteParams(arranged.familyId),
    );
    const body: SurpriseBody = (await response.json()) as SurpriseBody;
    expect(response.status).toBe(200);
    expect(typeof body.id).toBe("string");
    expect(body.mission_id).toBe(publishedId);
    expect(body.status).toBe("Accepted");
    expect(body.title).toBe("Mascot picnic");
    expect(body.review_status).toBe("published");
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: Array<{ status: string }> = queryRaw<{ status: string }>(
      "SELECT status FROM family_mission WHERE id = ?",
      [body.id ?? ""],
    );
    expect(rows[0]?.status).toBe("Accepted");
  });

  it("returns an explicit empty envelope when nothing is published", async () => {
    // Break: empty catalog invents title/description (INV-001).
    const arranged = await arrangePickFamily();
    await arrangeDraftMission("Not for families");
    const { POST } = await import("@/app/api/families/[id]/missions/surprise/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/missions/surprise`, "POST", {}),
      familyRouteParams(arranged.familyId),
    );
    const body: SurpriseBody = (await response.json()) as SurpriseBody;
    expect(response.status).toBe(200);
    expect(typeof body.id).toBe("string");
    expect(body.mission_id).toBeNull();
    expect(typeof body.title === "string" && body.title.length > 0).toBe(false);
    expect(typeof body.description === "string" && body.description.length > 0).toBe(false);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: Array<{ id: string }> = queryRaw<{ id: string }>(
      "SELECT id FROM family_mission WHERE fam_id = ?",
      [arranged.familyId],
    );
    expect(rows).toEqual([]);
  });

  it("rejects Child with 403", async () => {
    // Break: Child can open an Accepted surprise.
    const arranged = await arrangePickFamily();
    await arrangePublishedMission("Child surprise");
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Child";
    const { applyRole } = await import("@/app/api/session/presentation-strategy");
    applyRole("Child");
    const { POST } = await import("@/app/api/families/[id]/missions/surprise/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/missions/surprise`, "POST", {}),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(403);
  });

  it("treats an injection-shaped family id as data", async () => {
    // Break: concatenated id causes 500 or fabricated copy.
    const arranged = await arrangePickFamily();
    await arrangePublishedMission("Safe mascot");
    const { POST } = await import("@/app/api/families/[id]/missions/surprise/route");
    const dirtyId: string = `${arranged.familyId}' OR '1'='1`;
    const response: Response = await POST(
      jsonRequest(`/api/families/${dirtyId}/missions/surprise`, "POST", {}),
      familyRouteParams(dirtyId),
    );
    expect(response.status).not.toBe(500);
    const body: SurpriseBody = (await response.json()) as SurpriseBody;
    expect(typeof body.title === "string" && body.title.length > 0 && body.mission_id === null).toBe(
      false,
    );
  });
});
