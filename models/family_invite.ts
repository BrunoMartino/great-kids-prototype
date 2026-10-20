import { getConnection, queryRaw } from "@/internal/db/connection";
import { Family, type MembersEnvelope } from "@/models/family";

export type FamilyInviteCreateInput = {
  family_id: string;
  email: string;
  role: string;
  token_hash: string;
  expires_at: string;
};

export type FamilyInviteRecord = {
  id: string;
  family_id: string;
  email: string;
  role: string;
  status: string;
  token_hash: string;
  expires_at: string;
};

export type FamilyInviteListItem = {
  id: string;
  email: string;
  status: string;
};

function nicknameFromEmail(p_email: string): string {
  const separatorIndex: number = p_email.indexOf("@");
  if (separatorIndex <= 0) {
    return p_email;
  }
  return p_email.slice(0, separatorIndex);
}

export class FamilyInvite {
  private static _instance: FamilyInvite | null = null;

  private constructor() {}

  public static get instance(): FamilyInvite {
    if (FamilyInvite._instance === null) {
      FamilyInvite._instance = new FamilyInvite();
    }
    return FamilyInvite._instance;
  }

  public create(p_input: FamilyInviteCreateInput): FamilyInviteRecord {
    getConnection();
    const id: string = crypto.randomUUID();
    const now: string = new Date().toISOString();
    const status: string = "Pending";
    queryRaw(
      `INSERT INTO family_invite (
        id, family_id, email, role, status, token_hash, expires_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        p_input.family_id,
        p_input.email,
        p_input.role,
        status,
        p_input.token_hash,
        p_input.expires_at,
        now,
        now,
      ],
    );
    return {
      id,
      family_id: p_input.family_id,
      email: p_input.email,
      role: p_input.role,
      status,
      token_hash: p_input.token_hash,
      expires_at: p_input.expires_at,
    };
  }

  public listByFamily(p_familyId: string): FamilyInviteListItem[] {
    getConnection();
    return queryRaw<FamilyInviteListItem>(
      `SELECT id, email, status FROM family_invite WHERE family_id = ?`,
      [p_familyId],
    );
  }

  public accept(p_inviteId: string): FamilyInviteRecord {
    getConnection();
    const rows: FamilyInviteRecord[] = queryRaw<FamilyInviteRecord>(
      `SELECT id, family_id, email, role, status, token_hash, expires_at
       FROM family_invite WHERE id = ?`,
      [p_inviteId],
    );
    const invite: FamilyInviteRecord | undefined = rows[0];
    if (invite === undefined) {
      throw new Error("invite not found");
    }
    const now: string = new Date().toISOString();
    const isExpired: boolean = new Date(invite.expires_at).getTime() < Date.now();
    if (isExpired) {
      const expiredStatus: string = "Expired";
      queryRaw(`UPDATE family_invite SET status = ?, updated_at = ? WHERE id = ?`, [
        expiredStatus,
        now,
        p_inviteId,
      ]);
      return {
        ...invite,
        status: expiredStatus,
      };
    }
    const acceptedStatus: string = "Accepted";
    queryRaw(`UPDATE family_invite SET status = ?, updated_at = ? WHERE id = ?`, [
      acceptedStatus,
      now,
      p_inviteId,
    ]);
    const memberRows: Array<{ family_members: string }> = queryRaw<{ family_members: string }>(
      `SELECT family_members FROM family WHERE id = ?`,
      [invite.family_id],
    );
    const membersRow: { family_members: string } | undefined = memberRows[0];
    if (membersRow === undefined) {
      throw new Error("family not found");
    }
    const envelope: MembersEnvelope = JSON.parse(membersRow.family_members) as MembersEnvelope;
    const userRows: Array<{ id: string }> = queryRaw<{ id: string }>(
      `SELECT id FROM app_user WHERE email = ?`,
      [invite.email],
    );
    const matchedUser: { id: string } | undefined = userRows[0];
    envelope.members.push({
      user_id: matchedUser === undefined ? null : matchedUser.id,
      user_nickname: nicknameFromEmail(invite.email),
      user_role: invite.role,
    });
    Family.instance.replaceMembers(invite.family_id, envelope);
    return {
      ...invite,
      status: acceptedStatus,
    };
  }

  public revoke(p_inviteId: string): FamilyInviteRecord {
    getConnection();
    const rows: FamilyInviteRecord[] = queryRaw<FamilyInviteRecord>(
      `SELECT id, family_id, email, role, status, token_hash, expires_at
       FROM family_invite WHERE id = ?`,
      [p_inviteId],
    );
    const invite: FamilyInviteRecord | undefined = rows[0];
    if (invite === undefined) {
      throw new Error("invite not found");
    }
    const now: string = new Date().toISOString();
    const revokedStatus: string = "Revoked";
    queryRaw(`UPDATE family_invite SET status = ?, updated_at = ? WHERE id = ?`, [
      revokedStatus,
      now,
      p_inviteId,
    ]);
    return {
      ...invite,
      status: revokedStatus,
    };
  }
}
