import type { MissionCommand } from "@/app/api/family-missions/mission-command";
import { FamilyMissionCycle } from "@/app/api/family-missions/mission-cycle";
import {
  assertSecondCycleAllowed,
  CycleNotFoundError,
} from "@/app/api/family-missions/start-doing-command";
import { getConnection, queryRaw } from "@/internal/db/connection";
import {
  FamilyMission,
  type FamilyMissionClosing,
  type FamilyMissionRow,
} from "@/models/family_mission";

export class MissingClosingError extends Error {
  public constructor() {
    super("closing required");
    this.name = "MissingClosingError";
  }
}

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

export function parseClosing(p_value: unknown): FamilyMissionClosing {
  if (!isRecord(p_value)) {
    throw new MissingClosingError();
  }
  if (Array.isArray(p_value.closing)) {
    throw new MissingClosingError();
  }
  if (typeof p_value.do_again !== "boolean" || typeof p_value.save_memory !== "boolean") {
    throw new MissingClosingError();
  }
  return { do_again: p_value.do_again, save_memory: p_value.save_memory };
}

export class CompleteMissionCommand implements MissionCommand {
  public constructor(
    private readonly p_id: string,
    private readonly p_closing: unknown,
  ) {}

  public execute(): FamilyMissionRow {
    const closing: FamilyMissionClosing = parseClosing(this.p_closing);
    const row: FamilyMissionRow | null = FamilyMission.instance.findById(this.p_id);
    if (row === null) {
      throw new CycleNotFoundError();
    }
    assertSecondCycleAllowed(row);
    const cycle: FamilyMissionCycle = new FamilyMissionCycle(row.status);
    cycle.complete();
    const title: string =
      row.title !== null && row.title !== ""
        ? row.title
        : FamilyMission.instance.snapshotTitle(row.mission_id);
    const completedAt: string = new Date().toISOString();
    const database = getConnection();
    const runComplete = database.transaction((): void => {
      FamilyMission.instance.completeWithClosing(this.p_id, closing, title, completedAt);
      queryRaw(
        `UPDATE family SET missions_completed = missions_completed + 1, updated_at = ? WHERE id = ?`,
        [completedAt, row.fam_id],
      );
    });
    runComplete();
    const stored: FamilyMissionRow | null = FamilyMission.instance.findById(this.p_id);
    if (stored === null) {
      throw new CycleNotFoundError();
    }
    return stored;
  }

  public undo(): void {
    return;
  }
}
