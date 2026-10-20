import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type CountRow = {
  n: number;
};

type FamilyRow = {
  id: string;
  fam_profile_id: string;
  fam_diary_id: string;
  status: string;
  family_members: string;
  address: string;
  plan_id: string | null;
};

type EnvelopeId = {
  id: string;
};

type MembersEnvelope = {
  id: string;
  members: Array<{ user_id: string; user_nickname: string; user_role: string }>;
};

type AddressObject = {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
};

type QuizEnvelope = {
  id: string;
  quiz_answer: unknown[];
};

type RhythmsEnvelope = {
  id: string;
  rhythms: unknown[];
};

type AchievementsEnvelope = {
  id: string;
  achievements: unknown[];
};

type NotesEnvelope = {
  id: string;
  notes: unknown[];
};

async function arrangeParentHolder(): Promise<{ id: string; nick_name: string }> {
  const { queryRaw } = await import("@/internal/db/connection");
  const holderId: string = "holder-ana-1";
  queryRaw(
    `INSERT INTO app_user (
      id, name, nick_name, email, role, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      holderId,
      "Ana",
      "Ana",
      "ana@example.com",
      "Parent",
      "active",
      "2026-01-01T00:00:00Z",
      "2026-01-01T00:00:00Z",
    ],
  );
  return { id: holderId, nick_name: "Ana" };
}

describe("family husk", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("creates profile, diary, and family with the holder in members", async () => {
    // Break: family inserted without profile/diary, or members omit holder.
    const holder = await arrangeParentHolder();
    const { createFamilyHusk } = await import("@/app/api/families/husk-service");
    const { queryRaw } = await import("@/internal/db/connection");
    const family: FamilyRow = await createFamilyHusk({
      holder_user_id: holder.id,
      status: "active",
    });
    expect(family.status).toBe("active");
    const profiles: EnvelopeId[] = queryRaw<EnvelopeId>(
      "SELECT id FROM family_profile WHERE id = ?",
      [family.fam_profile_id],
    );
    const diaries: EnvelopeId[] = queryRaw<EnvelopeId>(
      "SELECT id FROM family_diary WHERE id = ?",
      [family.fam_diary_id],
    );
    expect(profiles).toHaveLength(1);
    expect(diaries).toHaveLength(1);
    const members: MembersEnvelope = JSON.parse(family.family_members) as MembersEnvelope;
    expect(members.members[0].user_id).toBe(holder.id);
    expect(members.members[0].user_nickname).toBe("Ana");
    expect(members.members[0].user_role).toBe("Parent");
    const profileJson: { quiz_answer: string; rhythms: string; achievements: string }[] =
      queryRaw<{ quiz_answer: string; rhythms: string; achievements: string }>(
        "SELECT quiz_answer, rhythms, achievements FROM family_profile WHERE id = ?",
        [family.fam_profile_id],
      );
    const quiz: QuizEnvelope = JSON.parse(profileJson[0].quiz_answer) as QuizEnvelope;
    const rhythms: RhythmsEnvelope = JSON.parse(profileJson[0].rhythms) as RhythmsEnvelope;
    const achievements: AchievementsEnvelope = JSON.parse(
      profileJson[0].achievements,
    ) as AchievementsEnvelope;
    expect(Array.isArray(quiz.quiz_answer)).toBe(true);
    expect(quiz.quiz_answer).toEqual([]);
    expect(rhythms.rhythms).toEqual([]);
    expect(achievements.achievements).toEqual([]);
    const diaryJson: { family_notes: string; mission_note: string }[] = queryRaw<{
      family_notes: string;
      mission_note: string;
    }>("SELECT family_notes, mission_note FROM family_diary WHERE id = ?", [family.fam_diary_id]);
    const notes: NotesEnvelope = JSON.parse(diaryJson[0].family_notes) as NotesEnvelope;
    const missionNotes: NotesEnvelope = JSON.parse(diaryJson[0].mission_note) as NotesEnvelope;
    expect(notes.notes).toEqual([]);
    expect(missionNotes.notes).toEqual([]);
  });

  it("stores address as a plain object with empty string fields", async () => {
    // Break: address is `{id, address:[]}` or missing keys.
    const holder = await arrangeParentHolder();
    const { createFamilyHusk } = await import("@/app/api/families/husk-service");
    const family: FamilyRow = await createFamilyHusk({
      holder_user_id: holder.id,
      status: "active",
    });
    const address: AddressObject = JSON.parse(family.address) as AddressObject;
    expect(address).toEqual({
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
    });
    expect(Object.prototype.hasOwnProperty.call(address, "id")).toBe(false);
  });

  it("rejects family_members stored as a bare JSON array", async () => {
    // Break: bare array is stored (INV-004).
    const holder = await arrangeParentHolder();
    const { Family } = await import("@/models/family");
    const { queryRaw } = await import("@/internal/db/connection");
    const profileId: string = "prof-bare-1";
    const diaryId: string = "diary-bare-1";
    queryRaw(
      `INSERT INTO family_profile (
        id, quiz_answer, rhythms, achievements, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        profileId,
        JSON.stringify({ id: profileId, quiz_answer: [] }),
        JSON.stringify({ id: profileId, rhythms: [] }),
        JSON.stringify({ id: profileId, achievements: [] }),
        "2026-01-01T00:00:00Z",
        "2026-01-01T00:00:00Z",
      ],
    );
    queryRaw(
      `INSERT INTO family_diary (
        id, family_notes, mission_note, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        diaryId,
        JSON.stringify({ id: diaryId, notes: [] }),
        JSON.stringify({ id: diaryId, notes: [] }),
        "2026-01-01T00:00:00Z",
        "2026-01-01T00:00:00Z",
      ],
    );
    expect(() => {
      Family.instance.insert({
        fam_profile_id: profileId,
        fam_diary_id: diaryId,
        status: "active",
        family_members: "[]",
        address: JSON.stringify({
          street: "",
          number: "",
          neighborhood: "",
          city: "",
          state: "",
          zip_code: "",
        }),
        holder_user_id: holder.id,
      });
    }).toThrow();
  });

  it("does not leave profile or diary rows when family status is invalid", async () => {
    // Break: husk is non-transactional and leaves profile/diary rows.
    const holder = await arrangeParentHolder();
    const { createFamilyHusk } = await import("@/app/api/families/husk-service");
    const { queryRaw } = await import("@/internal/db/connection");
    await expect(
      createFamilyHusk({
        holder_user_id: holder.id,
        status: "bogus",
      }),
    ).rejects.toThrow();
    const profiles: CountRow[] = queryRaw<CountRow>(
      "SELECT count(*) AS n FROM family_profile",
      [],
    );
    const diaries: CountRow[] = queryRaw<CountRow>("SELECT count(*) AS n FROM family_diary", []);
    expect(profiles[0].n).toBe(0);
    expect(diaries[0].n).toBe(0);
  });
});
