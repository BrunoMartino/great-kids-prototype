import type { QuizAnswerEnvelope } from "./gps-composite";
import type { ProfileCommand } from "./profile-command";

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object";
}

function readEnvelope(p_value: unknown): QuizAnswerEnvelope | null {
  if (!isRecord(p_value) || typeof p_value.id !== "string") {
    return null;
  }
  if (!Array.isArray(p_value.answers)) {
    return null;
  }
  const answers: QuizAnswerEnvelope["answers"] = [];
  for (const p_item of p_value.answers) {
    if (!isRecord(p_item)) {
      return null;
    }
    if (typeof p_item.question_id !== "string") {
      return null;
    }
    if (typeof p_item.answer_text !== "string") {
      return null;
    }
    answers.push({
      question_id: p_item.question_id,
      answer_text: p_item.answer_text,
      deleted: p_item.deleted === true,
    });
  }
  return { id: p_value.id, answers };
}

export class DeleteAnswerCommand implements ProfileCommand {
  public constructor(
    private readonly p_familyId: string,
    private readonly p_questionId: string,
  ) {}

  public async execute(): Promise<QuizAnswerEnvelope> {
    const response: Response = await fetch(
      `/api/families/${encodeURIComponent(this.p_familyId)}/profile/answers`,
      {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ question_id: this.p_questionId }),
      },
    );
    if (!response.ok) {
      throw new Error(`delete failed:${String(response.status)}`);
    }
    const body: unknown = await response.json();
    const envelope: QuizAnswerEnvelope | null = readEnvelope(body);
    if (envelope === null) {
      throw new Error("delete envelope invalid");
    }
    return envelope;
  }

  public async undo(): Promise<void> {
    return;
  }
}
