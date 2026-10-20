"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { KindFilterStrategy, kindFilterFor } from "./kind-filter-strategy";
import {
  QuestionsFacade,
  type PanelDeleteResult,
  type PanelMockRole,
  type PanelQuestionDraft,
  type PanelQuestionPatch,
  type PanelQuestionResult,
  type PanelQuestionRow,
  type PanelQuestionsResult,
  type PanelSessionResult,
  type PanelSetRoleResult,
  type QuestionKind,
} from "./questions-facade";

export type SwitchableRole = "Admin" | "Operator";

export type QuestionsSessionContextValue = {
  role: PanelMockRole | null;
  activeRole: SwitchableRole | null;
  listId: string | null;
  questions: PanelQuestionRow[];
  kindFilter: QuestionKind | null;
  isLoading: boolean;
  isForbidden: boolean;
  errorMessage: string | null;
  formError: string | null;
  setKindFilter: (p_kind: QuestionKind | null) => void;
  switchRole: (p_role: SwitchableRole) => Promise<void>;
  setStaffRole: (p_role: PanelMockRole) => Promise<void>;
  createQuestion: (p_draft: PanelQuestionDraft) => Promise<boolean>;
  patchQuestion: (
    p_id: string,
    p_patch: PanelQuestionPatch,
  ) => Promise<boolean>;
  updateQuestion: (
    p_id: string,
    p_patch: PanelQuestionPatch,
  ) => Promise<PanelQuestionResult>;
  deleteQuestion: (p_id: string) => Promise<boolean>;
};

type QuestionsSessionProviderProps = {
  children: ReactNode;
};

const QuestionsSessionContext =
  createContext<QuestionsSessionContextValue | null>(null);

function makeFacade(): QuestionsFacade {
  return QuestionsFacade.instance;
}

function asSwitchableRole(p_role: PanelMockRole): SwitchableRole | null {
  if (p_role === "Admin" || p_role === "Operator") {
    return p_role;
  }
  return null;
}

