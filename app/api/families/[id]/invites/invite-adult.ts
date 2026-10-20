import { createHash } from "node:crypto";
import { FamilyInviteCommand } from "@/app/api/families/[id]/invites/family-invite-command";
import { FamilyInvite, type FamilyInviteRecord } from "@/models/family_invite";

function hashToken(p_token: string): string {
  return createHash("sha256").update(p_token).digest("hex");
}

export class InviteAdult implements FamilyInviteCommand {
  private result: FamilyInviteRecord | null = null;

  public constructor(
    private readonly p_familyId: string,
    private readonly p_email: string,
    private readonly p_role: string,
  ) {}

  public execute(): FamilyInviteRecord {
    const token: string = crypto.randomUUID();
    const tokenHash: string = hashToken(token);
    const expiresAt: string = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    this.result = FamilyInvite.instance.create({
      family_id: this.p_familyId,
      email: this.p_email,
      role: this.p_role,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });
    return this.result;
  }

  public undo(): void {
    if (this.result !== null) {
      FamilyInvite.instance.revoke(this.result.id);
    }
  }
}
