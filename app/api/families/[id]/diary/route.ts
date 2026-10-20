import {
  AddNoteCommand,
  DiaryNotFoundError,
  EmptyNoteTextError,
  ForeignMissionError,
  PhotoPayloadError,
} from "@/app/api/families/[id]/diary/add-note-command";
import { UnknownNoteKindError } from "@/app/api/families/[id]/diary/kind-strategy";
import { GpsPolicy } from "@/app/api/families/[id]/profile/gps-policy";
import { getMockSession } from "@/internal/db/mock-session";
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
    GpsPolicy.assertCanAnswer(getMockSession().role);
  } catch {
    return deny();
  }
  const stored: DiaryDocument | null = FamilyDiary.instance.findByFamilyId(familyId);
  if (stored === null) {
    return notFound();
  }
  return Response.json(toPayload(stored), { status: 200 });
}

export async function POST(
  p_request: Request,
  p_context: DiaryRouteContext,
): Promise<Response> {
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  try {
    GpsPolicy.assertCanEdit(getMockSession().role);
  } catch {
    return deny();
  }
  let body: unknown;
  try {
    body = await p_request.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
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