export function QuestionsSessionProvider(
  p_props: QuestionsSessionProviderProps,
): ReactElement {
  const [role, setRole] = useState<PanelMockRole | null>(null);
  const [activeRole, setActiveRole] = useState<SwitchableRole | null>(null);
  const [listId, setListId] = useState<string | null>(null);
  const [allQuestions, setAllQuestions] = useState<PanelQuestionRow[]>([]);
  const [kindFilter, setKindFilterState] = useState<QuestionKind | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isActive: boolean = true;
    const facade: QuestionsFacade = makeFacade();

    const loadPanel = async (): Promise<void> => {
      const sessionResult: PanelSessionResult = await facade.loadSession();
      if (!isActive) {
        return;
      }
      if (!sessionResult.ok) {
        setRole(null);
        setListId(null);
        setAllQuestions([]);
        setIsForbidden(sessionResult.status === 403);
        setErrorMessage(
          sessionResult.status === 403
            ? "Access denied"
            : "Could not load the session.",
        );
        setIsLoading(false);
        return;
      }
      const listResult: PanelQuestionsResult = await facade.loadQuestions(
        new KindFilterStrategy(),
      );
      if (!isActive) {
        return;
      }
      if (!listResult.ok) {
        setRole(sessionResult.role);
        setActiveRole(asSwitchableRole(sessionResult.role));
        setListId(null);
        setAllQuestions([]);
        setIsForbidden(listResult.status === 403);
        setErrorMessage(
          listResult.status === 403
            ? "Access denied"
            : "Could not load questions.",
        );
        setIsLoading(false);
        return;
      }
      setRole(sessionResult.role);
      setActiveRole(asSwitchableRole(sessionResult.role));
      setListId(listResult.id);
      setAllQuestions(listResult.questions);
      setIsForbidden(false);
      setErrorMessage(null);
      setIsLoading(false);
    };

    void loadPanel();
    return (): void => {
      isActive = false;
    };
  }, []);

  const reloadQuestions = async (
    p_facade: QuestionsFacade,
  ): Promise<boolean> => {
    const listResult: PanelQuestionsResult = await p_facade.loadQuestions(
      new KindFilterStrategy(),
    );
    if (!listResult.ok) {
      setAllQuestions([]);
      setIsForbidden(listResult.status === 403);
      setErrorMessage(
        listResult.status === 403
          ? "Access denied"
          : "Could not load questions.",
      );
      return false;
    }
    setListId(listResult.id);
    setAllQuestions(listResult.questions);
    setIsForbidden(false);
    setErrorMessage(null);
    return true;
  };

  const setStaffRole = async (p_role: PanelMockRole): Promise<void> => {
    setIsLoading(true);
    setFormError(null);
    const facade: QuestionsFacade = makeFacade();
    const setResult: PanelSetRoleResult = await facade.setRole(p_role);
    if (!setResult.ok) {
      setErrorMessage("Could not switch role.");
      setIsLoading(false);
      return;
    }
    setRole(setResult.role);
    setActiveRole(asSwitchableRole(setResult.role));
    const sessionResult: PanelSessionResult = await facade.loadSession();
    if (!sessionResult.ok) {
      setListId(null);
      setAllQuestions([]);
      setIsForbidden(sessionResult.status === 403);
      setErrorMessage(
        sessionResult.status === 403
          ? "Access denied"
          : "Could not load the session.",
      );
      setIsLoading(false);
      return;
    }
    const loaded: boolean = await reloadQuestions(facade);
    if (loaded) {
      setRole(sessionResult.role);
      setActiveRole(asSwitchableRole(sessionResult.role));
    }
    setIsLoading(false);
  };

  const switchRole = async (p_role: SwitchableRole): Promise<void> => {
    await setStaffRole(p_role);
  };

  const ensureStaffRole = async (
    p_facade: QuestionsFacade,
  ): Promise<boolean> => {
    if (activeRole === null) {
      return false;
    }
    const setResult: PanelSetRoleResult = await p_facade.setRole(activeRole);
    return setResult.ok;
  };

  const createQuestion = async (
    p_draft: PanelQuestionDraft,
  ): Promise<boolean> => {
    if (p_draft.question_text.trim().length === 0) {
      setFormError("Question text is required.");
      return false;
    }
    const facade: QuestionsFacade = makeFacade();
    const staffOk: boolean = await ensureStaffRole(facade);
    if (!staffOk) {
      setFormError("Access denied");
      setIsForbidden(true);
      setErrorMessage("Access denied");
      setAllQuestions([]);
      return false;
    }
    const result: PanelQuestionResult = await facade.createQuestion(p_draft);
    if (!result.ok) {
      setFormError(
        result.status === 400
          ? "Empty text or invalid type."
          : result.status === 403
            ? "Access denied"
            : "Could not create the question.",
      );
      if (result.status === 403) {
        setIsForbidden(true);
        setErrorMessage("Access denied");
        setAllQuestions([]);
      }
      return false;
    }
    setFormError(null);
    await reloadQuestions(facade);
    return true;
  };

  const updateQuestion = async (
    p_id: string,
    p_patch: PanelQuestionPatch,
  ): Promise<PanelQuestionResult> => {
    if (
      p_patch.question_text !== undefined &&
      p_patch.question_text.trim().length === 0
    ) {
      setFormError("Question text is required.");
      return { ok: false, status: 400, error: "empty text" };
    }
    const facade: QuestionsFacade = makeFacade();
    const staffOk: boolean = await ensureStaffRole(facade);
    if (!staffOk) {
      setFormError("Access denied");
      setIsForbidden(true);
      setErrorMessage("Access denied");
      setAllQuestions([]);
      return { ok: false, status: 403, error: "forbidden" };
    }
    const result: PanelQuestionResult = await facade.updateQuestion(
      p_id,
      p_patch,
    );
    if (!result.ok) {
      setFormError(
        result.status === 400
          ? "Empty text or invalid type."
          : result.status === 403
            ? "Access denied"
            : "Could not update the question.",
      );
      if (result.status === 403) {
        setIsForbidden(true);
        setErrorMessage("Access denied");
        setAllQuestions([]);
      }
      return result;
    }
    setFormError(null);
    await reloadQuestions(facade);
    return result;
  };

  const patchQuestion = async (
    p_id: string,
    p_patch: PanelQuestionPatch,
  ): Promise<boolean> => {
    const result: PanelQuestionResult = await updateQuestion(p_id, p_patch);
    return result.ok;
  };

  const deleteQuestion = async (p_id: string): Promise<boolean> => {
    const facade: QuestionsFacade = makeFacade();
    const staffOk: boolean = await ensureStaffRole(facade);
    if (!staffOk) {
      setFormError("Access denied");
      setIsForbidden(true);
      setErrorMessage("Access denied");
      setAllQuestions([]);
      return false;
    }
    const result: PanelDeleteResult = await facade.deleteQuestion(p_id);
    if (!result.ok) {
      setFormError(
        result.status === 403
          ? "Access denied"
          : "Could not delete the question.",
      );
      if (result.status === 403) {
        setIsForbidden(true);
        setErrorMessage("Access denied");
        setAllQuestions([]);
      }
      return false;
    }
    setFormError(null);
    await reloadQuestions(facade);
    return true;
  };

  const value: QuestionsSessionContextValue = {
    role,
    activeRole,
    listId,
    questions: allQuestions.filter((p_row: PanelQuestionRow): boolean => {
      return kindFilterFor(kindFilter).matches(p_row.kind);
    }),
    kindFilter,
    isLoading,
    isForbidden,
    errorMessage,
    formError,
    setKindFilter: (p_kind: QuestionKind | null): void => {
      setKindFilterState(p_kind);
    },
    switchRole,
    setStaffRole,
    createQuestion,
    patchQuestion,
    updateQuestion,
    deleteQuestion,
  };

  return (
    <QuestionsSessionContext.Provider value={value}>
      {p_props.children}
    </QuestionsSessionContext.Provider>
  );
}

export function useQuestionsSession(): QuestionsSessionContextValue {
  const value: QuestionsSessionContextValue | null = useContext(
    QuestionsSessionContext,
  );
  if (value === null) {
    throw new Error("useQuestionsSession requires QuestionsSessionProvider");
  }
  return value;
}
