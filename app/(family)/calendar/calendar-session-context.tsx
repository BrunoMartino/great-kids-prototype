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
import { useFamilySession } from "../context-switch/family-session-context";
import { GpsViewPolicy } from "../quiz/gps-view-policy";
import {
  DayConflictError,
  UnpublishedScheduleError,
  readDayDocument,
  ScheduleOnDayCommand,
} from "./schedule-on-day-command";
import { DayComposite, type DayDocument } from "./day-composite";
import { MoveSuggestionCommand } from "./move-suggestion-command";
import {
  PublishedMission,
  UnpublishedMissionError,
  readPublishedMission,
} from "./published-mission";

export type CalendarPresentation =
  | { kind: "loading" }
  | { kind: "need-family" }
  | { kind: "denied" }
  | { kind: "missing" }
  | { kind: "error"; message: string }
  | { kind: "ready"; day: DayComposite };

export type CalendarSessionContextValue = {
  presentation: CalendarPresentation;
  familyId: string;
  idDraft: string;
  setIdDraft: (p_id: string) => void;
  applyId: () => void;
  day: string;
  setDay: (p_day: string) => void;
  missionDraft: string;
  setMissionDraft: (p_id: string) => void;
  published: PublishedMission | null;
  unpublishedTried: boolean;
  targetDay: string;
  setTargetDay: (p_day: string) => void;
  isSaving: boolean;
  formError: string | null;
  previewMission: () => Promise<void>;
  schedule: () => Promise<void>;
  move: () => Promise<void>;
};

type CalendarSessionProviderProps = {
  children: ReactNode;
};

const CalendarSessionContext =
  createContext<CalendarSessionContextValue | null>(null);

