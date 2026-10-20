import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import {
  FamilyQuizKindStrategy,
  KindStrategy,
  SayWhatKindStrategy,
} from "@/app/api/panel/questions/kind-strategy";
import { getMockSession } from "@/internal/db/mock-session";
import { FamilyQuiz, type FamilyQuizRecord } from "@/models/family_quiz";

type QuestionPostBody = {
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

function strategyFor(p_kind: string): KindStrategy {
  if (p_kind === "Family-Quiz") {
    return new FamilyQuizKindStrategy();
  }
  if (p_kind === "Say-What") {
    return new SayWhatKindStrategy();
  }
  return new KindStrategy(p_kind);
}

export async function GET(p_request: Request): Promise<Response> {
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const url: URL = new URL(p_request.url);
  const kind: string | null = url.searchParams.get("kind");
  const rows: FamilyQuizRecord[] =
    kind === null ? FamilyQuiz.instance.list() : strategyFor(kind).offer();
  return Response.json(
    {
      id: crypto.randomUUID(),
      questions: rows.map((p_row: FamilyQuizRecord) => toQuestionJson(p_row)),
    },
    { status: 200 },
  );
}

export async function POST(p_request: Request): Promise<Response> {
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const body: QuestionPostBody = (await p_request.json()) as QuestionPostBody;
  try {
    const created: FamilyQuizRecord = FamilyQuiz.instance.create({
      question_text: body.question_text ?? "",
      kind: body.kind ?? "",
      weight: body.weight ?? 0,
      status: body.status ?? "active",
    });
    return Response.json(
      {
        id: crypto.randomUUID(),
        question: toQuestionJson(created),
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
