import { FamilyInviteCommand } from "@/app/api/families/[id]/invites/family-invite-command";
import { FamilyInvite, type FamilyInviteRecord } from "@/models/family_invite";

export class AcceptInvite implements FamilyInviteCommand {
  public constructor(private readonly p_inviteId: string) {}

  public execute(): FamilyInviteRecord {
    return FamilyInvite.instance.accept(this.p_inviteId);
  }

  public undo(): void {}
}
