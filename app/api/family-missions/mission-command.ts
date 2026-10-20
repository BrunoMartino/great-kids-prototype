import type { FamilyMissionRow } from "@/models/family_mission";

export interface MissionCommand {
  execute(): FamilyMissionRow;
  undo(): void;
}
