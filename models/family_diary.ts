import { getConnection, queryRaw } from "@/internal/db/connection";

export type FamilyDiaryRecord = {
  id: string;
};

export type NoteItem = {
  id: string;
  text: string;
  kind: string;
};

export type NotesEnvelope = {
  id: string;
  notes: NoteItem[];
};

export type MissionNoteItem = {
  mission_id: string;
  family_mission_id: string;
  note: NoteItem;
};

export type MissionNotesEnvelope = {
  id: string;
  notes: MissionNoteItem[];
};

export type DiaryDocument = {
  familyId: string;
  diaryId: string;
  deleted: boolean;
  family_notes: NotesEnvelope;
  mission_note: MissionNotesEnvelope;
};

type DiaryRow = {
  id: string;
  family_id: string;
  family_notes: string;
  mission_note: string;
  deleted: number;
};

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

function parseNoteItem(p_value: unknown): NoteItem {
  if (!isRecord(p_value)) {
    throw new Error("invalid note");
  }
  if (
    typeof p_value.id !== "string" ||
    typeof p_value.text !== "string" ||
    typeof p_value.kind !== "string"
  ) {
    throw new Error("invalid note");
  }
  return { id: p_value.id, text: p_value.text, kind: p_value.kind };
}

function parseNotesEnvelope(p_json: string): NotesEnvelope {
  const parsed: unknown = JSON.parse(p_json);
  if (Array.isArray(parsed)) {
    throw new Error("family_notes must be an envelope");
  }
  if (!isRecord(parsed) || typeof parsed.id !== "string" || !Array.isArray(parsed.notes)) {
    throw new Error("family_notes must be an envelope");
  }
  return { id: parsed.id, notes: parsed.notes.map(parseNoteItem) };
}

function parseMissionNoteItem(p_value: unknown): MissionNoteItem {
  if (!isRecord(p_value)) {
    throw new Error("invalid mission_note");
  }
  if (typeof p_value.mission_id !== "string" || typeof p_value.family_mission_id !== "string") {
    throw new Error("invalid mission_note");
  }
  return {
    mission_id: p_value.mission_id,
    family_mission_id: p_value.family_mission_id,
    note: parseNoteItem(p_value.note),
  };
}

function parseMissionNotesEnvelope(p_json: string): MissionNotesEnvelope {
  const parsed: unknown = JSON.parse(p_json);
  if (Array.isArray(parsed)) {
    throw new Error("mission_note must be an envelope");
  }
  if (!isRecord(parsed) || typeof parsed.id !== "string" || !Array.isArray(parsed.notes)) {
    throw new Error("mission_note must be an envelope");
  }
  return { id: parsed.id, notes: parsed.notes.map(parseMissionNoteItem) };
}

export class FamilyDiary {
  private static _instance: FamilyDiary | null = null;

  private constructor() {}

  public static get instance(): FamilyDiary {
    if (FamilyDiary._instance === null) {
      FamilyDiary._instance = new FamilyDiary();
    }
    return FamilyDiary._instance;
  }

  public insertEmpty(): FamilyDiaryRecord {
    getConnection();
    const id: string = crypto.randomUUID();
    const now: string = new Date().toISOString();
    queryRaw(
      `INSERT INTO family_diary (
        id, family_notes, mission_note, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        JSON.stringify({ id, notes: [] }),
        JSON.stringify({ id, notes: [] }),
        now,
        now,
      ],
    );
    return { id };
  }

  public findByFamilyId(p_familyId: string): DiaryDocument | null {
    getConnection();
    const rows: DiaryRow[] = queryRaw<DiaryRow>(
      `SELECT fd.id, f.id AS family_id, fd.family_notes, fd.mission_note, fd.deleted
       FROM family_diary fd
       INNER JOIN family f ON f.fam_diary_id = fd.id
       WHERE f.id = ?`,
      [p_familyId],
    );
    const row: DiaryRow | undefined = rows[0];
    if (row === undefined) {
      return null;
    }
    return {
      familyId: row.family_id,
      diaryId: row.id,
      deleted: row.deleted === 1,
      family_notes: parseNotesEnvelope(row.family_notes),
      mission_note: parseMissionNotesEnvelope(row.mission_note),
    };
  }

  public replaceNotes(
    p_familyId: string,
    p_familyNotes: NotesEnvelope,
    p_missionNote: MissionNotesEnvelope,
  ): DiaryDocument {
    const current: DiaryDocument | null = this.findByFamilyId(p_familyId);
    if (current === null) {
      throw new Error("diary not found");
    }
    const now: string = new Date().toISOString();
    queryRaw(
      `UPDATE family_diary SET family_notes = ?, mission_note = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(p_familyNotes), JSON.stringify(p_missionNote), now, current.diaryId],
    );
    const stored: DiaryDocument | null = this.findByFamilyId(p_familyId);
    if (stored === null) {
      throw new Error("diary not found");
    }
    return stored;
  }
}
