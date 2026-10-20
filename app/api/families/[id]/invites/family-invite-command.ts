import type { FamilyInviteRecord } from "@/models/family_invite";

export interface FamilyInviteCommand {
  execute(): FamilyInviteRecord;
  undo(): void;
}
