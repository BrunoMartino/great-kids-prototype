import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeAcceptedCycle,
  patchCycle,
  setMissionRepeatable,
} from "./helpers";

type CycleBody = {
  id?: string;
  fam_id?: string;
  mission_id?: string;
  status?: string;
  closing?: { do_again?: boolean; save_memory?: boolean } | null;
  error?: string;
};

type FamilyMissionRow = {
  status: string;
  closing: string | null;
};

type FamilyCounterRow = {
  missions_completed: number;
};

describe("PATCH /api/family-missions/[id]", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("moves Accepted to Doing", async () => {
    // Break: PATCH status Doing is ignored and the row stays Accepted.
    const arranged = await arrangeAcceptedCycle("Start picnic");
    const response: Response = await patchCycle(arranged.cycleId, { status: "Doing" });
    const body: CycleBody = (await response.json()) as CycleBody;
    expect(response.status).toBe(200);
    expect(body.status).toBe("Doing");
    expect(body.id).toBe(arranged.cycleId);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: FamilyMissionRow[] = queryRaw<FamilyMissionRow>(
      "SELECT status, closing FROM family_mission WHERE id = ?",
      [arranged.cycleId],
    );
    expect(rows[0]?.status).toBe("Doing");
    expect(rows[0]?.closing).toBeNull();
  });

  it("writes closing on complete in the same transaction as Completed", async () => {
    // Break: status becomes Completed without closing, or closing is written without Completed.
    const arranged = await arrangeAcceptedCycle("Close picnic");
    await patchCycle(arranged.cycleId, { status: "Doing" });
    const response: Response = await patchCycle(arranged.cycleId, {
      status: "Completed",
      closing: { do_again: true, save_memory: false },
    });
    const body: CycleBody = (await response.json()) as CycleBody;
    expect(response.status).toBe(200);
    expect(body.status).toBe("Completed");
    expect(body.closing).toEqual({ do_again: true, save_memory: false });
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: FamilyMissionRow[] = queryRaw<FamilyMissionRow>(
      "SELECT status, closing FROM family_mission WHERE id = ?",
      [arranged.cycleId],
    );
    expect(rows[0]?.status).toBe("Completed");
    expect(JSON.parse(rows[0]?.closing ?? "null")).toEqual({
      do_again: true,
      save_memory: false,
    });
  });

  it("rejects complete without closing and leaves Doing unchanged", async () => {
    // Break: Completed is stored with null closing (INV-003).
    const arranged = await arrangeAcceptedCycle("Need closing");
    await patchCycle(arranged.cycleId, { status: "Doing" });
    const response: Response = await patchCycle(arranged.cycleId, { status: "Completed" });
    expect(response.status).toBe(422);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: FamilyMissionRow[] = queryRaw<FamilyMissionRow>(
      "SELECT status, closing FROM family_mission WHERE id = ?",
      [arranged.cycleId],
    );
    expect(rows[0]?.status).toBe("Doing");
    expect(rows[0]?.closing).toBeNull();
  });

  it("rejects Accepted to Completed skipping Doing", async () => {
    // Break: complete from Accepted is stored (illegal jump).
    const arranged = await arrangeAcceptedCycle("Skip doing");
    const response: Response = await patchCycle(arranged.cycleId, {
      status: "Completed",
      closing: { do_again: false, save_memory: false },
    });
    expect(response.status).toBe(422);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: FamilyMissionRow[] = queryRaw<FamilyMissionRow>(
      "SELECT status FROM family_mission WHERE id = ?",
      [arranged.cycleId],
    );
    expect(rows[0]?.status).toBe("Accepted");
  });

  it("rejects Completed to Accepted on the same row", async () => {
    // Break: same-row reverse jump is persisted.
    const arranged = await arrangeAcceptedCycle("No reverse");
    await patchCycle(arranged.cycleId, { status: "Doing" });
    await patchCycle(arranged.cycleId, {
      status: "Completed",
      closing: { do_again: false, save_memory: true },
    });
    const response: Response = await patchCycle(arranged.cycleId, { status: "Accepted" });
    expect(response.status).toBe(422);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: FamilyMissionRow[] = queryRaw<FamilyMissionRow>(
      "SELECT status FROM family_mission WHERE id = ?",
      [arranged.cycleId],
    );
    expect(rows[0]?.status).toBe("Completed");
  });

  it("rejects a closing envelope array (INV-004)", async () => {
    // Break: closing is stored as { id, closing: [] } or a bare array.
    const arranged = await arrangeAcceptedCycle("Plain closing");
    await patchCycle(arranged.cycleId, { status: "Doing" });
    const response: Response = await patchCycle(arranged.cycleId, {
      status: "Completed",
      closing: { id: arranged.cycleId, closing: [] },
    });
    expect(response.status).toBe(422);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: FamilyMissionRow[] = queryRaw<FamilyMissionRow>(
      "SELECT status, closing FROM family_mission WHERE id = ?",
      [arranged.cycleId],
    );
    expect(rows[0]?.status).toBe("Doing");
    expect(rows[0]?.closing).toBeNull();
  });

  it("increments missions_completed on complete", async () => {
    // Break: Completed row is written but family.missions_completed stays 0.
    const arranged = await arrangeAcceptedCycle("Count picnic");
    await patchCycle(arranged.cycleId, { status: "Doing" });
    await patchCycle(arranged.cycleId, {
      status: "Completed",
      closing: { do_again: true, save_memory: true },
    });
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: FamilyCounterRow[] = queryRaw<FamilyCounterRow>(
      "SELECT missions_completed FROM family WHERE id = ?",
      [arranged.familyId],
    );
    expect(rows[0]?.missions_completed).toBe(1);
  });

  it("does not increment missions_completed when complete is rejected", async () => {
    // Break: 422 complete still bumps the hub counter.
    const arranged = await arrangeAcceptedCycle("No count");
    await patchCycle(arranged.cycleId, { status: "Doing" });
    await patchCycle(arranged.cycleId, { status: "Completed" });
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: FamilyCounterRow[] = queryRaw<FamilyCounterRow>(
      "SELECT missions_completed FROM family WHERE id = ?",
      [arranged.familyId],
    );
    expect(rows[0]?.missions_completed).toBe(0);
  });

  it("allows a second Completed row when the mission is repeatable", async () => {
    // Break: repeatable second cycle is blocked or overwrites the first row.
    const arranged = await arrangeAcceptedCycle("Repeat picnic");
    await setMissionRepeatable(arranged.missionId, 1);
    await patchCycle(arranged.cycleId, { status: "Doing" });
    await patchCycle(arranged.cycleId, {
      status: "Completed",
      closing: { do_again: true, save_memory: false },
    });
    const { AcceptedFamilyMissionFactory } = await import(
      "@/app/api/families/[id]/missions/surprise/accepted-factory"
    );
    const second: { id: string } = await new AcceptedFamilyMissionFactory().create(
      arranged.familyId,
      arranged.missionId,
    );
    await patchCycle(second.id, { status: "Doing" });
    const response: Response = await patchCycle(second.id, {
      status: "Completed",
      closing: { do_again: false, save_memory: true },
    });
    expect(response.status).toBe(200);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: Array<{ id: string; status: string }> = queryRaw<{ id: string; status: string }>(
      "SELECT id, status FROM family_mission WHERE fam_id = ? AND status = 'Completed'",
      [arranged.familyId],
    );
    expect(rows).toHaveLength(2);
    const counters: FamilyCounterRow[] = queryRaw<FamilyCounterRow>(
      "SELECT missions_completed FROM family WHERE id = ?",
      [arranged.familyId],
    );
    expect(counters[0]?.missions_completed).toBe(2);
  });

  it("rejects a second cycle when the mission is not repeatable", async () => {
    // Break: non-repeatable second complete is stored and the counter drifts.
    const arranged = await arrangeAcceptedCycle("Once picnic");
    await patchCycle(arranged.cycleId, { status: "Doing" });
    await patchCycle(arranged.cycleId, {
      status: "Completed",
      closing: { do_again: false, save_memory: false },
    });
    const { AcceptedFamilyMissionFactory } = await import(
      "@/app/api/families/[id]/missions/surprise/accepted-factory"
    );
    const second: { id: string } = await new AcceptedFamilyMissionFactory().create(
      arranged.familyId,
      arranged.missionId,
    );
    const doing: Response = await patchCycle(second.id, { status: "Doing" });
    expect(doing.status).toBe(422);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: Array<{ id: string }> = queryRaw<{ id: string }>(
      "SELECT id FROM family_mission WHERE fam_id = ? AND status = 'Completed'",
      [arranged.familyId],
    );
    expect(rows).toHaveLength(1);
    const counters: FamilyCounterRow[] = queryRaw<FamilyCounterRow>(
      "SELECT missions_completed FROM family WHERE id = ?",
      [arranged.familyId],
    );
    expect(counters[0]?.missions_completed).toBe(1);
  });

  it("rejects Child with 403", async () => {
    // Break: Child can start or complete a family mission.
    const arranged = await arrangeAcceptedCycle("Child cycle");
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Child";
    const { applyRole } = await import("@/app/api/session/presentation-strategy");
    applyRole("Child");
    const response: Response = await patchCycle(arranged.cycleId, { status: "Doing" });
    expect(response.status).toBe(403);
  });

  it("treats an injection-shaped cycle id as data", async () => {
    // Break: concatenated id causes 500 or mutates another family_mission.
    const arranged = await arrangeAcceptedCycle("Bound cycle");
    const dirtyId: string = `${arranged.cycleId}' OR '1'='1`;
    const response: Response = await patchCycle(dirtyId, { status: "Doing" });
    expect(response.status).not.toBe(500);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: FamilyMissionRow[] = queryRaw<FamilyMissionRow>(
      "SELECT status FROM family_mission WHERE id = ?",
      [arranged.cycleId],
    );
    expect(rows[0]?.status).toBe("Accepted");
  });
});
