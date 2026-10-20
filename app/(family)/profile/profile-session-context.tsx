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
import { GpsViewPolicy } from "../quiz/gps-view-policy";
import { DeleteAnswerCommand } from "./delete-answer-command";
import { EditAnswerCommand } from "./edit-answer-command";
import {
  ProfileComposite,
  type GpsDocument,
  type QuizAnswerEnvelope,
  type QuizAnswerItem,
} from "./gps-composite";

export type ProfilePresentation =
  | { kind: "loading" }
  | { kind: "need-family" }
  | { kind: "denied" }
  | { kind: "missing" }
  | { kind: "error"; message: string }
  | {
      kind: "ready";
      composite: ProfileComposite;
      answers: QuizAnswerItem[];
    };

export type ProfileSessionContextValue = {
  presentation: ProfilePresentation;
  familyId: string;
  idDraft: string;
  setIdDraft: (p_id: string) => void;
  applyId: () => void;
  editDraft: string;
  setEditDraft: (p_text: string) => void;
  editingQuestionId: string | null;
  deletingQuestionId: string | null;
  openEdit: (p_item: QuizAnswerItem) => void;
  openDelete: (p_item: QuizAnswerItem) => void;
  closeModal: () => void;
  isSaving: boolean;
  formError: string | null;
  saveEdit: () => Promise<void>;
  confirmDelete: () => Promise<void>;
};

type ProfileSessionProviderProps = {
  children: ReactNode;
};

const ProfileSessionContext = createContext<ProfileSessionContextValue | null>(
  null,
);

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

function readAnswerItem(p_value: unknown): QuizAnswerItem | null {
  if (!isRecord(p_value)) {
    return null;
  }
  if (typeof p_value.question_id !== "string" || typeof p_value.answer_text !== "string") {
    return null;
  }
  return {
    question_id: p_value.question_id,
    answer_text: p_value.answer_text,
    deleted: p_value.deleted === true,
  };
}

function readQuizEnvelope(p_value: unknown): QuizAnswerEnvelope | null {
  if (!isRecord(p_value) || typeof p_value.id !== "string") {
    return null;
  }
  if (!Array.isArray(p_value.answers)) {
    return null;
  }
  const answers: QuizAnswerItem[] = [];
  for (const p_item of p_value.answers) {
    const parsed: QuizAnswerItem | null = readAnswerItem(p_item);
    if (parsed === null) {
      return null;
    }
    answers.push(parsed);
  }
  return { id: p_value.id, answers };
}

function readKeyedEnvelope(
  p_value: unknown,
  p_key: "rhythms" | "achievements",
): { id: string; items: unknown[] } | null {
  if (!isRecord(p_value) || typeof p_value.id !== "string") {
    return null;
  }
  const items: unknown = Reflect.get(p_value, p_key);
  if (!Array.isArray(items)) {
    return null;
  }
  return { id: p_value.id, items };
}

function readGpsDocument(p_value: unknown): GpsDocument | null {
  if (!isRecord(p_value) || typeof p_value.id !== "string") {
    return null;
  }
  if (Array.isArray(p_value.quiz_answer)) {
    return null;
  }
  const quizAnswer: QuizAnswerEnvelope | null = readQuizEnvelope(
    p_value.quiz_answer,
  );
  const rhythms: { id: string; items: unknown[] } | null = readKeyedEnvelope(
    p_value.rhythms,
    "rhythms",
  );
  const achievements: { id: string; items: unknown[] } | null =
    readKeyedEnvelope(p_value.achievements, "achievements");
  if (quizAnswer === null || rhythms === null || achievements === null) {
    return null;
  }
  const notes: string | null =
    typeof p_value.profile_notes === "string" ? p_value.profile_notes : null;
  return {
    id: p_value.id,
    quiz_answer: quizAnswer,
    rhythms: { id: rhythms.id, rhythms: rhythms.items },
    achievements: { id: achievements.id, achievements: achievements.items },
    profile_notes: notes,
  };
}

function liveAnswers(p_envelope: QuizAnswerEnvelope): QuizAnswerItem[] {
  return p_envelope.answers.filter(
    (p_item: QuizAnswerItem) => p_item.deleted === false,
  );
}

