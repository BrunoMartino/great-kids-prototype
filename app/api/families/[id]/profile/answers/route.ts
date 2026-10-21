import { DeleteAnswerCommand } from "@/app/api/families/[id]/profile/delete-answer-command";
import { EditAnswerCommand } from "@/app/api/families/[id]/profile/edit-answer-command";
import { GpsPolicy } from "@/app/api/families/[id]/profile/gps-policy";
import { getFamilyRole } from "@/internal/db/mock-session";
import { FamilyProfile, type QuizAnswerEnvelope, type QuizAnswerItem } from "@/models/family_profile";

type FamilyRouteContext = {
  params: Promise<{ id: string }>;
};

type AnswersBody = {
  question_id?: string;
  answer_text?: string;
};

function deny(): Response {
  return Response.json({ error: "forbidden" }, { status: 403 });
}

function badRequest(): Response {
  return Response.json({ error: "bad request" }, { status: 400 });
}

function notFound(): Response {
  return Response.json({ error: "not found" }, { status: 404 });
}

export async function GET(
  p_request: Request,
  p_context: FamilyRouteContext,
): Promise<Response> {
  void p_request;
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  try {
    GpsPolicy.assertCanEdit(getFamilyRole());
  } catch {
    return deny();
  }
  const document = FamilyProfile.instance.findByFamilyId(familyId);
  if (document === null) {
    return notFound();
  }
  const visible: QuizAnswerItem[] = document.quiz_answer.answers.filter(
    (p_item: QuizAnswerItem) => p_item.deleted === false,
  );
  const envelope: QuizAnswerEnvelope = {
    id: document.quiz_answer.id,
    answers: visible,
  };
  return Response.json(envelope, { status: 200 });
}

export async function PATCH(
  p_request: Request,
  p_context: FamilyRouteContext,
): Promise<Response> {
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  try {
    GpsPolicy.assertCanEdit(getFamilyRole());
  } catch {
    return deny();
  }
  let body: AnswersBody;
  try {
    body = (await p_request.json()) as AnswersBody;
  } catch {
    return badRequest();
  }
  try {
    const command: EditAnswerCommand = new EditAnswerCommand(
      familyId,
      body.question_id ?? "",
      body.answer_text ?? "",
    );
    const stored: QuizAnswerEnvelope = command.execute();
    return Response.json(stored, { status: 200 });
  } catch {
    return badRequest();
  }
}

export async function DELETE(
  p_request: Request,
  p_context: FamilyRouteContext,
): Promise<Response> {
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  try {
    GpsPolicy.assertCanEdit(getFamilyRole());
  } catch {
    return deny();
  }
  let body: AnswersBody;
  try {
    body = (await p_request.json()) as AnswersBody;
  } catch {
    return badRequest();
  }
  try {
    const command: DeleteAnswerCommand = new DeleteAnswerCommand(
      familyId,
      body.question_id ?? "",
    );
    const stored: QuizAnswerEnvelope = command.execute();
    return Response.json(stored, { status: 200 });
  } catch {
    return badRequest();
  }
}
