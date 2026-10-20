"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import { FamilyNav } from "../chrome/family-nav";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import { useFamilySession } from "../context-switch/family-session-context";
import type { QuizMode } from "./mode-strategy";
import {
  QuizSessionProvider,
  useQuizSession,
  type QuizQuestion,
} from "./quiz-session-context";

const SCREEN_STYLES: string = `
[data-quiz-screen] {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
[data-quiz-scroll] {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 16px;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overflow-anchor: none;
  padding: 8px 4px 16px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: #c4b8ac transparent;
  scrollbar-color: color-mix(in srgb, var(--color-ink) 22%, transparent) transparent;
}
[data-quiz-scroll]::-webkit-scrollbar {
  width: 4px;
}
[data-quiz-scroll]::-webkit-scrollbar-thumb {
  background: #c4b8ac;
  background: color-mix(in srgb, var(--color-ink) 22%, transparent);
  border-radius: 999px;
}
[data-quiz-screen] h1 {
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.25;
}
[data-quiz-screen] p {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.45;
}
[data-quiz-badge] {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  width: fit-content;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #efdfd8;
  background: color-mix(in srgb, var(--color-primary) 14%, var(--color-paper));
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-quiz-badge][data-role="Child"] {
  background: #e8e1e2;
  background: color-mix(in srgb, var(--color-child) 14%, var(--color-paper));
  color: var(--color-child);
}
[data-quiz-enter] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  opacity: 1;
  transform: translate3d(0, 0, 0);
  animation: quiz-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes quiz-enter {
  from {
    opacity: 0;
    transform: translate3d(0, 8px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
[data-quiz-loading-bar] {
  height: 12px;
  border-radius: 999px;
  background: #eae3de;
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  transform-origin: left center;
  transform: translateZ(0);
  animation: quiz-load 900ms ease-in-out infinite;
}
@keyframes quiz-load {
  0% { opacity: 0.45; transform: scaleX(0.55); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.45; transform: scaleX(0.55); }
}
[data-quiz-card],
[data-quiz-tools] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 20px;
  background: #f3e6d8;
  background: color-mix(in srgb, var(--color-tertiary) 22%, var(--color-paper));
}
[data-quiz-tools] label,
[data-quiz-card] label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--color-muted);
  font-size: 0.85rem;
}
[data-quiz-screen] input,
[data-quiz-screen] textarea {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  padding: 10px 14px;
  border: 1px solid #ddd2c6;
  border: 1px solid color-mix(in srgb, var(--color-ink) 14%, var(--color-tertiary));
  border-radius: 14px;
  background: var(--color-paper);
  color: var(--color-ink);
  font: inherit;
  font-size: 16px;
  -webkit-appearance: none;
  appearance: none;
}
[data-quiz-screen] textarea {
  min-height: 88px;
  resize: none;
}
[data-quiz-screen] input:focus,
[data-quiz-screen] textarea:focus,
[data-quiz-screen] button:focus {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
[data-quiz-screen] input:focus:not(:focus-visible),
[data-quiz-screen] textarea:focus:not(:focus-visible),
[data-quiz-screen] button:focus:not(:focus-visible) {
  outline: none;
}
[data-quiz-screen] input:focus-visible,
[data-quiz-screen] textarea:focus-visible,
[data-quiz-screen] button:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
[data-quiz-modes] {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 44px;
  padding: 4px;
  border-radius: 999px;
  background: #eee8e2;
  background: color-mix(in srgb, var(--color-ink) 8%, var(--color-paper));
}
[data-quiz-mode-thumb] {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(50% - 4px);
  border-radius: 999px;
  background: var(--color-paper);
  box-shadow: 0 1px 4px color-mix(in srgb, var(--color-ink) 16%, transparent);
  transform: translate3d(0, 0, 0);
  transition: transform 240ms ease-in-out;
  pointer-events: none;
}
[data-quiz-mode-thumb][data-mode="table"] {
  transform: translate3d(100%, 0, 0);
}
[data-quiz-modes] button {
  position: relative;
  z-index: 1;
  min-height: 44px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--color-muted);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
[data-quiz-modes] button[aria-pressed="true"] {
  color: var(--color-ink);
}
[data-quiz-screen] button[data-kind="submit"],
[data-quiz-screen] button[data-kind="apply"] {
  min-height: 44px;
  margin: 0;
  padding: 0 16px;
  border: 0;
  border-radius: 14px;
  background: var(--color-primary);
  color: var(--color-paper);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
[data-quiz-screen] button:active {
  opacity: 0.88;
}
[data-quiz-screen] button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
[data-quiz-error],
[data-quiz-success] {
  color: var(--color-ink);
  font-weight: 600;
}
[data-quiz-error] {
  color: var(--color-danger);
}
@media (hover: hover) and (pointer: fine) {
  [data-quiz-screen] button[data-kind="submit"]:hover:not(:disabled),
  [data-quiz-screen] button[data-kind="apply"]:hover:not(:disabled) {
    opacity: 0.92;
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-quiz-screen] *,
  [data-quiz-screen] *::before,
  [data-quiz-screen] *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
  [data-quiz-enter] {
    opacity: 1;
    transform: none;
  }
  [data-quiz-loading-bar],
  [data-quiz-mode-thumb] {
    transform: none;
  }
}
`;

