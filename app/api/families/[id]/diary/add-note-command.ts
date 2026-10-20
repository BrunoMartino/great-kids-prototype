import type { DiaryCommand } from "@/app/api/families/[id]/diary/diary-command";
import { resolveNoteKind, UnknownNoteKindError } from "@/app/api/families/[id]/diary/kind-strategy";
import {
  MissionNoteLeaf,
  MissionNotesComposite,
  NoteLeaf,
  NotesComposite,
} from "@/app/api/families/[id]/diary/notes-composite";
import {
  FamilyDiary,
  type DiaryDocument,
  type MissionNotesEnvelope,
  type NoteItem,
  type NotesEnvelope,
} from "@/models/family_diary";
import { FamilyMission, type FamilyMissionRow } from "@/models/family_mission";

export class PhotoPayloadError extends Error {
  public constructor() {
    super("photo payload rejected");
    this.name = "PhotoPayloadError";
  }
}

export class EmptyNoteTextError extends Error {
  public constructor() {
    super("empty note text");
    this.name = "EmptyNoteTextError";
  }
}

export class ForeignMissionError extends Error {
  public constructor() {
    super("foreign mission");
    this.name = "ForeignMissionError";
  }
}

export class DiaryNotFoundError extends Error {
  public constructor() {
    super("diary not found");
    this.name = "DiaryNotFoundError";
  }
}

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

function assertNoPhoto(p_body: Record<string, unknown>, p_text: string): void {
  if ("photo" in p_body || "image" in p_body || "img" in p_body) {
    throw new PhotoPayloadError();
  }
  if (p_text.includes("data:image")) {
    throw new PhotoPayloadError();
  }
}

function assertOwnedMission(
  p_familyId: string,
  p_missionId: unknown,
  p_familyMissionId: unknown,
): { missionId: string; familyMissionId: string } | null {
  const hasMission: boolean = p_missionId !== undefined;
  const hasCycle: boolean = p_familyMissionId !== undefined;
  if (!hasMission && !hasCycle) {
    return null;
  }
  if (typeof p_missionId !== "string" || typeof p_familyMissionId !== "string") {
    throw new ForeignMissionError();
  }
  const row: FamilyMissionRow | null = FamilyMission.instance.findById(p_familyMissionId);
  if (row === null || row.fam_id !== p_familyId || row.mission_id !== p_missionId) {
    throw new ForeignMissionError();
  }
  return { missionId: p_missionId, familyMissionId: p_familyMissionId };
}

export class AddNoteCommand implements DiaryCommand {
  private previousFamilyNotes: NotesEnvelope | null = null;
  private previousMissionNote: MissionNotesEnvelope | null = null;

  public constructor(
    private readonly p_familyId: string,
    private readonly p_body: unknown,
  ) {}

  public execute(): DiaryDocument {
    if (!isRecord(this.p_body)) {
      throw new EmptyNoteTextError();
    }
    if (typeof this.p_body.text !== "string" || this.p_body.text.trim() === "") {
      throw new EmptyNoteTextError();
    }
    const text: string = this.p_body.text;
    assertNoPhoto(this.p_body, text);
    if (typeof this.p_body.kind !== "string") {
      throw new UnknownNoteKindError();
    }
    const strategyKind: string = resolveNoteKind(this.p_body.kind).kind;
    const link: { missionId: string; familyMissionId: string } | null = assertOwnedMission(
      this.p_familyId,
      this.p_body.mission_id,
      this.p_body.family_mission_id,
    );
    const current: DiaryDocument | null = FamilyDiary.instance.findByFamilyId(this.p_familyId);
    if (current === null) {
      throw new DiaryNotFoundError();
    }
    this.previousFamilyNotes = current.family_notes;
    this.previousMissionNote = current.mission_note;
    const note: NoteItem = { id: crypto.randomUUID(), text, kind: strategyKind };
    const familyHub: NotesComposite = NotesComposite.fromEnvelope(current.family_notes);
    familyHub.add(new NoteLeaf(note));
    const missionHub: MissionNotesComposite = MissionNotesComposite.fromEnvelope(
      current.mission_note,
    );
    if (link !== null) {
      missionHub.add(
        new MissionNoteLeaf({
          mission_id: link.missionId,
          family_mission_id: link.familyMissionId,
          note,
        }),
      );
    }
    return FamilyDiary.instance.replaceNotes(
      this.p_familyId,
      familyHub.toEnvelope(),
      missionHub.toEnvelope(),
    );
  }

  public undo(): void {
    if (this.previousFamilyNotes === null || this.previousMissionNote === null) {
      return;
    }
    FamilyDiary.instance.replaceNotes(
      this.p_familyId,
      this.previousFamilyNotes,
      this.previousMissionNote,
    );
  }
}
