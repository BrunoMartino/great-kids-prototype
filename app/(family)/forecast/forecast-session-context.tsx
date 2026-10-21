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
import type { DayDocument, SuggestionItem } from "../calendar/day-composite";
import { DayComposite } from "../calendar/day-composite";
import { readDayDocument } from "../calendar/schedule-on-day-command";
import { SEEDED_FAMILY_ID } from "../chrome/seeded-family";
import { useFamilySession } from "../context-switch/family-session-context";
import { GpsViewPolicy } from "../quiz/gps-view-policy";
import {
  DropOnDayCommand,
  MissingDayDropError,
  UnpublishedDropError,
} from "./drop-on-day-command";
import {
  MarkDoneCommand,
  MissingTargetDayError,
  MoveDayCommand,
  type PatchSuggestionResult,
} from "./patch-suggestion-command";
import {
  AcceptProposalCommand,
  DismissProposalCommand,
} from "./proposal-command";
import {
  RepeatCountObservable,
  RhythmProposalObserver,
  type RhythmProposal,
} from "./rhythm-proposal-observer";
import {
  readWeekEnvelope,
  type WeekSuggestionItem,
} from "./week-suggestion";

export type ForecastPresentation =
  | { kind: "loading" }
  | { kind: "need-family" }
  | { kind: "denied" }
  | { kind: "missing" }
  | { kind: "error"; message: string }
  | {
      kind: "ready";
      suggestions: WeekSuggestionItem[];
      day: DayComposite;
    };

export type ForecastSessionContextValue = {
  presentation: ForecastPresentation;
  familyId: string;
  idDraft: string;
  setIdDraft: (p_id: string) => void;
  applyId: () => void;
  day: string;
  setDay: (p_day: string) => void;
  targetDay: string;
  setTargetDay: (p_day: string) => void;
  isSaving: boolean;
  formError: string | null;
  proposal: RhythmProposal | null;
  drop: (p_missionId: string) => Promise<void>;
  markDone: (p_item: SuggestionItem) => Promise<void>;
  moveDay: (p_item: SuggestionItem) => Promise<void>;
  acceptProposal: () => Promise<void>;
  dismissProposal: () => Promise<void>;
};

type ForecastSessionProviderProps = {
  children: ReactNode;
};

const ForecastSessionContext = createContext<ForecastSessionContextValue | null>(
  null,
);

