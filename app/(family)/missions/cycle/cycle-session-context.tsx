"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFamilySession } from "../../context-switch/family-session-context";
import { GpsViewPolicy } from "../../quiz/gps-view-policy";
import { CompleteMissionCommand } from "./complete-mission-command";
import type { CycleClosing } from "./cycle-payload";
import {
  FamilyMissionCycle,
  IllegalCycleTransitionError,
  type CycleOfferedCommand,
} from "./cycle-ui-state";
import {
  CycleForbiddenError,
  CycleIllegalError,
  CycleMissingError,
  StartDoingCommand,
} from "./start-doing-command";

export type CycleGateKind =
  | "loading"
  | "need-family"
  | "need-cycle"
  | "denied"
  | "missing"
  | "error";

export type CyclePresentation =
  | { kind: "loading" }
  | { kind: "need-family" }
  | { kind: "need-cycle" }
  | { kind: "denied" }
  | { kind: "missing" }
  | { kind: "error"; message: string }
  | {
      kind: "ready";
      status: string;
      offered: readonly CycleOfferedCommand[];
      title: string;
      closing: CycleClosing | null;
    };

export type CycleSessionContextValue = {
  presentation: CyclePresentation;
  familyId: string;
  cycleId: string;
  idDraft: string;
  setIdDraft: (p_id: string) => void;
  cycleDraft: string;
  setCycleDraft: (p_id: string) => void;
  applyIds: () => void;
  isSaving: boolean;
  formError: string | null;
  isClosingOpen: boolean;
  doAgain: boolean | null;
  setDoAgain: (p_value: boolean) => void;
  saveMemory: boolean | null;
  setSaveMemory: (p_value: boolean) => void;
  openClosing: () => void;
  closeClosing: () => void;
  startDoing: () => Promise<void>;
  completeMission: () => Promise<void>;
};

type CycleSessionProviderProps = {
  children: ReactNode;
};

const CycleSessionContext = createContext<CycleSessionContextValue | null>(null);

