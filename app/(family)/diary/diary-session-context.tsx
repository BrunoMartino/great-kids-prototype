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
import type { CompletedMissionItem } from "../missions/completed/completed-payload";
import { ListCompletedCommand } from "../missions/completed/list-completed-command";
import { GpsViewPolicy } from "../quiz/gps-view-policy";
import { AddDiaryNoteCommand } from "./add-note-command";
import type { AddNoteDraft, DiaryPayload, NoteKind } from "./diary-payload";
import { isNoteKind } from "./kind-strategy";
import {
  DiaryForbiddenError,
  DiaryIllegalError,
  DiaryMissingFamilyError,
  ListDiaryCommand,
} from "./list-diary-command";

export type DiaryPresentation =
  | { kind: "loading" }
  | { kind: "need-family" }
  | { kind: "denied" }
  | { kind: "missing" }
  | { kind: "error"; message: string }
  | { kind: "ready"; payload: DiaryPayload; canAuthor: boolean };

export type DiarySessionContextValue = {
  presentation: DiaryPresentation;
  familyId: string;
  idDraft: string;
  setIdDraft: (p_id: string) => void;
  applyId: () => void;
  isComposerOpen: boolean;
  openComposer: () => void;
  closeComposer: () => void;
  draftKind: NoteKind;
  setDraftKind: (p_kind: NoteKind) => void;
  draftText: string;
  setDraftText: (p_text: string) => void;
  draftMissionKey: string;
  setDraftMissionKey: (p_key: string) => void;
  completedMissions: CompletedMissionItem[];
  formError: string | null;
  isSaving: boolean;
  submitNote: () => Promise<void>;
};

type DiarySessionProviderProps = {
  children: ReactNode;
};

const DiarySessionContext = createContext<DiarySessionContextValue | null>(
  null,
);

function parseMissionKey(
  p_key: string,
): { mission_id: string; family_mission_id: string } | null {
  const trimmed: string = p_key.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const parts: string[] = trimmed.split("|");
  if (parts.length !== 2) {
    return null;
  }
  const missionId: string | undefined = parts[0];
  const familyMissionId: string | undefined = parts[1];
  if (
    missionId === undefined ||
    familyMissionId === undefined ||
    missionId.length === 0 ||
    familyMissionId.length === 0
  ) {
    return null;
  }
  return { mission_id: missionId, family_mission_id: familyMissionId };
}