function QuizScreenBody(): ReactElement {
  const quiz: ReturnType<typeof useQuizSession> = useQuizSession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const role: string = session.snapshot?.role ?? "none";
  const presentation = quiz.presentation;
  const [questionIndex, setQuestionIndex] = useState<number>(0);

  useEffect(() => {
    setQuestionIndex(0);
  }, [presentation.kind === "ready" ? presentation.questions.length : 0, quiz.familyId]);

  const questions: QuizQuestion[] =
    presentation.kind === "ready" ? presentation.questions : [];
  const safeIndex: number =
    questions.length === 0
      ? 0
      : Math.min(questionIndex, questions.length - 1);
  const current: QuizQuestion | null =
    questions.length > 0 ? questions[safeIndex] ?? null : null;
  const isDone: boolean =
    presentation.kind === "ready" &&
    questions.length > 0 &&
    questionIndex >= questions.length;

  return (
    <div data-quiz-screen data-mode={quiz.mode}>
      <style href="quiz-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-quiz-scroll>
        <FamilyThumbShell
          content={
            <>
              <FamilyNav familyId={quiz.familyId} active="quiz" />
              <span data-quiz-badge data-role={role}>
                View {role === "none" ? "session" : role}
              </span>
              {presentation.kind === "loading" || session.isLoading ? (
                <div data-quiz-enter aria-live="polite" aria-busy="true">
                  <h1>Loading the quiz</h1>
                  <div data-quiz-loading-bar />
                </div>
              ) : null}
              {presentation.kind === "need-family" && !session.isLoading ? (
                <div data-quiz-enter>
                  <h1>Family quiz</h1>
                  <p>Opening the family quiz.</p>
                </div>
              ) : null}
              {presentation.kind === "denied" ? (
                <div data-quiz-enter role="alert">
                  <h1>Quiz unavailable</h1>
                  <p>Only Parent or Child answer the family quiz.</p>
                </div>
              ) : null}
              {presentation.kind === "missing" ? (
                <div data-quiz-enter>
                  <h1>Family not found</h1>
                  <p>That id does not open a quiz.</p>
                </div>
              ) : null}
              {presentation.kind === "error" ? (
                <div data-quiz-enter role="alert">
                  <h1>Family quiz</h1>
                  <p>{presentation.message}</p>
                </div>
              ) : null}
              {presentation.kind === "ready" ? (
                <div data-quiz-enter>
                  <h1>Family quiz</h1>
                  <p>{quiz.modePrompt}</p>
                  {questions.length === 0 ? (
                    <div data-quiz-card>
                      <p>No family questions right now.</p>
                    </div>
                  ) : null}
                  {isDone ? (
                    <div data-quiz-card>
                      <p>All questions answered for now.</p>
                      {quiz.lastEnvelope !== null ? (
                        <p data-quiz-success>
                          {String(quiz.lastEnvelope.answers.length)} answers in
                          GPS.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {current !== null && !isDone ? (
                    <div data-quiz-card data-quiz-prompt="true">
                      <p>
                        Question {String(safeIndex + 1)} of{" "}
                        {String(questions.length)}
                      </p>
                      <p>{current.question_text}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
          }
          actions={
            presentation.kind === "ready" && current !== null && !isDone ? (
              <>
                <div data-quiz-modes>
                  <span data-quiz-mode-thumb data-mode={quiz.mode} aria-hidden="true" />
                  <button
                    type="button"
                    aria-pressed={quiz.mode === "solo"}
                    onClick={(): void => {
                      quiz.setMode("solo" satisfies QuizMode);
                    }}
                  >
                    Solo
                  </button>
                  <button
                    type="button"
                    aria-pressed={quiz.mode === "table"}
                    onClick={(): void => {
                      quiz.setMode("table" satisfies QuizMode);
                    }}
                  >
                    At the table
                  </button>
                </div>
                <form
                  data-quiz-card
                  onSubmit={(p_event: FormEvent<HTMLFormElement>): void => {
                    p_event.preventDefault();
                    const questionId: string = current.id;
                    void quiz
                      .submitAnswer(questionId)
                      .then((p_ok: boolean): void => {
                        if (!p_ok) {
                          return;
                        }
                        setQuestionIndex((p_prev: number): number => {
                          return p_prev + 1;
                        });
                      });
                  }}
                >
                  <label>
                    Answer
                    <textarea
                      name={`answer-${current.id}`}
                      value={quiz.drafts[current.id] ?? ""}
                      onChange={(
                        p_event: ChangeEvent<HTMLTextAreaElement>,
                      ): void => {
                        quiz.setDraft(current.id, p_event.currentTarget.value);
                      }}
                    />
                  </label>
                  <button
                    type="submit"
                    data-kind="submit"
                    disabled={quiz.isSubmitting}
                  >
                    Save answer
                  </button>
                </form>
                {quiz.formError !== null ? (
                  <p data-quiz-error role="alert">
                    {quiz.formError}
                  </p>
                ) : null}
              </>
            ) : undefined
          }
        />
      </div>
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
