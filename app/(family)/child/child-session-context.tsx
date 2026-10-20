"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  SEEDED_ACCEPTED_CYCLE_ID,
  SEEDED_ACCEPTED_TITLE,
  SEEDED_FAMILY_ID,
  SEEDED_PUBLISHED_MISSIONS,
} from "../chrome/seeded-family";
import { useFamilySession } from "../context-switch/family-session-context";
import { AddDiaryNoteCommand } from "../diary/add-note-command";
import type { DiaryPayload, NoteKind } from "../diary/diary-payload";
import { isNoteKind } from "../diary/kind-strategy";
import {
  DiaryForbiddenError,
  DiaryIllegalError,
  ListDiaryCommand,
} from "../diary/list-diary-command";
import type { CompletedMissionItem } from "../missions/completed/completed-payload";
import {
  HistoryForbiddenError,
  ListCompletedCommand,
} from "../missions/completed/list-completed-command";

export type ChosenMission = {
  title: string;
};

export type ChildPresentation =
  | { kind: "loading" }
  | { kind: "denied" }
  | { kind: "ready" };

export type ChildSessionContextValue = {
  presentation: ChildPresentation;
  familyId: string;
  chosen: ChosenMission[];
  completed: CompletedMissionItem[];
  completedBlocked: boolean;
  notes: DiaryPayload | null;
  draftKind: NoteKind;
  setDraftKind: (p_kind: NoteKind) => void;
  draftText: string;
  setDraftText: (p_text: string) => void;
  formError: string | null;
  isSaving: boolean;
  submitNote: () => Promise<void>;
};

type ChildSessionProviderProps = {
  children: ReactNode;
};

const ChildSessionContext = createContext<ChildSessionContextValue | null>(null);

export function ChildSessionProvider(
  p_props: ChildSessionProviderProps,
): ReactElement {
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const familyId: string = session.familyId || SEEDED_FAMILY_ID;
  const [presentation, setPresentation] = useState<ChildPresentation>({
    kind: "loading",
  });
  const [completed, setCompleted] = useState<CompletedMissionItem[]>([]);
  const [completedBlocked, setCompletedBlocked] = useState<boolean>(false);
  const [notes, setNotes] = useState<DiaryPayload | null>(null);
  const [draftKind, setDraftKind] = useState<NoteKind>("phrase");
  const [draftText, setDraftText] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (session.isLoading) {
      return;
    }
    if (session.snapshot === null) {
      setPresentation({ kind: "denied" });
      return;
    }
    let isActive: boolean = true;
    const load = async (): Promise<void> => {
      setPresentation({ kind: "loading" });
      try {
        const command: ListCompletedCommand = new ListCompletedCommand(familyId);
        const envelope = await command.execute();
        if (!isActive) {
          return;
        }
        setCompleted(envelope.missions);
        setCompletedBlocked(false);
      } catch (p_error: unknown) {
        void p_error;
        if (!isActive) {
          return;
        }
        setCompleted([]);
        setCompletedBlocked(p_error instanceof HistoryForbiddenError);
      }
      try {
        const diary: DiaryPayload = await new ListDiaryCommand(familyId).execute();
        if (!isActive) {
          return;
        }
        setNotes(diary);
      } catch (p_error: unknown) {
        void p_error;
        if (isActive) {
          setNotes(null);
        }
      }
      if (isActive) {
        setPresentation({ kind: "ready" });
      }
    };
    void load();
    return (): void => {
      isActive = false;
    };
  }, [familyId, session.isLoading, session.snapshot?.role]);

  const value: ChildSessionContextValue = {
    presentation,
    familyId,
    chosen: [{ title: SEEDED_ACCEPTED_TITLE }],
    completed,
    completedBlocked,
    notes,
    draftKind,
    setDraftKind: (p_kind: NoteKind): void => {
      if (!isNoteKind(p_kind)) {
        return;
      }
      setDraftKind(p_kind);
    },
    draftText,
    setDraftText,
    formError,
    isSaving,
    submitNote: async (): Promise<void> => {
      const text: string = draftText.trim();
      if (text.length === 0) {
        setFormError("Write the story. No photo.");
        return;
      }
      const linked: CompletedMissionItem | undefined = completed[0];
      const fallbackMission =
        SEEDED_PUBLISHED_MISSIONS.find(
          (p_item) => p_item.title === SEEDED_ACCEPTED_TITLE,
        ) ?? SEEDED_PUBLISHED_MISSIONS[0];
      const missionId: string | undefined =
        linked?.mission_id ?? fallbackMission?.id;
      const familyMissionId: string =
        linked?.id ?? SEEDED_ACCEPTED_CYCLE_ID;
      if (missionId === undefined) {
        setFormError("Finish a mission first, then write about it.");
        return;
      }
      setIsSaving(true);
      setFormError(null);
      try {
        const payload: DiaryPayload = await new AddDiaryNoteCommand(familyId, {
          kind: draftKind,
          text,
          mission_id: missionId,
          family_mission_id: familyMissionId,
        }).execute();
        setNotes(payload);
        setDraftText("");
      } catch (p_error: unknown) {
        if (p_error instanceof DiaryForbiddenError) {
          setFormError("Could not save this mission note.");
        } else if (p_error instanceof DiaryIllegalError) {
          setFormError("Empty text, invalid type, or a photo.");
        } else {
          setFormError("Could not save the note.");
        }
      } finally {
        setIsSaving(false);
      }
    },
  };

  return (
    <ChildSessionContext.Provider value={value}>
      {p_props.children}
    </ChildSessionContext.Provider>
  );
}

export function useChildSession(): ChildSessionContextValue {
  const value: ChildSessionContextValue | null = useContext(ChildSessionContext);
  if (value === null) {
    throw new Error("useChildSession requires ChildSessionProvider");
  }
  return value;
}
