"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SEEDED_FAMILY_ID } from "../chrome/seeded-family";
import { useFamilySession } from "../context-switch/family-session-context";
import { GpsViewPolicy } from "./gps-view-policy";
import {
  ModeStrategy,
  modeStrategyFor,
  type QuizMode,
} from "./mode-strategy";
import type { QuizAnswerEnvelope } from "./quiz-command";
import { SubmitAnswerCommand } from "./submit-answer-command";

export type QuizQuestion = {
  id: string;
  question_text: string;
};

export type QuizPresentation =
  | { kind: "loading" }
  | { kind: "need-family" }
  | { kind: "denied" }
  | { kind: "missing" }
  | { kind: "error"; message: string }
  | { kind: "ready"; questions: QuizQuestion[] };

export type QuizSessionContextValue = {
  presentation: QuizPresentation;
  familyId: string;
  idDraft: string;
  setIdDraft: (p_id: string) => void;
  applyId: () => void;
  mode: QuizMode;
  setMode: (p_mode: QuizMode) => void;
  modePrompt: string;
  drafts: Record<string, string>;
  setDraft: (p_questionId: string, p_text: string) => void;
  isSubmitting: boolean;
  lastEnvelope: QuizAnswerEnvelope | null;
  formError: string | null;
  submitAnswer: (p_questionId: string) => Promise<void>;
};

type QuizSessionProviderProps = {
  children: ReactNode;
};

const QuizSessionContext = createContext<QuizSessionContextValue | null>(null);

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object";
}

function readQuestions(p_value: unknown): QuizQuestion[] | null {
  if (!isRecord(p_value) || typeof p_value.id !== "string") {
    return null;
  }
  if (!Array.isArray(p_value.questions)) {
    return null;
  }
  const questions: QuizQuestion[] = [];
  for (const p_item of p_value.questions) {
    if (!isRecord(p_item)) {
      return null;
    }
    if (typeof p_item.id !== "string" || typeof p_item.question_text !== "string") {
      return null;
    }
    questions.push({ id: p_item.id, question_text: p_item.question_text });
  }
  return questions;
}

export function QuizSessionProvider(
  p_props: QuizSessionProviderProps,
): ReactElement {
  const router: ReturnType<typeof useRouter> = useRouter();
  const searchParams: URLSearchParams = useSearchParams();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const queryId: string =
    (searchParams.get("id") ?? "").trim() || SEEDED_FAMILY_ID;
  const [presentation, setPresentation] = useState<QuizPresentation>({
    kind: queryId.trim().length > 0 ? "loading" : "need-family",
  });
  const [idDraft, setIdDraft] = useState<string>(queryId);
  const [mode, setMode] = useState<QuizMode>("solo");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastEnvelope, setLastEnvelope] = useState<QuizAnswerEnvelope | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);

  const loadOffer = async (
    p_familyId: string,
    p_signal?: AbortSignal,
  ): Promise<void> => {
    const trimmed: string = p_familyId.trim();
    if (trimmed.length === 0) {
      setPresentation({ kind: "need-family" });
      return;
    }
    const role: string | undefined = session.snapshot?.role;
    if (role === undefined) {
      return;
    }
    if (!GpsViewPolicy.canAnswer(role)) {
      setPresentation({ kind: "denied" });
      return;
    }
    setPresentation({ kind: "loading" });
    try {
      const response: Response = await fetch(
        `/api/families/${encodeURIComponent(trimmed)}/quiz`,
        { cache: "no-store", signal: p_signal },
      );
      if (p_signal?.aborted) {
        return;
      }
      if (response.status === 403) {
        setPresentation({ kind: "denied" });
        return;
      }
      if (response.status === 404) {
        setPresentation({ kind: "missing" });
        return;
      }
      if (!response.ok) {
        setPresentation({ kind: "error", message: "Could not open the quiz." });
        return;
      }
      const body: unknown = await response.json();
      if (p_signal?.aborted) {
        return;
      }
      const questions: QuizQuestion[] | null = readQuestions(body);
      if (questions === null) {
        setPresentation({ kind: "error", message: "Invalid quiz offer." });
        return;
      }
      setPresentation({ kind: "ready", questions });
      setFormError(null);
    } catch (p_error: unknown) {
      if (p_signal?.aborted) {
        return;
      }
      if (p_error instanceof DOMException && p_error.name === "AbortError") {
        return;
      }
      setPresentation({ kind: "error", message: "Could not open the quiz." });
    }
  };

  useEffect(() => {
    if (session.isLoading) {
      return;
    }
    if (session.snapshot === null) {
      setPresentation({ kind: "denied" });
      return;
    }
    if (queryId.trim().length === 0) {
      setPresentation({ kind: "need-family" });
      return;
    }
    const controller: AbortController = new AbortController();
    void loadOffer(queryId, controller.signal);
    return (): void => {
      controller.abort();
    };
  }, [queryId, session.isLoading, session.snapshot?.role]);

  const value: QuizSessionContextValue = {
    presentation,
    familyId: queryId.trim(),
    idDraft,
    setIdDraft,
    applyId: (): void => {
      const nextId: string = idDraft.trim();
      setLastEnvelope(null);
      setFormError(null);
      if (nextId.length === 0) {
        router.replace("/quiz");
        setPresentation({ kind: "need-family" });
        return;
      }
      if (nextId === queryId.trim()) {
        void loadOffer(nextId);
        return;
      }
      router.replace(`/quiz?id=${encodeURIComponent(nextId)}`);
    },
    mode,
    setMode,
    modePrompt: modeStrategyFor(mode).prompt(),
    drafts,
    setDraft: (p_questionId: string, p_text: string): void => {
      setDrafts((p_prev: Record<string, string>): Record<string, string> => ({
        ...p_prev,
        [p_questionId]: p_text,
      }));
    },
    isSubmitting,
    lastEnvelope,
    formError,
    submitAnswer: async (p_questionId: string): Promise<void> => {
      const familyId: string = queryId.trim();
      const role: string | undefined = session.snapshot?.role;
      if (familyId.length === 0 || role === undefined) {
        return;
      }
      if (!GpsViewPolicy.canAnswer(role)) {
        setPresentation({ kind: "denied" });
        return;
      }
      const text: string = (drafts[p_questionId] ?? "").trim();
      if (text.length === 0) {
        setFormError("Write an answer.");
        return;
      }
      let resolved: QuizMode;
      try {
        resolved = new ModeStrategy(mode).resolve(mode);
      } catch (p_error: unknown) {
        void p_error;
        setFormError("Invalid mode.");
        return;
      }
      setIsSubmitting(true);
      setFormError(null);
      try {
        const command: SubmitAnswerCommand = new SubmitAnswerCommand(
          familyId,
          p_questionId,
          text,
          resolved,
        );
        const stored: QuizAnswerEnvelope = await command.execute();
        setLastEnvelope(stored);
        setDrafts((p_prev: Record<string, string>): Record<string, string> => ({
          ...p_prev,
          [p_questionId]: "",
        }));
      } catch (p_error: unknown) {
        void p_error;
        setFormError("Could not save the answer.");
      } finally {
        setIsSubmitting(false);
      }
    },
  };

  return (
    <QuizSessionContext.Provider value={value}>
      {p_props.children}
    </QuizSessionContext.Provider>
  );
}

export function useQuizSession(): QuizSessionContextValue {
  const value: QuizSessionContextValue | null = useContext(QuizSessionContext);
  if (value === null) {
    throw new Error("useQuizSession requires QuizSessionProvider");
  }
  return value;
}