function todayStamp(): string {
  const now: Date = new Date();
  const year: string = String(now.getFullYear());
  const month: string = String(now.getMonth() + 1).padStart(2, "0");
  const day: string = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CalendarSessionProvider(
  p_props: CalendarSessionProviderProps,
): ReactElement {
  const router: ReturnType<typeof useRouter> = useRouter();
  const searchParams: URLSearchParams = useSearchParams();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const queryId: string = searchParams.get("id") ?? "";
  const [presentation, setPresentation] = useState<CalendarPresentation>({
    kind: queryId.trim().length > 0 ? "loading" : "need-family",
  });
  const [idDraft, setIdDraft] = useState<string>(queryId);
  const [day, setDay] = useState<string>(todayStamp());
  const [missionDraft, setMissionDraft] = useState<string>("");
  const [published, setPublished] = useState<PublishedMission | null>(null);
  const [unpublishedTried, setUnpublishedTried] = useState<boolean>(false);
  const [targetDay, setTargetDay] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadDay = async (
    p_familyId: string,
    p_day: string,
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
    if (!GpsViewPolicy.canSchedule(role)) {
      setPresentation({ kind: "denied" });
      return;
    }
    setPresentation({ kind: "loading" });
    try {
      const response: Response = await fetch(
        `/api/families/${encodeURIComponent(trimmed)}/calendar/${encodeURIComponent(p_day)}`,
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
        setPresentation({
          kind: "error",
          message: "Não foi possível abrir o dia.",
        });
        return;
      }
      const body: unknown = await response.json();
      const document: DayDocument | null = readDayDocument(body);
      if (document === null) {
        setPresentation({ kind: "error", message: "Dia em formato inválido." });
        return;
      }
      setPresentation({
        kind: "ready",
        day: DayComposite.fromDocument(document),
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
        message: "Não foi possível abrir o dia.",
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
    void loadDay(queryId, day, controller.signal);
    return (): void => {
      controller.abort();
    };
  }, [queryId, day, session.isLoading, session.snapshot?.role]);

  const value: CalendarSessionContextValue = {
    presentation,
    familyId: queryId.trim(),
    idDraft,
    setIdDraft,
    applyId: (): void => {
      const nextId: string = idDraft.trim();
      setFormError(null);
      setPublished(null);
      setUnpublishedTried(false);
      if (nextId.length === 0) {
        router.replace("/calendar");
        setPresentation({ kind: "need-family" });
        return;
      }
      if (nextId === queryId.trim()) {
        void loadDay(nextId, day);
        return;
      }
      router.replace(`/calendar?id=${encodeURIComponent(nextId)}`);
    },
    day,
    setDay,
    missionDraft,
    setMissionDraft,
    published,
    unpublishedTried,
    targetDay,
    setTargetDay,
    isSaving,
    formError,
    previewMission: async (): Promise<void> => {
      const trimmed: string = missionDraft.trim();
      setFormError(null);
      setPublished(null);
      setUnpublishedTried(false);
      if (trimmed.length === 0) {
        setFormError("Informe o id da missão publicada.");
        return;
      }
      try {
        const response: Response = await fetch(
          `/api/missions/${encodeURIComponent(trimmed)}`,
          { cache: "no-store" },
        );
        if (response.status === 404 || !response.ok) {
          setUnpublishedTried(true);
          return;
        }
        const body: unknown = await response.json();
        const mission: PublishedMission = readPublishedMission(body);
        setPublished(mission);
      } catch (p_error: unknown) {
        if (p_error instanceof UnpublishedMissionError) {
          setUnpublishedTried(true);
          return;
        }
        setUnpublishedTried(true);
      }
    },
    schedule: async (): Promise<void> => {
      const familyId: string = queryId.trim();
      if (familyId.length === 0 || published === null) {
        setFormError("Só missões publicadas entram no calendário.");
        return;
      }
      if (presentation.kind === "ready" && presentation.day.getChildren().length > 0) {
        setFormError("Este dia já tem um documento. PUT é só na primeira escrita.");
        return;
      }
      setIsSaving(true);
      setFormError(null);
      try {
        const command: ScheduleOnDayCommand = new ScheduleOnDayCommand(
          familyId,
          day,
          published.getId(),
          "scheduled",
        );
        await command.execute();
        await loadDay(familyId, day);
      } catch (p_error: unknown) {
        if (p_error instanceof DayConflictError) {
          setFormError("Este dia já está ocupado.");
        } else if (p_error instanceof UnpublishedScheduleError) {
          setUnpublishedTried(true);
          setPublished(null);
          setFormError("Missão não publicada.");
        } else {
          setFormError("Não foi possível agendar.");
        }
      } finally {
        setIsSaving(false);
      }
    },
    move: async (): Promise<void> => {
      const familyId: string = queryId.trim();
      const nextDay: string = targetDay.trim();
      if (familyId.length === 0 || published === null) {
        setFormError("Só missões publicadas podem ser movidas.");
        return;
      }
      if (nextDay.length === 0) {
        setFormError("Informe o dia de destino.");
        return;
      }
      setIsSaving(true);
      setFormError(null);
      try {
        const command: MoveSuggestionCommand = new MoveSuggestionCommand(
          familyId,
          nextDay,
          published.getId(),
        );
        await command.execute();
        setDay(nextDay);
      } catch (p_error: unknown) {
        if (p_error instanceof DayConflictError) {
          setFormError("O dia de destino já está ocupado.");
        } else if (p_error instanceof UnpublishedScheduleError) {
          setUnpublishedTried(true);
          setPublished(null);
          setFormError("Missão não publicada.");
        } else {
          setFormError("Não foi possível mover.");
        }
      } finally {
        setIsSaving(false);
      }
    },
  };

  return (
    <CalendarSessionContext.Provider value={value}>
      {p_props.children}
    </CalendarSessionContext.Provider>
  );
}

export function useCalendarSession(): CalendarSessionContextValue {
  const value: CalendarSessionContextValue | null = useContext(
    CalendarSessionContext,
  );
  if (value === null) {
    throw new Error("useCalendarSession requires CalendarSessionProvider");
  }
  return value;
}
