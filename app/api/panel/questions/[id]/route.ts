import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import { getMockSession } from "@/internal/db/mock-session";
import {
  FamilyQuiz,
  type FamilyQuizRecord,
  type FamilyQuizUpdateInput,
} from "@/models/family_quiz";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type QuestionPatchBody = {
  question_text?: string;
  kind?: string;
  weight?: number;
  status?: string;
};

type QuestionJson = {
  id: string;
  question_text: string;
  kind: string;
  status: string;
  weight: number;
  deleted: boolean;
};

function toQuestionJson(p_row: FamilyQuizRecord): QuestionJson {
  return {
    id: p_row.id,
    question_text: p_row.question_text,
    kind: p_row.kind,
    status: p_row.status,
    weight: p_row.weight,
    deleted: p_row.deleted === 1,
  };
}

function assertStaff(): Response | null {
  const facade: SurfaceFacade = new SurfaceFacade();
  try {
    facade.assertPanel(getMockSession().role);
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}

function notFound(): Response {
  return Response.json({ error: "not found" }, { status: 404 });
}

export async function GET(p_request: Request, p_context: RouteContext): Promise<Response> {
  void p_request;
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const params: { id: string } = await p_context.params;
  const row: FamilyQuizRecord | null = FamilyQuiz.instance.findById(params.id);
  if (row === null) {
    return notFound();
  }
  return Response.json({ id: crypto.randomUUID(), question: toQuestionJson(row) }, { status: 200 });
}

export async function PATCH(p_request: Request, p_context: RouteContext): Promise<Response> {
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const params: { id: string } = await p_context.params;
  const body: QuestionPatchBody = (await p_request.json()) as QuestionPatchBody;
  const input: FamilyQuizUpdateInput = {};
  if (body.question_text !== undefined) {
    input.question_text = body.question_text;
  }
  if (body.kind !== undefined) {
    input.kind = body.kind;
  }
  if (body.weight !== undefined) {
    input.weight = body.weight;
  }
  if (body.status !== undefined) {
    input.status = body.status;
  }
  try {
    const updated: FamilyQuizRecord | null = FamilyQuiz.instance.update(params.id, input);
    if (updated === null) {
      return notFound();
    }
    return Response.json(
      { id: crypto.randomUUID(), question: toQuestionJson(updated) },
      { status: 200 },
    );
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}

export async function DELETE(p_request: Request, p_context: RouteContext): Promise<Response> {
  void p_request;
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const params: { id: string } = await p_context.params;
  const deleted: FamilyQuizRecord | null = FamilyQuiz.instance.softDelete(params.id);
  if (deleted === null) {
    return notFound();
  }
  return Response.json({ id: crypto.randomUUID(), question: { deleted: true } }, { status: 200 });
}