export function CycleSessionProvider(
  p_props: CycleSessionProviderProps,
): ReactElement {
  const router: ReturnType<typeof useRouter> = useRouter();
  const searchParams: URLSearchParams = useSearchParams();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const queryId: string = searchParams.get("id") ?? "";
  const queryCycle: string = searchParams.get("cycle") ?? "";
  const queryTitle: string = searchParams.get("title") ?? "";
  const boundCycleRef = useRef<string>("");
  const [cycle, setCycle] = useState<FamilyMissionCycle | null>(null);
  const [cycleTick, setCycleTick] = useState<number>(0);
  const [closing, setClosing] = useState<CycleClosing | null>(null);
  const [gate, setGate] = useState<CycleGateKind>(
    queryId.trim().length > 0 ? "loading" : "need-family",
  );
  const [idDraft, setIdDraft] = useState<string>(queryId);
  const [cycleDraft, setCycleDraft] = useState<string>(queryCycle);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isClosingOpen, setIsClosingOpen] = useState<boolean>(false);
  const [doAgain, setDoAgain] = useState<boolean | null>(null);
  const [saveMemory, setSaveMemory] = useState<boolean | null>(null);

  useEffect(() => {
    if (session.isLoading) {
      setGate("loading");
      return;
    }
    if (session.snapshot === null || !GpsViewPolicy.canSchedule(session.snapshot.role)) {
      setGate("denied");
      return;
    }
    if (queryId.trim().length === 0) {
      setGate("need-family");
      return;
    }
    if (queryCycle.trim().length === 0) {
      boundCycleRef.current = "";
      setCycle(null);
      setGate("need-cycle");
      return;
    }
    const nextCycle: string = queryCycle.trim();
    if (boundCycleRef.current !== nextCycle) {
      boundCycleRef.current = nextCycle;
      setCycle(new FamilyMissionCycle("Accepted"));
      setCycleTick((p_tick: number) => p_tick + 1);
      setClosing(null);
      setFormError(null);
      setIsClosingOpen(false);
      setDoAgain(null);
      setSaveMemory(null);
    }
    setGate("loading");
  }, [queryId, queryCycle, session.isLoading, session.snapshot?.role]);

  const presentation = ((): CyclePresentation => {
    void cycleTick;
    if (gate === "denied") {
      return { kind: "denied" };
    }
    if (gate === "missing") {
      return { kind: "missing" };
    }
    if (gate === "error") {
      return {
        kind: "error",
        message: formError ?? "Não foi possível avançar o ciclo.",
      };
    }
    if (session.isLoading) {
      return { kind: "loading" };
    }
    if (queryId.trim().length === 0 || gate === "need-family") {
      return { kind: "need-family" };
    }
    if (queryCycle.trim().length === 0 || gate === "need-cycle") {
      return { kind: "need-cycle" };
    }
    if (cycle === null || gate === "loading") {
      if (cycle === null) {
        return { kind: "loading" };
      }
    }
    return {
      kind: "ready",
      status: cycle.getName(),
      offered: cycle.offeredCommands(),
      title: queryTitle.trim(),
      closing,
    };
  })();

  const rollback = (p_from: string): void => {
    try {
      setCycle(new FamilyMissionCycle(p_from));
      setCycleTick((p_tick: number) => p_tick + 1);
    } catch {
      setCycle(null);
    }
  };

  const value: CycleSessionContextValue = {
    presentation,
    familyId: queryId.trim(),
    cycleId: queryCycle.trim(),
    idDraft,
    setIdDraft,
    cycleDraft,
    setCycleDraft,
    applyIds: (): void => {
      const nextId: string = idDraft.trim();
      const nextCycle: string = cycleDraft.trim();
      if (nextId.length === 0) {
        router.replace("/missions/cycle");
        setGate("need-family");
        return;
      }
      const titleQuery: string =
        queryTitle.trim().length > 0
          ? `&title=${encodeURIComponent(queryTitle.trim())}`
          : "";
      if (nextCycle.length === 0) {
        router.replace(`/missions/cycle?id=${encodeURIComponent(nextId)}`);
        return;
      }
      router.replace(
        `/missions/cycle?id=${encodeURIComponent(nextId)}&cycle=${encodeURIComponent(nextCycle)}${titleQuery}`,
      );
    },
    isSaving,
    formError,
    isClosingOpen,
    doAgain,
    setDoAgain,
    saveMemory,
    setSaveMemory,
    openClosing: (): void => {
      if (cycle === null || !cycle.offeredCommands().includes("complete")) {
        return;
      }
      setFormError(null);
      setIsClosingOpen(true);
    },
    closeClosing: (): void => {
      setIsClosingOpen(false);
    },
    startDoing: async (): Promise<void> => {
      const cycleId: string = queryCycle.trim();
      if (cycle === null || cycleId.length === 0) {
        setGate("need-cycle");
        return;
      }
      const previous: string = cycle.getName();
      try {
        cycle.startDoing();
        setCycleTick((p_tick: number) => p_tick + 1);
      } catch (p_error: unknown) {
        if (p_error instanceof IllegalCycleTransitionError) {
          setFormError("Essa transição não é permitida.");
          return;
        }
        throw p_error;
      }
      setIsSaving(true);
      setFormError(null);
      try {
        const command: StartDoingCommand = new StartDoingCommand(cycleId);
        const payload = await command.execute();
        setCycle(new FamilyMissionCycle(payload.status));
        setCycleTick((p_tick: number) => p_tick + 1);
        setClosing(payload.closing);
      } catch (p_error: unknown) {
        rollback(previous);
        if (p_error instanceof CycleForbiddenError) {
          setGate("denied");
        } else if (p_error instanceof CycleMissingError) {
          setGate("missing");
        } else if (p_error instanceof CycleIllegalError) {
          setFormError("Essa transição não é permitida.");
        } else {
          setFormError("Não foi possível começar a missão.");
        }
      } finally {
        setIsSaving(false);
      }
    },
    completeMission: async (): Promise<void> => {
      const cycleId: string = queryCycle.trim();
      if (cycle === null || cycleId.length === 0) {
        setGate("need-cycle");
        return;
      }
      if (doAgain === null || saveMemory === null) {
        setFormError("Responda as duas perguntas de fechamento.");
        return;
      }
      const previous: string = cycle.getName();
      try {
        cycle.complete();
        setCycleTick((p_tick: number) => p_tick + 1);
      } catch (p_error: unknown) {
        if (p_error instanceof IllegalCycleTransitionError) {
          setFormError("Essa transição não é permitida.");
          return;
        }
        throw p_error;
      }
      const nextClosing: CycleClosing = {
        do_again: doAgain,
        save_memory: saveMemory,
      };
      setIsSaving(true);
      setFormError(null);
      try {
        const command: CompleteMissionCommand = new CompleteMissionCommand(
          cycleId,
          nextClosing,
        );
        const payload = await command.execute();
        setCycle(new FamilyMissionCycle(payload.status));
        setCycleTick((p_tick: number) => p_tick + 1);
        setClosing(payload.closing);
        setIsClosingOpen(false);
      } catch (p_error: unknown) {
        rollback(previous);
        if (p_error instanceof CycleForbiddenError) {
          setGate("denied");
        } else if (p_error instanceof CycleMissingError) {
          setGate("missing");
        } else if (p_error instanceof CycleIllegalError) {
          setFormError("Essa transição não é permitida.");
        } else {
          setFormError("Não foi possível concluir a missão.");
        }
      } finally {
        setIsSaving(false);
      }
    },
  };

  return (
    <CycleSessionContext.Provider value={value}>
      {p_props.children}
    </CycleSessionContext.Provider>
  );
}

export function useCycleSession(): CycleSessionContextValue {
  const value: CycleSessionContextValue | null = useContext(CycleSessionContext);
  if (value === null) {
    throw new Error("useCycleSession requires CycleSessionProvider");
  }
  return value;
}
