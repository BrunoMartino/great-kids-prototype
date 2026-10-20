import type { QuizCommand } from "@/app/api/families/[id]/quiz/quiz-command";
import {
  ProfileWriteObserver,
  QuizAnswerSubject,
} from "@/app/api/families/[id]/quiz/quiz-observable";
import { FamilyQuiz, type FamilyQuizRecord } from "@/models/family_quiz";
import { FamilyProfile, type QuizAnswerEnvelope, type QuizAnswerItem } from "@/models/family_profile";

export class SubmitAnswerCommand implements QuizCommand {
  private previous: QuizAnswerEnvelope | null = null;

  public constructor(
    private readonly p_familyId: string,
    private readonly p_questionId: string,
    private readonly p_answerText: string,
  ) {}

  public execute(): QuizAnswerEnvelope {
    if (this.p_answerText.trim() === "") {
      throw new Error("empty answer_text");
    }
    const question: FamilyQuizRecord | null = FamilyQuiz.instance.findById(this.p_questionId);
    if (question === null || question.deleted === 1 || question.kind !== "Family-Quiz") {
      throw new Error("unknown question_id");
    }
    const current: QuizAnswerEnvelope | null =
      FamilyProfile.instance.findByFamilyId(this.p_familyId)?.quiz_answer ?? null;
    this.previous = current;
    const item: QuizAnswerItem = {
      question_id: this.p_questionId,
      answer_text: this.p_answerText,
      deleted: false,
    };
    const subject: QuizAnswerSubject = new QuizAnswerSubject(this.p_familyId, item);
    subject.subscribe(new ProfileWriteObserver());
    subject.notify();
    const stored = FamilyProfile.instance.findByFamilyId(this.p_familyId);
    if (stored === null) {
      throw new Error("profile not found");
    }
    return stored.quiz_answer;
  }

  public undo(): void {
    if (this.previous === null) {
      return;
    }
    FamilyProfile.instance.replaceAnswers(this.p_familyId, this.previous);
  }
}
