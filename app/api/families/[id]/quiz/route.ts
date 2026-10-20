import { ModeStrategy } from "@/app/api/families/[id]/quiz/mode-strategy";
import { SubmitAnswerCommand } from "@/app/api/families/[id]/quiz/submit-answer-command";
import { GpsPolicy } from "@/app/api/families/[id]/profile/gps-policy";
import { getMockSession } from "@/internal/db/mock-session";
import { Family } from "@/models/family";
import { FamilyQuiz, type FamilyQuizRecord } from "@/models/family_quiz";
import type { QuizAnswerEnvelope } from "@/models/family_profile";

type FamilyRouteContext = {
  params: Promise<{ id: string }>;
};

type QuizPostBody = {
  question_id?: string;
  answer_text?: string;
  mode?: string;
};

function deny(): Response {
  return Response.json({ error: "forbidden" }, { status: 403 });
}

function badRequest(): Response {
  return Response.json({ error: "bad request" }, { status: 400 });
}

export async function GET(
  p_request: Request,
  p_context: FamilyRouteContext,
): Promise<Response> {
  void p_request;
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  try {
    GpsPolicy.assertCanAnswer(getMockSession().role);
  } catch {
    return deny();
  }
  if (Family.instance.findHolderUserId(familyId) === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const live: FamilyQuizRecord[] = FamilyQuiz.instance
    .listLive("Family-Quiz")
    .filter((p_row: FamilyQuizRecord) => p_row.status === "active");
  const envelopeId: string = crypto.randomUUID();
  return Response.json(
    {
      id: envelopeId,
      questions: live.map((p_row: FamilyQuizRecord) => ({
        id: p_row.id,
        question_text: p_row.question_text,
      })),
    },
    { status: 200 },
  );
}

export async function POST(
  p_request: Request,
  p_context: FamilyRouteContext,
): Promise<Response> {
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  try {
    GpsPolicy.assertCanAnswer(getMockSession().role);
  } catch {
    return deny();
  }
  if (Family.instance.findHolderUserId(familyId) === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  let body: QuizPostBody;
  try {
    body = (await p_request.json()) as QuizPostBody;
  } catch {
    return badRequest();
  }
  try {
    new ModeStrategy().resolve(body.mode);
  } catch {
    return badRequest();
  }
  const questionId: string = body.question_id ?? "";
  const answerText: string = body.answer_text ?? "";
  try {
    const command: SubmitAnswerCommand = new SubmitAnswerCommand(
      familyId,
      questionId,
      answerText,
    );
    const stored: QuizAnswerEnvelope = command.execute();
    return Response.json(stored, { status: 200 });
  } catch {
    return badRequest();
  }
}
