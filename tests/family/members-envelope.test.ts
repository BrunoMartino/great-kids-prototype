import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeFamilyViaHusk } from "./helpers";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type MembersEnvelope = {
  id: string;
  members: Array<{
    user_id: string | null;
    user_nickname: string;
    user_role: string;
    photo?: string;
  }>;
};

type FamilyMembersRow = {
  family_members: string;
};

type AppUserCreated = {
  id: string;
  name: string | null;
  nick_name: string;
};

type CountRow = {
  n: number;
};

describe("Family.replaceMembers", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("stores the members envelope and round-trips Leo without a photo key", async () => {
    // Break: envelope not stored, or photo key appears in JSON.
    const arranged = await arrangeFamilyViaHusk();
    const { Family } = await import("@/models/family");
    const { queryRaw } = await import("@/internal/db/connection");
    const envelope: MembersEnvelope = {
      id: "members-env-leo",
      members: [{ user_id: null, user_nickname: "Leo", user_role: "Child" }],
    };
    Family.instance.replaceMembers(arranged.familyId, envelope);
    const rows: FamilyMembersRow[] = queryRaw<FamilyMembersRow>(
      "SELECT family_members FROM family WHERE id = ?",
      [arranged.familyId],
    );
    const stored: MembersEnvelope = JSON.parse(rows[0].family_members) as MembersEnvelope;
    expect(stored.id).toBe("members-env-leo");
    expect(stored.members[0].user_nickname).toBe("Leo");
    expect(stored.members[0].user_role).toBe("Child");
    expect(stored.members[0].user_id).toBeNull();
    expect(JSON.parse(rows[0].family_members)).not.toHaveProperty("photo");
    expect(Object.keys(stored.members[0]).includes("photo")).toBe(false);
  });

  it("rejects replaceMembers with a bare array", async () => {
    // Break: bare array is written (INV-004).
    const arranged = await arrangeFamilyViaHusk();
    const { Family } = await import("@/models/family");
    expect(typeof Family.instance.replaceMembers).toBe("function");
    expect(() => {
      Family.instance.replaceMembers(arranged.familyId, []);
    }).toThrow();
  });

  it("does not require an app_user for a child member and allows name on Parent", async () => {
    // Break: child member requires app_user, or name is forbidden on AppUser.create.
    const arranged = await arrangeFamilyViaHusk();
    const { Family } = await import("@/models/family");
    const { AppUser } = await import("@/models/app_user");
    const { queryRaw } = await import("@/internal/db/connection");
    Family.instance.replaceMembers(arranged.familyId, {
      id: "members-env-child",
      members: [{ user_id: null, user_nickname: "Leo", user_role: "Child" }],
    });
    const leoUsers: CountRow[] = queryRaw<CountRow>(
      "SELECT count(*) AS n FROM app_user WHERE nick_name = ?",
      ["Leo"],
    );
    expect(leoUsers[0].n).toBe(0);
    const created: AppUserCreated = await AppUser.instance.create({
      name: "Ana Silva",
      nick_name: "Ana",
      email: "ana.silva@example.com",
      role: "Parent",
      status: "active",
    });
    expect(created.nick_name).toBe("Ana");
    expect(created.name).toBe("Ana Silva");
  });

  it("does not persist a photo key on a member object", async () => {
    // Break: photo key is written into family_members JSON.
    const arranged = await arrangeFamilyViaHusk();
    const { Family } = await import("@/models/family");
    const { queryRaw } = await import("@/internal/db/connection");
    expect(typeof Family.instance.replaceMembers).toBe("function");
    expect(() => {
      Family.instance.replaceMembers(arranged.familyId, {
        id: "members-env-photo",
        members: [
          { user_id: null, user_nickname: "Leo", user_role: "Child", photo: "kid.png" },
        ],
      });
    }).toThrow();
    const rows: FamilyMembersRow[] = queryRaw<FamilyMembersRow>(
      "SELECT family_members FROM family WHERE id = ?",
      [arranged.familyId],
    );
    expect(rows[0].family_members.includes("photo")).toBe(false);
    expect(rows[0].family_members.includes("kid.png")).toBe(false);
  });
});
