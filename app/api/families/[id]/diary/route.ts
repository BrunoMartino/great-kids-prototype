import {
  AddNoteCommand,
  DiaryNotFoundError,
  EmptyNoteTextError,
  ForeignMissionError,
  PhotoPayloadError,
} from "@/app/api/families/[id]/diary/add-note-command";
import { UnknownNoteKindError } from "@/app/api/families/[id]/diary/kind-strategy";
import { GpsPolicy } from "@/app/api/families/[id]/profile/gps-policy";
import { getFamilyRole, type FamilyRole } from "@/internal/db/mock-session";
import { FamilyDiary, type DiaryDocument } from "@/models/family_diary";

type DiaryRouteContext = {
  params: Promise<{ id: string }>;
};

function deny(): Response {
  return Response.json({ error: "forbidden" }, { status: 403 });
}

function unprocessable(): Response {
  return Response.json({ error: "unprocessable" }, { status: 422 });
}

function notFound(): Response {
  return Response.json({ error: "not found" }, { status: 404 });
}

function toPayload(p_doc: DiaryDocument): {
  id: string;
  family_notes: DiaryDocument["family_notes"];
  mission_note: DiaryDocument["mission_note"];
} {
  if (p_doc.deleted) {
    return {
      id: p_doc.familyId,
      family_notes: { id: p_doc.family_notes.id, notes: [] },
      mission_note: { id: p_doc.mission_note.id, notes: [] },
    };
  }
  return {
    id: p_doc.familyId,
    family_notes: p_doc.family_notes,
    mission_note: p_doc.mission_note,
  };
}

export async function GET(
  p_request: Request,
  p_context: DiaryRouteContext,
): Promise<Response> {
  void p_request;
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  try {
    GpsPolicy.assertCanAnswer(getFamilyRole());
  } catch {
    return deny();
  }
  const stored: DiaryDocument | null = FamilyDiary.instance.findByFamilyId(familyId);
  if (stored === null) {
    return notFound();
  }
  return Response.json(toPayload(stored), { status: 200 });
}

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

function assertCanAuthorNote(p_role: FamilyRole, p_body: unknown): void {
  if (p_role === "Parent") {
    GpsPolicy.assertCanEdit(p_role);
    return;
  }
  if (p_role !== "Child") {
    throw new Error("family diary author forbidden");
  }
  if (!isRecord(p_body)) {
    throw new Error("family diary author forbidden");
  }
  if (
    typeof p_body.mission_id !== "string" ||
    typeof p_body.family_mission_id !== "string"
  ) {
    throw new Error("family diary author forbidden");
  }
}

export async function POST(
  p_request: Request,
  p_context: DiaryRouteContext,
): Promise<Response> {
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  let body: unknown;
  try {
    body = await p_request.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  try {
    assertCanAuthorNote(getFamilyRole(), body);
  } catch {
    return deny();
  }
  try {
    const stored: DiaryDocument = new AddNoteCommand(familyId, body).execute();
    return Response.json(toPayload(stored), { status: 200 });
  } catch (p_error: unknown) {
    if (p_error instanceof DiaryNotFoundError) {
      return notFound();
    }
    if (
      p_error instanceof UnknownNoteKindError ||
      p_error instanceof EmptyNoteTextError ||
      p_error instanceof PhotoPayloadError ||
      p_error instanceof ForeignMissionError
    ) {
      return unprocessable();
    }
    throw p_error;
  }
}