export function ProfileSessionProvider(
  p_props: ProfileSessionProviderProps,
): ReactElement {
  const router: ReturnType<typeof useRouter> = useRouter();
  const searchParams: URLSearchParams = useSearchParams();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const queryId: string =
    (searchParams.get("id") ?? "").trim() || SEEDED_FAMILY_ID;
  const [presentation, setPresentation] = useState<ProfilePresentation>({
    kind: queryId.trim().length > 0 ? "loading" : "need-family",
  });
  const [idDraft, setIdDraft] = useState<string>(queryId);
  const [editDraft, setEditDraft] = useState<string>("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadGps = async (
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
    if (!GpsViewPolicy.canEdit(role)) {
      setPresentation({ kind: "denied" });
      return;
    }
    setPresentation({ kind: "loading" });
    try {
      const [profileResponse, answersResponse]: [Response, Response] =
        await Promise.all([
          fetch(`/api/families/${encodeURIComponent(trimmed)}/profile`, {
            cache: "no-store",
            signal: p_signal,
          }),
          fetch(
            `/api/families/${encodeURIComponent(trimmed)}/profile/answers`,
            { cache: "no-store", signal: p_signal },
          ),
        ]);
      if (p_signal?.aborted) {
        return;
      }
      if (profileResponse.status === 403 || answersResponse.status === 403) {
        setPresentation({ kind: "denied" });
        return;
      }
      if (profileResponse.status === 404) {
        setPresentation({ kind: "missing" });
        return;
      }
      if (!profileResponse.ok) {
        setPresentation({
          kind: "error",
          message: "Could not open GPS.",
        });
        return;
      }
      if (!answersResponse.ok) {
        setPresentation({
          kind: "error",
          message: "Could not open what we know.",
        });
        return;
      }
      const [profileBody, answersBody]: [unknown, unknown] = await Promise.all([
        profileResponse.json(),
        answersResponse.json(),
      ]);
      const document: GpsDocument | null = readGpsDocument(profileBody);
      if (document === null) {
        setPresentation({ kind: "error", message: "GPS in an invalid format." });
        return;
      }
      const answersEnvelope: QuizAnswerEnvelope | null =
        readQuizEnvelope(answersBody);
      if (answersEnvelope === null) {
        setPresentation({
          kind: "error",
          message: "Answers in an invalid format.",
        });
        return;
      }
      setPresentation({
        kind: "ready",
        composite: ProfileComposite.fromDocument(document),
        answers: liveAnswers(answersEnvelope),
      });
      setFormError(null);
    } catch (p_error: unknown) {
      if (p_signal?.aborted) {
        return;
      }
      if (p_error instanceof DOMException && p_error.name === "AbortError") {
        return;
      }
      setPresentation({
        kind: "error",
        message: "Could not open GPS.",
      });
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
    void loadGps(queryId, controller.signal);
    return (): void => {
      controller.abort();
    };
  }, [queryId, session.isLoading, session.snapshot?.role]);

  const value: ProfileSessionContextValue = {
    presentation,
    familyId: queryId.trim(),
    idDraft,
    setIdDraft,
    applyId: (): void => {
      const nextId: string = idDraft.trim();
      setFormError(null);
      setEditingQuestionId(null);
      setDeletingQuestionId(null);
      if (nextId.length === 0) {
        router.replace("/profile");
        setPresentation({ kind: "need-family" });
        return;
      }
      if (nextId === queryId.trim()) {
        void loadGps(nextId);
        return;
      }
      router.replace(`/profile?id=${encodeURIComponent(nextId)}`);
    },
    editDraft,
    setEditDraft,
    editingQuestionId,
    deletingQuestionId,
    openEdit: (p_item: QuizAnswerItem): void => {
      const role: string | undefined = session.snapshot?.role;
      if (role === undefined || !GpsViewPolicy.canEdit(role)) {
        setPresentation({ kind: "denied" });
        return;
      }
      setDeletingQuestionId(null);
      setEditingQuestionId(p_item.question_id);
      setEditDraft(p_item.answer_text);
      setFormError(null);
    },
    openDelete: (p_item: QuizAnswerItem): void => {
      const role: string | undefined = session.snapshot?.role;
      if (role === undefined || !GpsViewPolicy.canEdit(role)) {
        setPresentation({ kind: "denied" });
        return;
      }
      setEditingQuestionId(null);
      setDeletingQuestionId(p_item.question_id);
      setFormError(null);
    },
    closeModal: (): void => {
      setEditingQuestionId(null);
      setDeletingQuestionId(null);
      setFormError(null);
    },
    isSaving,
    formError,
    saveEdit: async (): Promise<void> => {
      const familyId: string = queryId.trim();
      const questionId: string | null = editingQuestionId;
      if (familyId.length === 0 || questionId === null) {
        return;
      }
      const text: string = editDraft.trim();
      if (text.length === 0) {
        setFormError("The answer cannot be empty.");
        return;
      }
      setIsSaving(true);
      try {
        const command: EditAnswerCommand = new EditAnswerCommand(
          familyId,
          questionId,
          text,
        );
        await command.execute();
        setEditingQuestionId(null);
        await loadGps(familyId);
      } catch (p_error: unknown) {
        void p_error;
        setFormError("Could not edit the answer.");
      } finally {
        setIsSaving(false);
      }
    },
    confirmDelete: async (): Promise<void> => {
      const familyId: string = queryId.trim();
      const questionId: string | null = deletingQuestionId;
      if (familyId.length === 0 || questionId === null) {
        return;
      }
      setIsSaving(true);
      try {
        const command: DeleteAnswerCommand = new DeleteAnswerCommand(
          familyId,
          questionId,
        );
        await command.execute();
        setDeletingQuestionId(null);
        await loadGps(familyId);
      } catch (p_error: unknown) {
        void p_error;
        setFormError("Could not delete the answer.");
      } finally {
        setIsSaving(false);
      }
    },
  };

  return (
    <ProfileSessionContext.Provider value={value}>
      {p_props.children}
    </ProfileSessionContext.Provider>
  );
}

export function useProfileSession(): ProfileSessionContextValue {
  const value: ProfileSessionContextValue | null = useContext(
    ProfileSessionContext,
  );
  if (value === null) {
    throw new Error("useProfileSession requires ProfileSessionProvider");
  }
  return value;
}
