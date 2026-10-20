export type NoteKind =
  | "phrase"
  | "first_time"
  | "funny"
  | "learned"
  | "family_fail";

export type DiaryNoteItem = {
  id: string;
  text: string;
  kind: string;
};

export type DiaryNotesEnvelope = {
  id: string;
  notes: DiaryNoteItem[];
};

export type DiaryMissionNoteItem = {
  mission_id: string;
  family_mission_id: string;
  note: DiaryNoteItem;
};

export type DiaryMissionNotesEnvelope = {
  id: string;
  notes: DiaryMissionNoteItem[];
};

export type DiaryPayload = {
  id: string;
  family_notes: DiaryNotesEnvelope;
  mission_note: DiaryMissionNotesEnvelope;
};

export type AddNoteDraft = {
  kind: NoteKind;
  text: string;
  mission_id?: string;
  family_mission_id?: string;
};

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

function readNoteItem(p_value: unknown): DiaryNoteItem | null {
  if (!isRecord(p_value) || typeof p_value.id !== "string") {
    return null;
  }
  if (typeof p_value.text !== "string" || typeof p_value.kind !== "string") {
    return null;
  }
  return { id: p_value.id, text: p_value.text, kind: p_value.kind };
}

function readNotesEnvelope(p_value: unknown): DiaryNotesEnvelope | null {
  if (!isRecord(p_value) || typeof p_value.id !== "string") {
    return null;
  }
  if (!Array.isArray(p_value.notes)) {
    return null;
  }
  const notes: DiaryNoteItem[] = [];
  for (const p_item of p_value.notes) {
    const note: DiaryNoteItem | null = readNoteItem(p_item);
    if (note === null) {
      return null;
    }
    notes.push(note);
  }
  return { id: p_value.id, notes };
}

function readMissionNoteItem(p_value: unknown): DiaryMissionNoteItem | null {
  if (!isRecord(p_value) || typeof p_value.mission_id !== "string") {
    return null;
  }
  if (typeof p_value.family_mission_id !== "string") {
    return null;
  }
  const note: DiaryNoteItem | null = readNoteItem(p_value.note);
  if (note === null) {
    return null;
  }
  return {
    mission_id: p_value.mission_id,
    family_mission_id: p_value.family_mission_id,
    note,
  };
}

function readMissionNotesEnvelope(
  p_value: unknown,
): DiaryMissionNotesEnvelope | null {
  if (!isRecord(p_value) || typeof p_value.id !== "string") {
    return null;
  }
  if (!Array.isArray(p_value.notes)) {
    return null;
  }
  const notes: DiaryMissionNoteItem[] = [];
  for (const p_item of p_value.notes) {
    const item: DiaryMissionNoteItem | null = readMissionNoteItem(p_item);
    if (item === null) {
      return null;
    }
    notes.push(item);
  }
  return { id: p_value.id, notes };
}

export function readDiaryPayload(p_value: unknown): DiaryPayload | null {
  if (!isRecord(p_value) || typeof p_value.id !== "string") {
    return null;
  }
  const familyNotes: DiaryNotesEnvelope | null = readNotesEnvelope(
    p_value.family_notes,
  );
  const missionNote: DiaryMissionNotesEnvelope | null = readMissionNotesEnvelope(
    p_value.mission_note,
  );
  if (familyNotes === null || missionNote === null) {
    return null;
  }
  return {
    id: p_value.id,
    family_notes: familyNotes,
    mission_note: missionNote,
  };
}
