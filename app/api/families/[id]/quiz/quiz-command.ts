import type { QuizAnswerEnvelope } from "@/models/family_profile";

export interface QuizCommand {
  execute(): QuizAnswerEnvelope;
  undo(): void;
}