export function DiarySessionProvider(
  p_props: DiarySessionProviderProps,
): ReactElement {
  const router: ReturnType<typeof useRouter> = useRouter();
  const searchParams: URLSearchParams = useSearchParams();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const queryId: string =
    (searchParams.get("id") ?? "").trim() || SEEDED_FAMILY_ID;
  const [presentation, setPresentation] = useState<DiaryPresentation>({
    kind: queryId.trim().length > 0 ? "loading" : "need-family",
  });
  const [idDraft, setIdDraft] = useState<string>(queryId);
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [draftKind, setDraftKind] = useState<NoteKind>("phrase");
  const [draftText, setDraftText] = useState<string>("");
  const [draftMissionKey, setDraftMissionKey] = useState<string>("");
  const [completedMissions, setCompletedMissions] = useState<
    CompletedMissionItem[]
  >([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (session.isLoading) {
      return;
    }
    if (session.snapshot === null || !GpsViewPolicy.canAnswer(session.snapshot.role)) {
      setPresentation({ kind: "denied" });
      setCompletedMissions([]);
      return;
    }
    const familyId: string = queryId.trim();
    if (familyId.length === 0) {
      setPresentation({ kind: "need-family" });
      setCompletedMissions([]);
      return;
    }
    let isActive: boolean = true;
    const canAuthor: boolean = GpsViewPolicy.canEdit(session.snapshot.role);
    const loadDiary = async (): Promise<void> => {
      setPresentation({ kind: "loading" });
      try {
        const command: ListDiaryCommand = new ListDiaryCommand(familyId);
        const payload: DiaryPayload = await command.execute();
        if (!isActive) {
          return;
        }
        setPresentation({ kind: "ready", payload, canAuthor });
      } catch (p_error: unknown) {
        if (!isActive) {
          return;
        }
        if (p_error instanceof DiaryForbiddenError) {
          setPresentation({ kind: "denied" });
        } else if (p_error instanceof DiaryMissingFamilyError) {
          setPresentation({ kind: "missing" });
        } else if (p_error instanceof DiaryIllegalError) {
          setPresentation({
            kind: "error",
            message: "The diary only stores text.",
          });
        } else {
          setPresentation({
            kind: "error",
            message: "Could not open the diary.",
          });
        }
      }
    };
    const loadCompleted = async (): Promise<void> => {
      if (!canAuthor) {
        setCompletedMissions([]);
        return;
      }
      try {
        const command: ListCompletedCommand = new ListCompletedCommand(familyId);
        const envelope = await command.execute();
        if (!isActive) {
          return;
        }
        setCompletedMissions(envelope.missions);
      } catch (p_error: unknown) {
        void p_error;
        if (isActive) {
          setCompletedMissions([]);
        }
      }
    };
    void loadDiary();
    void loadCompleted();
    return (): void => {
      isActive = false;
    };
  }, [queryId, session.isLoading, session.snapshot?.role]);

  const value: DiarySessionContextValue = {
    presentation,
    familyId: queryId.trim(),
    idDraft,
    setIdDraft,
    applyId: (): void => {
      const nextId: string = idDraft.trim();
      setIsComposerOpen(false);
      setFormError(null);
      if (nextId.length === 0) {
        router.replace("/diary");
        setPresentation({ kind: "need-family" });
        return;
      }
      if (nextId === queryId.trim()) {
        return;
      }
      router.replace(`/diary?id=${encodeURIComponent(nextId)}`);
    },
    isComposerOpen,
    openComposer: (): void => {
      setDraftKind("phrase");
      setDraftText("");
      setDraftMissionKey("");
      setFormError(null);
      setIsComposerOpen(true);
    },
    closeComposer: (): void => {
      setIsComposerOpen(false);
      setFormError(null);
    },
    draftKind,
    setDraftKind: (p_kind: NoteKind): void => {
      if (!isNoteKind(p_kind)) {
        return;
      }
      setDraftKind(p_kind);
    },
    draftText,
    setDraftText,
    draftMissionKey,
    setDraftMissionKey,
    completedMissions,
    formError,
    isSaving,
    submitNote: async (): Promise<void> => {
      const familyId: string = queryId.trim();
      if (familyId.length === 0) {
        setFormError("Session family is missing.");
        return;
      }
      const text: string = draftText.trim();
      if (text.length === 0) {
        setFormError("Write the story. No photo.");
        return;
      }
      const draft: AddNoteDraft = { kind: draftKind, text };
      const linked: { mission_id: string; family_mission_id: string } | null =
        parseMissionKey(draftMissionKey);
      if (linked !== null) {
        draft.mission_id = linked.mission_id;
        draft.family_mission_id = linked.family_mission_id;
      }
      setIsSaving(true);
      setFormError(null);
      try {
        const command: AddDiaryNoteCommand = new AddDiaryNoteCommand(
          familyId,
          draft,
        );
        const payload: DiaryPayload = await command.execute();
        setPresentation({ kind: "ready", payload, canAuthor: true });
        setIsComposerOpen(false);
        setDraftText("");
        setDraftMissionKey("");
        setDraftKind("phrase");
      } catch (p_error: unknown) {
        if (p_error instanceof DiaryForbiddenError) {
          setFormError("Only the parent writes in the diary.");
        } else if (p_error instanceof DiaryMissingFamilyError) {
          setFormError("Family not found.");
        } else if (p_error instanceof DiaryIllegalError) {
          setFormError("Empty text, invalid type, or a mission from another family.");
        } else {
          setFormError("Could not save the note.");
        }
      } finally {
        setIsSaving(false);
      }
    },
  };

  return (
    <DiarySessionContext.Provider value={value}>
      {p_props.children}
    </DiarySessionContext.Provider>
  );
}

export function useDiarySession(): DiarySessionContextValue {
  const value: DiarySessionContextValue | null = useContext(DiarySessionContext);
  if (value === null) {
    throw new Error("useDiarySession requires DiarySessionProvider");
  }
  return value;
}
