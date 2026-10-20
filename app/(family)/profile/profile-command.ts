import type { QuizAnswerEnvelope } from "./gps-composite";

export interface ProfileCommand {
  execute(): Promise<QuizAnswerEnvelope>;
  undo(): Promise<void>;
}
