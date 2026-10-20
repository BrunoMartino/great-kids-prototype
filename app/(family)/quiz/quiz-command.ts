export type QuizAnswerItem = {
  question_id: string;
  answer_text: string;
  deleted: boolean;
};

export type QuizAnswerEnvelope = {
  id: string;
  answers: QuizAnswerItem[];
};

export interface QuizCommand {
  execute(): Promise<QuizAnswerEnvelope>;
  undo(): Promise<void>;
}
