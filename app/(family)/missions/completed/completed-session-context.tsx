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
import { useFamilySession } from "../../context-switch/family-session-context";
import { GpsViewPolicy } from "../../quiz/gps-view-policy";
import type { CompletedMissionItem } from "./completed-payload";
import {
  HistoryForbiddenError,
  HistoryIllegalError,
  HistoryMissingFamilyError,
  ListCompletedCommand,
} from "./list-completed-command";

export type CompletedPresentation =
  | { kind: "loading" }
  | { kind: "need-family" }
  | { kind: "denied" }
  | { kind: "missing" }
  | { kind: "error"; message: string }
  | { kind: "empty"; id: string }
  | { kind: "ready"; id: string; missions: CompletedMissionItem[] };

export type CompletedSessionContextValue = {
  presentation: CompletedPresentation;
  familyId: string;
  idDraft: string;
  setIdDraft: (p_id: string) => void;
  applyId: () => void;
};

type CompletedSessionProviderProps = {
  children: ReactNode;
};

const CompletedSessionContext =
  createContext<CompletedSessionContextValue | null>(null);

export function CompletedSessionProvider(
  p_props: CompletedSessionProviderProps,
): ReactElement {
  const router: ReturnType<typeof useRouter> = useRouter();
  const searchParams: URLSearchParams = useSearchParams();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const queryId: string = searchParams.get("id") ?? "";
  const [presentation, setPresentation] = useState<CompletedPresentation>({
    kind: queryId.trim().length > 0 ? "loading" : "need-family",
  });
  const [idDraft, setIdDraft] = useState<string>(queryId);

  useEffect(() => {
    if (session.isLoading) {
      return;
    }
    if (session.snapshot === null || !GpsViewPolicy.canSchedule(session.snapshot.role)) {
      setPresentation({ kind: "denied" });
      return;
    }
    const familyId: string = queryId.trim();
    if (familyId.length === 0) {
      setPresentation({ kind: "need-family" });
      return;
    }
    let isActive: boolean = true;
    const loadHistory = async (): Promise<void> => {
      setPresentation({ kind: "loading" });
      try {
        const command: ListCompletedCommand = new ListCompletedCommand(familyId);
        const envelope = await command.execute();
        if (!isActive) {
          return;
        }
        if (envelope.missions.length === 0) {
          setPresentation({ kind: "empty", id: envelope.id });
          return;
        }
        setPresentation({
          kind: "ready",
          id: envelope.id,
          missions: envelope.missions,
        });
      } catch (p_error: unknown) {
        if (!isActive) {
          return;
        }
        if (p_error instanceof HistoryForbiddenError) {
          setPresentation({ kind: "denied" });
        } else if (p_error instanceof HistoryMissingFamilyError) {
          setPresentation({ kind: "missing" });
        } else if (p_error instanceof HistoryIllegalError) {
          setPresentation({
            kind: "error",
            message: "O histórico só lista missões concluídas.",
          });
        } else {
          setPresentation({
            kind: "error",
            message: "Não foi possível abrir o histórico.",
          });
        }
      }
    };
    void loadHistory();
    return (): void => {
      isActive = false;
    };
  }, [queryId, session.isLoading, session.snapshot?.role]);

  const value: CompletedSessionContextValue = {
    presentation,
    familyId: queryId.trim(),
    idDraft,
    setIdDraft,
    applyId: (): void => {
      const nextId: string = idDraft.trim();
      if (nextId.length === 0) {
        router.replace("/missions/completed");
        setPresentation({ kind: "need-family" });
        return;
      }
      if (nextId === queryId.trim()) {
        return;
      }
      router.replace(`/missions/completed?id=${encodeURIComponent(nextId)}`);
    },
  };

  return (
    <CompletedSessionContext.Provider value={value}>
      {p_props.children}
    </CompletedSessionContext.Provider>
  );
}

export function useCompletedSession(): CompletedSessionContextValue {
  const value: CompletedSessionContextValue | null = useContext(
    CompletedSessionContext,
  );
  if (value === null) {
    throw new Error("useCompletedSession requires CompletedSessionProvider");
  }
  return value;
}
