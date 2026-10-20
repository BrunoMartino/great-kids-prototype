import type { QuizCommand } from "@/app/api/families/[id]/quiz/quiz-command";
import { FamilyProfile, type QuizAnswerEnvelope, type QuizAnswerItem } from "@/models/family_profile";

export class DeleteAnswerCommand implements QuizCommand {
  private previous: QuizAnswerEnvelope | null = null;

  public constructor(
    private readonly p_familyId: string,
    private readonly p_questionId: string,
  ) {}

  public execute(): QuizAnswerEnvelope {
    const current = FamilyProfile.instance.findByFamilyId(this.p_familyId);
    if (current === null) {
      throw new Error("profile not found");
    }
    this.previous = current.quiz_answer;
    const found: boolean = current.quiz_answer.answers.some(
      (p_item: QuizAnswerItem) => p_item.question_id === this.p_questionId,
    );
    if (found === false) {
      throw new Error("unknown question_id");
    }
    const nextAnswers: QuizAnswerItem[] = current.quiz_answer.answers.map(
      (p_item: QuizAnswerItem) => {
        if (p_item.question_id !== this.p_questionId) {
          return p_item;
        }
        return {
          question_id: p_item.question_id,
          answer_text: p_item.answer_text,
          deleted: true,
        };
      },
    );
    return FamilyProfile.instance.replaceAnswers(this.p_familyId, {
      id: current.quiz_answer.id,
      answers: nextAnswers,
    });
  }

  public undo(): void {
    if (this.previous === null) {
      return;
    }
    FamilyProfile.instance.replaceAnswers(this.p_familyId, this.previous);
  }
}
