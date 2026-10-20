import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeFamilyViaHusk } from "./helpers";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type InviteRecord = {
  id: string;
  status: string;
  email: string;
  token_hash: string;
};

type MembersEnvelope = {
  id: string;
  members: Array<{
    user_id: string | null;
    user_nickname: string;
    user_role: string;
  }>;
};

type FamilyMembersRow = {
  family_members: string;
};

type SqliteMasterRow = {
  name: string;
};

describe("FamilyInvite Active Record", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("creates a Pending invite with a unique token_hash", async () => {
    // Break: status is not the literal Pending, or token_hash is missing.
    const arranged = await arrangeFamilyViaHusk();
    const { FamilyInvite } = await import("@/models/family_invite");
    const created: InviteRecord = FamilyInvite.instance.create({
      family_id: arranged.familyId,
      email: "pai@example.com",
      role: "Parent",
      token_hash: "hash-pending-unique-1",
      expires_at: "2099-01-01T00:00:00.000Z",
    });
    expect(created.status).toBe("Pending");
    expect(created.token_hash).toBe("hash-pending-unique-1");
    expect(typeof created.id).toBe("string");
  });

  it("rejects a second invite with the same token_hash", async () => {
    // Break: duplicate token_hash is stored.
    const arranged = await arrangeFamilyViaHusk();
    const { FamilyInvite } = await import("@/models/family_invite");
    FamilyInvite.instance.create({
      family_id: arranged.familyId,
      email: "pai@example.com",
      role: "Parent",
      token_hash: "hash-dup-1",
      expires_at: "2099-01-01T00:00:00.000Z",
    });
    expect(() => {
      FamilyInvite.instance.create({
        family_id: arranged.familyId,
        email: "outro@example.com",
        role: "Parent",
        token_hash: "hash-dup-1",
        expires_at: "2099-01-01T00:00:00.000Z",
      });
    }).toThrow();
  });

  it("marks an expired accept as Expired and does not append members", async () => {
    // Break: expired token joins family_members or stays Pending.
    const arranged = await arrangeFamilyViaHusk();
    const { FamilyInvite } = await import("@/models/family_invite");
    const { queryRaw } = await import("@/internal/db/connection");
    const created: InviteRecord = FamilyInvite.instance.create({
      family_id: arranged.familyId,
      email: "pai@example.com",
      role: "Parent",
      token_hash: "hash-expired-1",
      expires_at: "2020-01-01T00:00:00.000Z",
    });
    const accepted: InviteRecord = FamilyInvite.instance.accept(created.id);
    expect(accepted.status).toBe("Expired");
    const rows: FamilyMembersRow[] = queryRaw<FamilyMembersRow>(
      "SELECT family_members FROM family WHERE id = ?",
      [arranged.familyId],
    );
    const envelope: MembersEnvelope = JSON.parse(rows[0].family_members) as MembersEnvelope;
    expect(envelope.members).toHaveLength(1);
  });

  it("stores an injection-shaped email as data", async () => {
    // Break: email concatenated into SQL so family_invite is dropped.
    const arranged = await arrangeFamilyViaHusk();
    const { FamilyInvite } = await import("@/models/family_invite");
    const { queryRaw } = await import("@/internal/db/connection");
    const injectedEmail: string = "a@b.c'); DROP TABLE family_invite;--";
    const created: InviteRecord = FamilyInvite.instance.create({
      family_id: arranged.familyId,
      email: injectedEmail,
      role: "Parent",
      token_hash: "hash-inject-1",
      expires_at: "2099-01-01T00:00:00.000Z",
    });
    expect(created.email).toBe(injectedEmail);
    const tables: SqliteMasterRow[] = queryRaw<SqliteMasterRow>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      ["family_invite"],
    );
    expect(tables).toEqual([{ name: "family_invite" }]);
  });

  it("accepts a Pending invite into family_members without a photo key", async () => {
    // Break: accept does not set Accepted or append { user_id, user_nickname, user_role }.
    const arranged = await arrangeFamilyViaHusk();
    const { FamilyInvite } = await import("@/models/family_invite");
    const { queryRaw } = await import("@/internal/db/connection");
    const created: InviteRecord = FamilyInvite.instance.create({
      family_id: arranged.familyId,
      email: "pai@example.com",
      role: "Parent",
      token_hash: "hash-accept-1",
      expires_at: "2099-01-01T00:00:00.000Z",
    });
    const accepted: InviteRecord = FamilyInvite.instance.accept(created.id);
    expect(accepted.status).toBe("Accepted");
    const rows: FamilyMembersRow[] = queryRaw<FamilyMembersRow>(
      "SELECT family_members FROM family WHERE id = ?",
      [arranged.familyId],
    );
    const envelope: MembersEnvelope = JSON.parse(rows[0].family_members) as MembersEnvelope;
    expect(envelope.members).toHaveLength(2);
    const added = envelope.members.find((p_member) => p_member.user_nickname !== "Ana");
    expect(added).toBeDefined();
    expect(added?.user_role).toBe("Parent");
    expect(typeof added?.user_nickname).toBe("string");
    expect(Object.keys(added as object).includes("photo")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(added, "user_id")).toBe(true);
  });

  it("revokes an invite to Revoked", async () => {
    // Break: revoke leaves status Pending or Accepted.
    const arranged = await arrangeFamilyViaHusk();
    const { FamilyInvite } = await import("@/models/family_invite");
    const created: InviteRecord = FamilyInvite.instance.create({
      family_id: arranged.familyId,
      email: "pai@example.com",
      role: "Parent",
      token_hash: "hash-revoke-1",
      expires_at: "2099-01-01T00:00:00.000Z",
    });
    const revoked: InviteRecord = FamilyInvite.instance.revoke(created.id);
    expect(revoked.status).toBe("Revoked");
  });
});
