import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeDraftMission,
  arrangePickFamily,
  arrangePublishedMission,
} from "./helpers";

type FamilyMissionRow = {
  id: string;
  fam_id: string;
  mission_id: string;
  status: string;
};

describe("AcceptedFamilyMissionFactory", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("inserts family_mission in Accepted for a published id", async () => {
    // Break: Factory skips the row or writes Doing/Completed instead of Accepted.
    const arranged = await arrangePickFamily();
    const publishedId: string = await arrangePublishedMission("Accept picnic");
    const { AcceptedFamilyMissionFactory } = await import(
      "@/app/api/families/[id]/missions/surprise/accepted-factory"
    );
    const created = await new AcceptedFamilyMissionFactory().create(
      arranged.familyId,
      publishedId,
    );
    expect(created.status).toBe("Accepted");
    expect(created.mission_id).toBe(publishedId);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: FamilyMissionRow[] = queryRaw<FamilyMissionRow>(
      "SELECT id, fam_id, mission_id, status FROM family_mission WHERE fam_id = ?",
      [arranged.familyId],
    );
    expect(rows).toEqual([
      expect.objectContaining({
        fam_id: arranged.familyId,
        mission_id: publishedId,
        status: "Accepted",
      }),
    ]);
  });

  it("refuses an unpublished id and inserts no row", async () => {
    // Break: Factory invents an Accepted row from a draft (INV-001).
    const arranged = await arrangePickFamily();
    const draftId: string = await arrangeDraftMission("Draft accept");
    const { AcceptedFamilyMissionFactory } = await import(
      "@/app/api/families/[id]/missions/surprise/accepted-factory"
    );
    await expect(
      new AcceptedFamilyMissionFactory().create(arranged.familyId, draftId),
    ).rejects.toThrow();
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: FamilyMissionRow[] = queryRaw<FamilyMissionRow>(
      "SELECT id FROM family_mission WHERE fam_id = ?",
      [arranged.familyId],
    );
    expect(rows).toEqual([]);
  });

  it("does not insert when the catalog id is missing", async () => {
    // Break: Factory inserts a family_mission with a null/invented mission_id.
    const arranged = await arrangePickFamily();
    const { AcceptedFamilyMissionFactory } = await import(
      "@/app/api/families/[id]/missions/surprise/accepted-factory"
    );
    await expect(
      new AcceptedFamilyMissionFactory().create(
        arranged.familyId,
        "00000000-0000-4000-8000-000000000404",
      ),
    ).rejects.toThrow();
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: FamilyMissionRow[] = queryRaw<FamilyMissionRow>(
      "SELECT id FROM family_mission WHERE fam_id = ?",
      [arranged.familyId],
    );
    expect(rows).toEqual([]);
  });

  it("treats an injection-shaped family id as data", async () => {
    // Break: concatenated fam_id causes 500 or drops family_mission.
    const arranged = await arrangePickFamily();
    const publishedId: string = await arrangePublishedMission("Bound accept");
    const { AcceptedFamilyMissionFactory } = await import(
      "@/app/api/families/[id]/missions/surprise/accepted-factory"
    );
    const dirtyId: string = `${arranged.familyId}' OR '1'='1`;
    await expect(
      new AcceptedFamilyMissionFactory().create(dirtyId, publishedId),
    ).rejects.toThrow();
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: FamilyMissionRow[] = queryRaw<FamilyMissionRow>(
      "SELECT id FROM family_mission",
      [],
    );
    expect(rows).toEqual([]);
  });
});
