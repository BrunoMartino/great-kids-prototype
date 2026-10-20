import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeAcceptedCycle,
  familyRouteParams,
  getCompleted,
  jsonRequest,
  patchCycle,
} from "./helpers";

type HistoryBody = {
  id?: string;
  missions?: Array<{
    id: string;
    mission_id: string;
    status: string;
    title: string;
    completed_at: string | null;
    closing: { do_again: boolean; save_memory: boolean } | null;
  }>;
  error?: string;
};

describe("GET /api/families/[id]/missions?status=Completed", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("lists only Completed rows for the family", async () => {
    // Break: GET includes Accepted/Doing or omits Completed.
    const arranged = await arrangeAcceptedCycle("History picnic");
    await patchCycle(arranged.cycleId, { status: "Doing" });
    await patchCycle(arranged.cycleId, {
      status: "Completed",
      closing: { do_again: true, save_memory: false },
    });
    const { arrangePublishedMission } = await import("../pick/helpers");
    const openMissionId: string = await arrangePublishedMission("Still open");
    const { AcceptedFamilyMissionFactory } = await import(
      "@/app/api/families/[id]/missions/surprise/accepted-factory"
    );
    const open: { id: string } = await new AcceptedFamilyMissionFactory().create(
      arranged.familyId,
      openMissionId,
    );
    await patchCycle(open.id, { status: "Doing" });
    const response: Response = await getCompleted(arranged.familyId);
    const body: HistoryBody = (await response.json()) as HistoryBody;
    expect(response.status).toBe(200);
    expect(body.id).toBe(arranged.familyId);
    expect(body.missions).toEqual([
      expect.objectContaining({
        id: arranged.cycleId,
        mission_id: arranged.missionId,
        status: "Completed",
        closing: { do_again: true, save_memory: false },
      }),
    ]);
  });

  it("returns an empty missions envelope when the family has no Completed rows", async () => {
    // Break: empty history is an error splash or a bare array.
    const arranged = await arrangeAcceptedCycle("Not done yet");
    const response: Response = await getCompleted(arranged.familyId);
    const body: HistoryBody = (await response.json()) as HistoryBody;
    expect(response.status).toBe(200);
    expect(body).toEqual({ id: arranged.familyId, missions: [] });
  });

  it("keeps the stored title after the catalog is unpublished", async () => {
    // Break: GET joins live published catalog and hides the historical title.
    const arranged = await arrangeAcceptedCycle("Park boats");
    await patchCycle(arranged.cycleId, { status: "Doing" });
    await patchCycle(arranged.cycleId, {
      status: "Completed",
      closing: { do_again: false, save_memory: true },
    });
    const { queryRaw } = await import("@/internal/db/connection");
    queryRaw("UPDATE mission SET review_status = 'draft' WHERE id = ?", [arranged.missionId]);
    const response: Response = await getCompleted(arranged.familyId);
    const body: HistoryBody = (await response.json()) as HistoryBody;
    expect(body.missions).toEqual([
      expect.objectContaining({
        id: arranged.cycleId,
        title: "Park boats",
        status: "Completed",
      }),
    ]);
  });

  it("treats an injection-shaped family id as data", async () => {
    // Break: concatenated fam_id causes 500 or leaks another family's Completed rows.
    const arranged = await arrangeAcceptedCycle("Safe history");
    await patchCycle(arranged.cycleId, { status: "Doing" });
    await patchCycle(arranged.cycleId, {
      status: "Completed",
      closing: { do_again: false, save_memory: false },
    });
    const dirtyId: string = `${arranged.familyId}' OR '1'='1`;
    const { GET } = await import("@/app/api/families/[id]/missions/route");
    const response: Response = await GET(
      jsonRequest(`/api/families/${dirtyId}/missions?status=Completed`, "GET"),
      familyRouteParams(dirtyId),
    );
    expect(response.status).not.toBe(500);
    const body: HistoryBody = (await response.json()) as HistoryBody;
    const leaked: boolean =
      Array.isArray(body.missions) &&
      body.missions.some((p_row: { id: string }) => p_row.id === arranged.cycleId);
    expect(leaked).toBe(false);
  });
});
