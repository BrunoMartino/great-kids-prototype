import type { MissionCommand } from "@/app/api/family-missions/mission-command";
import {
  FamilyMissionCycle,
  IllegalCycleTransitionError,
} from "@/app/api/family-missions/mission-cycle";
import { FamilyMission, type FamilyMissionRow } from "@/models/family_mission";

export class CycleNotFoundError extends Error {
  public constructor() {
    super("family_mission not found");
    this.name = "CycleNotFoundError";
  }
}

export class NonRepeatableCycleError extends Error {
  public constructor() {
    super("non-repeatable second cycle");
    this.name = "NonRepeatableCycleError";
  }
}

export function assertSecondCycleAllowed(p_row: FamilyMissionRow): void {
  const completed: number = FamilyMission.instance.countCompleted(p_row.fam_id, p_row.mission_id);
  if (completed === 0) {
    return;
  }
  if (FamilyMission.instance.isRepeatable(p_row.mission_id)) {
    return;
  }
  throw new NonRepeatableCycleError();
}

export class StartDoingCommand implements MissionCommand {
  public constructor(private readonly p_id: string) {}

  public execute(): FamilyMissionRow {
    const row: FamilyMissionRow | null = FamilyMission.instance.findById(this.p_id);
    if (row === null) {
      throw new CycleNotFoundError();
    }
    assertSecondCycleAllowed(row);
    const cycle: FamilyMissionCycle = new FamilyMissionCycle(row.status);
    cycle.startDoing();
    FamilyMission.instance.updateStatus(this.p_id, cycle.getName());
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

export { IllegalCycleTransitionError };