function todayStamp(): string {
  const now: Date = new Date();
  const year: string = String(now.getFullYear());
  const month: string = String(now.getMonth() + 1).padStart(2, "0");
  const day: string = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function labelForProposal(
  p_proposal: RhythmProposal,
  p_suggestions: WeekSuggestionItem[],
): string {
  const match: WeekSuggestionItem | undefined = p_suggestions.find(
    (p_item: WeekSuggestionItem) => p_item.mission_id === p_proposal.source_mission_id,
  );
  if (match !== undefined && match.title.trim().length > 0) {
    return match.title;
  }
  return p_proposal.weekday;
}

export function ForecastSessionProvider(
  p_props: ForecastSessionProviderProps,
): ReactElement {
  const router: ReturnType<typeof useRouter> = useRouter();
  const searchParams: URLSearchParams = useSearchParams();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const queryId: string =
    (searchParams.get("id") ?? "").trim() || SEEDED_FAMILY_ID;
  const [presentation, setPresentation] = useState<ForecastPresentation>({
    kind: queryId.trim().length > 0 ? "loading" : "need-family",
  });
  const [idDraft, setIdDraft] = useState<string>(queryId);
  const [day, setDay] = useState<string>(todayStamp());
  const [targetDay, setTargetDay] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<RhythmProposal | null>(null);
  const [observer] = useState<RhythmProposalObserver>(
    () => new RhythmProposalObserver(),
  );
  const [observable] = useState<RepeatCountObservable>(
    () => new RepeatCountObservable([observer]),
  );

  const publishProposal = (p_next: RhythmProposal | null): void => {
    observable.notify(p_next);
    setProposal(observer.proposal);
  };

  const loadForecast = async (
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
      const [weekResponse, dayResponse]: [Response, Response] =
        await Promise.all([
          fetch(
            `/api/families/${encodeURIComponent(trimmed)}/forecast/week`,
            { cache: "no-store", signal: p_signal },
          ),
          fetch(
            `/api/families/${encodeURIComponent(trimmed)}/calendar/${encodeURIComponent(p_day)}`,
            { cache: "no-store", signal: p_signal },
          ),
        ]);
      if (p_signal?.aborted) {
        return;
      }
      if (weekResponse.status === 403 || dayResponse.status === 403) {
        setPresentation({ kind: "denied" });
        return;
      }
      if (weekResponse.status === 404 || dayResponse.status === 404) {
        setPresentation({ kind: "missing" });
        return;
      }
      if (!weekResponse.ok) {
        setPresentation({
          kind: "error",
          message: "Could not open the forecast.",
        });
        return;
      }
      if (!dayResponse.ok) {
        setPresentation({
          kind: "error",
          message: "Could not open the day.",
        });
        return;
      }
      const [weekBody, dayBody]: [unknown, unknown] = await Promise.all([
        weekResponse.json(),
        dayResponse.json(),
      ]);
      const week = readWeekEnvelope(weekBody);
      if (week === null) {
        setPresentation({
          kind: "error",
          message: "Forecast in an invalid format.",
        });
        return;
      }
      const document: DayDocument | null = readDayDocument(dayBody);
      if (document === null) {
        setPresentation({ kind: "error", message: "Day in an invalid format." });
        return;
      }
      setPresentation({
        kind: "ready",
        suggestions: week.suggestions,
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
        message: "Could not open the forecast.",
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
    void loadForecast(queryId, day, controller.signal);
    return (): void => {
      controller.abort();
    };
  }, [queryId, day, session.isLoading, session.snapshot?.role]);

  const applyPatch = async (p_result: PatchSuggestionResult): Promise<void> => {
    publishProposal(p_result.proposal);
    const familyId: string = queryId.trim();
    await loadForecast(familyId, day);
  };

  const value: ForecastSessionContextValue = {
    presentation,
    familyId: queryId.trim(),
    idDraft,
    setIdDraft,
    applyId: (): void => {
      const nextId: string = idDraft.trim();
      setFormError(null);
      publishProposal(null);
      if (nextId.length === 0) {
        router.replace("/forecast");
        setPresentation({ kind: "need-family" });
        return;
      }
      if (nextId === queryId.trim()) {
        void loadForecast(nextId, day);
        return;
      }
      router.replace(`/forecast?id=${encodeURIComponent(nextId)}`);
    },
    day,
    setDay,
    targetDay,
    setTargetDay,
    isSaving,
    formError,
    proposal,
    drop: async (p_missionId: string): Promise<void> => {
      const familyId: string = queryId.trim();
      if (familyId.length === 0) {
        setFormError("Session family is missing.");
        return;
      }
      if (day.trim().length === 0) {
        setFormError("Choose the day.");
        return;
      }
      setIsSaving(true);
      setFormError(null);
      try {
        const command: DropOnDayCommand = new DropOnDayCommand(
          familyId,
          day,
          p_missionId,
        );
        await command.execute();
        await loadForecast(familyId, day);
      } catch (p_error: unknown) {
        if (p_error instanceof MissingDayDropError) {
          setFormError("Choose the day.");
        } else if (p_error instanceof UnpublishedDropError) {
          setFormError("Mission is not published.");
        } else {
          setFormError("Could not place it on the day.");
        }
      } finally {
        setIsSaving(false);
      }
    },
    markDone: async (p_item: SuggestionItem): Promise<void> => {
      const familyId: string = queryId.trim();
      if (familyId.length === 0) {
        setFormError("Session family is missing.");
        return;
      }
      setIsSaving(true);
      setFormError(null);
      try {
        const command: MarkDoneCommand = new MarkDoneCommand(
          familyId,
          day,
          p_item.id,
        );
        const result: PatchSuggestionResult = await command.execute();
        await applyPatch(result);
      } catch {
        setFormError("Could not mark as done.");
      } finally {
        setIsSaving(false);
      }
    },
    moveDay: async (p_item: SuggestionItem): Promise<void> => {
      const familyId: string = queryId.trim();
      if (familyId.length === 0) {
        setFormError("Session family is missing.");
        return;
      }
      setIsSaving(true);
      setFormError(null);
      try {
        const command: MoveDayCommand = new MoveDayCommand(
          familyId,
          day,
          p_item.id,
          targetDay,
        );
        const result: PatchSuggestionResult = await command.execute();
        await applyPatch(result);
      } catch (p_error: unknown) {
        if (p_error instanceof MissingTargetDayError) {
          setFormError("Enter the destination day.");
        } else {
          setFormError("Could not move.");
        }
      } finally {
        setIsSaving(false);
      }
    },
    acceptProposal: async (): Promise<void> => {
      const familyId: string = queryId.trim();
      if (familyId.length === 0 || proposal === null) {
        return;
      }
      const titles: WeekSuggestionItem[] =
        presentation.kind === "ready" ? presentation.suggestions : [];
      setIsSaving(true);
      setFormError(null);
      try {
        const command: AcceptProposalCommand = new AcceptProposalCommand(
          familyId,
          proposal,
          labelForProposal(proposal, titles),
        );
        await command.execute();
        publishProposal(null);
      } catch {
        setFormError("Could not save the rhythm.");
      } finally {
        setIsSaving(false);
      }
    },
    dismissProposal: async (): Promise<void> => {
      const familyId: string = queryId.trim();
      if (familyId.length === 0) {
        return;
      }
      setIsSaving(true);
      setFormError(null);
      try {
        const command: DismissProposalCommand = new DismissProposalCommand(
          familyId,
        );
        await command.execute();
        publishProposal(null);
      } catch {
        setFormError("Could not dismiss the rhythm.");
      } finally {
        setIsSaving(false);
      }
    },
  };

  return (
    <ForecastSessionContext.Provider value={value}>
      {p_props.children}
    </ForecastSessionContext.Provider>
  );
}

export function useForecastSession(): ForecastSessionContextValue {
  const value: ForecastSessionContextValue | null = useContext(
    ForecastSessionContext,
  );
  if (value === null) {
    throw new Error("useForecastSession requires ForecastSessionProvider");
  }
  return value;
}
