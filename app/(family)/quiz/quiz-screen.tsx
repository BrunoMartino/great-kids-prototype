"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import {
  CheckIcon,
  LockIcon,
  QuestionIcon,
  WarningIcon,
} from "@/app/design-system/icons";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import { LoadingCard, StateCard, Well } from "../chrome/family-ui";
import { useFamilySession } from "../context-switch/family-session-context";
import type { QuizMode } from "./mode-strategy";
import {
  QuizSessionProvider,
  useQuizSession,
  type QuizQuestion,
} from "./quiz-session-context";

type ModeChoice = {
  mode: QuizMode;
  label: string;
  hint: string;
};

const MODE_CHOICES: readonly ModeChoice[] = [
  { mode: "solo", label: "Solo", hint: "One adult answers alone." },
  { mode: "table", label: "At the table", hint: "The family answers together." },
];

const ANSWER_FORM_ID: string = "quiz-answer-form";

function QuizScreenBody(): ReactElement {
  const quiz: ReturnType<typeof useQuizSession> = useQuizSession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const presentation = quiz.presentation;
  const [index, setIndex] = useState<number>(0);
  const questions: QuizQuestion[] = presentation.kind === "ready" ? presentation.questions : [];
  const total: number = questions.length;
  const safeIndex: number = total === 0 ? 0 : Math.min(index, total - 1);
  const current: QuizQuestion | undefined = questions[safeIndex];
  const progress: number = total === 0 ? 0 : (safeIndex + 1) / total;

  const onSubmit = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    if (current !== undefined) {
      void quiz.submitAnswer(current.id);
    }
  };

  const skip = (): void => {
    if (total > 0) {
      setIndex((safeIndex + 1) % total);
    }
  };

  return (
    <div data-quiz-screen data-mode={quiz.mode}>
      <FamilyThumbShell
        sub="Getting to know you"
        title="Family quiz"
        content={
          <>
            {presentation.kind === "loading" || session.isLoading ? (
              <LoadingCard label="Loading the quiz" />
            ) : null}
            {presentation.kind === "need-family" && !session.isLoading ? (
              <StateCard icon={QuestionIcon} title="Family quiz">
                <p>Opening the family quiz.</p>
              </StateCard>
            ) : null}
            {presentation.kind === "denied" ? (
              <StateCard icon={LockIcon} title="Quiz unavailable" role="alert">
                <p>Only Parent or Child answer the family quiz.</p>
              </StateCard>
            ) : null}
            {presentation.kind === "missing" ? (
              <StateCard icon={WarningIcon} title="Family not found">
                <p>That id does not open a quiz.</p>
              </StateCard>
            ) : null}
            {presentation.kind === "error" ? (
              <StateCard icon={WarningIcon} title="Family quiz" role="alert">
                <p>{presentation.message}</p>
              </StateCard>
            ) : null}
            {presentation.kind === "ready" && current === undefined ? (
              <StateCard icon={QuestionIcon} title="All caught up">
                <p>No family questions right now.</p>
              </StateCard>
            ) : null}
            {presentation.kind === "ready" && current !== undefined ? (
              <>
                <div data-gk-stack data-gk-enter>
                  <div data-gk-progress-meta>
                    <span>
                      Question {String(safeIndex + 1)} of {String(total)}
                    </span>
                    <span>{String(total - safeIndex - 1)} left after this</span>
                  </div>
                  <div
                    data-gk-progress
                    role="progressbar"
                    aria-label="Quiz progress"
                    aria-valuemin={0}
                    aria-valuemax={total}
                    aria-valuenow={safeIndex + 1}
                  >
                    <i style={{ transform: `scaleX(${String(progress)})` }} />
                  </div>
                </div>
                <form
                  id={ANSWER_FORM_ID}
                  data-gk-qcard
                  data-gk-enter
                  key={current.id}
                  onSubmit={onSubmit}
                >
                  <Well icon={QuestionIcon} />
                  <h2>{current.question_text}</h2>
                  <fieldset data-gk-stack aria-label="How are you answering?">
                    {MODE_CHOICES.map((p_choice: ModeChoice) => (
                      <button
                        key={p_choice.mode}
                        type="button"
                        data-gk-choice
                        aria-pressed={quiz.mode === p_choice.mode}
                        onClick={(): void => {
                          quiz.setMode(p_choice.mode);
                        }}
                      >
                        <span data-gk-radio aria-hidden="true" />
                        <span data-gk-choice-text>
                          {p_choice.label}
                          <small>{p_choice.hint}</small>
                        </span>
                      </button>
                    ))}
                  </fieldset>
                  <label data-gk-field>
                    Your answer
                    <textarea
                      data-gk-input
                      name={`answer-${current.id}`}
                      value={quiz.drafts[current.id] ?? ""}
                      onChange={(p_event: ChangeEvent<HTMLTextAreaElement>): void => {
                        quiz.setDraft(current.id, p_event.currentTarget.value);
                      }}
                    />
                  </label>
                </form>
                {quiz.lastEnvelope !== null ? (
                  <p data-gk-alert="success" role="status">
                    <CheckIcon size={20} aria-hidden="true" />
                    {String(quiz.lastEnvelope.answers.length)} answers in GPS.
                  </p>
                ) : null}
                {quiz.formError !== null ? (
                  <p data-gk-alert="danger" role="alert">
                    <WarningIcon size={20} aria-hidden="true" />
                    {quiz.formError}
                  </p>
                ) : null}
                <p data-gk-caption>
                  Your answers shape the missions we suggest. You can edit them later in Profile.
                </p>
              </>
            ) : null}
          </>
        }
        actions={
          presentation.kind === "ready" && current !== undefined ? (
            <div data-gk-action-row>
              <button
                type="button"
                data-gk-btn="ghost"
                disabled={total < 2}
                onClick={skip}
              >
                Skip
              </button>
              <button
                type="submit"
                form={ANSWER_FORM_ID}
                data-gk-btn="primary"
                disabled={quiz.isSubmitting}
              >
                Save answer
              </button>
            </div>
          ) : undefined
        }
      />
    </div>
  );
}

export function QuizScreen(): ReactElement {
  return (
    <QuizSessionProvider>
      <QuizScreenBody />
    </QuizSessionProvider>
  );
}
