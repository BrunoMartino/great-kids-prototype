import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeCompletedCycle,
  arrangeDiaryFamily,
  arrangeSecondDiaryFamily,
  getDiary,
  NOTE_KINDS,
  postDiary,
  UNKNOWN_FAMILY_ID,
} from "./helpers";

type NoteItem = {
  id?: string;
  text?: string;
  kind?: string;
  photo?: unknown;
  image?: unknown;
  img?: unknown;
};

type MissionNoteItem = {
  mission_id?: string;
  family_mission_id?: string;
  note?: NoteItem;
};

type DiaryBody = {
  id?: string;
  family_notes?: { id?: string; notes?: NoteItem[] };
  mission_note?: { id?: string; notes?: MissionNoteItem[] };
  error?: string;
};

type StoredDiaryRow = {
  family_notes: string;
  mission_note: string;
  deleted: number;
};

describe("GET/POST /api/families/[id]/diary", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns envelope notes not a bare array", async () => {
    // Break: GET returns a bare notes array (INV-004).
    const arranged = await arrangeDiaryFamily();
    const response: Response = await getDiary(arranged.familyId);
    const body: DiaryBody = (await response.json()) as DiaryBody;
    expect(response.status).toBe(200);
    expect(body.id).toBe(arranged.familyId);
    expect(Array.isArray(body.family_notes)).toBe(false);
    expect(Array.isArray(body.mission_note)).toBe(false);
    expect(body.family_notes?.id).toEqual(expect.any(String));
    expect(body.family_notes?.notes).toEqual([]);
    expect(body.mission_note?.id).toEqual(expect.any(String));
    expect(body.mission_note?.notes).toEqual([]);
  });

  it("persists a phrase note inside family_notes envelope", async () => {
    // Break: POST 200 but family_notes is not { id, notes: [{ id, text, kind }] }.
    const arranged = await arrangeDiaryFamily();
    const response: Response = await postDiary(arranged.familyId, {
      kind: "phrase",
      text: "We baked bread together.",
    });
    const body: DiaryBody = (await response.json()) as DiaryBody;
    expect(response.status).toBe(200);
    expect(body.family_notes?.notes).toHaveLength(1);
    expect(body.family_notes?.notes?.[0]?.text).toBe("We baked bread together.");
    expect(body.family_notes?.notes?.[0]?.kind).toBe("phrase");
    expect(body.family_notes?.notes?.[0]?.id).toEqual(expect.any(String));
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: StoredDiaryRow[] = queryRaw<StoredDiaryRow>(
      `SELECT fd.family_notes, fd.mission_note, fd.deleted
       FROM family_diary fd
       INNER JOIN family f ON f.fam_diary_id = fd.id
       WHERE f.id = ?`,
      [arranged.familyId],
    );
    const stored: unknown = JSON.parse(rows[0]?.family_notes ?? "null");
    expect(stored).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        notes: [
          expect.objectContaining({
            text: "We baked bread together.",
            kind: "phrase",
          }),
        ],
      }),
    );
  });

  it("accepts all five kinds on POST", async () => {
    // Break: one of the five kinds is rejected or not stored.
    const arranged = await arrangeDiaryFamily();
    for (const p_kind of NOTE_KINDS) {
      const response: Response = await postDiary(arranged.familyId, {
        kind: p_kind,
        text: `Memory ${p_kind}`,
      });
      expect(response.status).toBe(200);
    }
    const listed: DiaryBody = (await (await getDiary(arranged.familyId)).json()) as DiaryBody;
    const kinds: string[] = (listed.family_notes?.notes ?? []).map(
      (p_note: NoteItem) => p_note.kind ?? "",
    );
    expect(kinds).toEqual([...NOTE_KINDS]);
  });

  it("rejects unknown kind and stores nothing", async () => {
    // Break: unknown kind is persisted in family_notes.
    const arranged = await arrangeDiaryFamily();
    const response: Response = await postDiary(arranged.familyId, {
      kind: "selfie",
      text: "Should not land",
    });
    expect(response.status).toBe(422);
    const listed: DiaryBody = (await (await getDiary(arranged.familyId)).json()) as DiaryBody;
    expect(listed.family_notes?.notes).toEqual([]);
  });

  it("rejects empty text and stores nothing", async () => {
    // Break: empty text is stored as a note.
    const arranged = await arrangeDiaryFamily();
    const response: Response = await postDiary(arranged.familyId, {
      kind: "phrase",
      text: "",
    });
    expect(response.status).toBe(422);
    const listed: DiaryBody = (await (await getDiary(arranged.familyId)).json()) as DiaryBody;
    expect(listed.family_notes?.notes).toEqual([]);
  });

  it("rejects whitespace-only text", async () => {
    // Break: blank spaces are stored as a note.
    const arranged = await arrangeDiaryFamily();
    const response: Response = await postDiary(arranged.familyId, {
      kind: "funny",
      text: "   ",
    });
    expect(response.status).toBe(422);
    const listed: DiaryBody = (await (await getDiary(arranged.familyId)).json()) as DiaryBody;
    expect(listed.family_notes?.notes).toEqual([]);
  });

  it("rejects photo payload and stores no image fields", async () => {
    // Break: photo/image keys are stored (INV-002).
    const arranged = await arrangeDiaryFamily();
    const photoResponse: Response = await postDiary(arranged.familyId, {
      kind: "first_time",
      text: "First bike ride",
      photo: "https://cdn.example/child.jpg",
    });
    expect(photoResponse.status).toBe(422);
    const imageResponse: Response = await postDiary(arranged.familyId, {
      kind: "first_time",
      text: "First bike ride",
      image: "data:image/png;base64,aaa",
    });
    expect(imageResponse.status).toBe(422);
    const imgResponse: Response = await postDiary(arranged.familyId, {
      kind: "first_time",
      text: "First bike ride",
      img: "/uploads/kid.png",
    });
    expect(imgResponse.status).toBe(422);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: StoredDiaryRow[] = queryRaw<StoredDiaryRow>(
      `SELECT fd.family_notes, fd.mission_note, fd.deleted
       FROM family_diary fd
       INNER JOIN family f ON f.fam_diary_id = fd.id
       WHERE f.id = ?`,
      [arranged.familyId],
    );
    const blob: string = `${rows[0]?.family_notes ?? ""}${rows[0]?.mission_note ?? ""}`;
    expect(blob).not.toContain("child.jpg");
    expect(blob).not.toContain("data:image");
    expect(blob).not.toContain("/uploads/kid.png");
    const listed: DiaryBody = (await (await getDiary(arranged.familyId)).json()) as DiaryBody;
    expect(listed.family_notes?.notes).toEqual([]);
  });

  it("hides notes when the diary deleted flag is set", async () => {
    // Break: deleted diary still returns stored notes.
    const arranged = await arrangeDiaryFamily();
    await postDiary(arranged.familyId, { kind: "learned", text: "How to share" });
    const { queryRaw } = await import("@/internal/db/connection");
    queryRaw(
      `UPDATE family_diary SET deleted = 1
       WHERE id = (SELECT fam_diary_id FROM family WHERE id = ?)`,
      [arranged.familyId],
    );
    const response: Response = await getDiary(arranged.familyId);
    const body: DiaryBody = (await response.json()) as DiaryBody;
    expect(response.status).toBe(200);
    expect(body.family_notes?.notes).toEqual([]);
    expect(body.mission_note?.notes).toEqual([]);
    expect(Array.isArray(body.family_notes)).toBe(false);
  });

  it("stores mission_note with mission_id and nested note", async () => {
    // Break: mission memory is missing nested note or mission_id.
    const cycle = await arrangeCompletedCycle("Picnic memory");
    const response: Response = await postDiary(cycle.familyId, {
      kind: "first_time",
      text: "First picnic as a team",
      mission_id: cycle.missionId,
      family_mission_id: cycle.cycleId,
    });
    const body: DiaryBody = (await response.json()) as DiaryBody;
    expect(response.status).toBe(200);
    expect(body.mission_note?.notes).toHaveLength(1);
    expect(body.mission_note?.notes?.[0]?.mission_id).toBe(cycle.missionId);
    expect(body.mission_note?.notes?.[0]?.family_mission_id).toBe(cycle.cycleId);
    expect(body.mission_note?.notes?.[0]?.note).toEqual(
      expect.objectContaining({
        text: "First picnic as a team",
        kind: "first_time",
      }),
    );
    expect(body.family_notes?.notes?.[0]?.kind).toBe("first_time");
  });

  it("rejects a mission the family never had", async () => {
    // Break: foreign family_mission_id is stored on this family's diary.
    const theirs = await arrangeCompletedCycle("Other family picnic");
    const ours = await arrangeSecondDiaryFamily();
    const response: Response = await postDiary(ours.familyId, {
      kind: "family_fail",
      text: "Not our mission",
      mission_id: theirs.missionId,
      family_mission_id: theirs.cycleId,
    });
    expect(response.status).toBe(422);
    const listed: DiaryBody = (await (await getDiary(ours.familyId)).json()) as DiaryBody;
    expect(listed.mission_note?.notes).toEqual([]);
    expect(listed.family_notes?.notes).toEqual([]);
  });

  it("rejects Child authoring a note", async () => {
    // Break: Child POST stores a note (200).
    const arranged = await arrangeDiaryFamily();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Child";
    const { applyRole } = await import("@/app/api/session/presentation-strategy");
    applyRole("Child");
    const response: Response = await postDiary(arranged.familyId, {
      kind: "phrase",
      text: "Child should not write this",
    });
    expect(response.status).toBe(403);
  });

  it("returns 404 for an unknown family id treated as data", async () => {
    // Break: missing family is 200, or injection-shaped id changes SQL.
    const arranged = await arrangeDiaryFamily();
    const missing: Response = await getDiary(UNKNOWN_FAMILY_ID);
    expect(missing.status).toBe(404);
    const injected: Response = await getDiary(`${arranged.familyId}' OR 1=1 --`);
    expect(injected.status).toBe(404);
    const listed: DiaryBody = (await (await getDiary(arranged.familyId)).json()) as DiaryBody;
    expect(listed.family_notes?.notes).toEqual([]);
  });
});
