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
import { SEEDED_FAMILY_ID } from "../../chrome/seeded-family";
import { useFamilySession } from "../../context-switch/family-session-context";
import { GpsViewPolicy } from "../../quiz/gps-view-policy";
import {
  PostSurpriseCommand,
  SurpriseForbiddenError,
  SurpriseMissingFamilyError,
} from "./post-surprise-command";
import type { SurprisePayload } from "./surprise-payload";

export type SurprisePresentation =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "need-family" }
  | { kind: "denied" }
  | { kind: "missing" }
  | { kind: "error"; message: string }
  | { kind: "empty"; id: string }
  | { kind: "hit"; cycleId: string; title: string; description: string };

export type SurpriseSessionContextValue = {
  presentation: SurprisePresentation;
  familyId: string;
  idDraft: string;
  setIdDraft: (p_id: string) => void;
  applyId: () => void;
  isSaving: boolean;
  draw: () => Promise<void>;
};

type SurpriseSessionProviderProps = {
  children: ReactNode;
};

const SurpriseSessionContext = createContext<SurpriseSessionContextValue | null>(
  null,
);

export function SurpriseSessionProvider(
  p_props: SurpriseSessionProviderProps,
): ReactElement {
  const router: ReturnType<typeof useRouter> = useRouter();
  const searchParams: URLSearchParams = useSearchParams();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const queryId: string =
    (searchParams.get("id") ?? "").trim() || SEEDED_FAMILY_ID;
  const [presentation, setPresentation] = useState<SurprisePresentation>({
    kind: queryId.trim().length > 0 ? "idle" : "need-family",
  });
  const [idDraft, setIdDraft] = useState<string>(queryId);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (session.isLoading) {
      return;
    }
    if (session.snapshot === null) {
      setPresentation({ kind: "denied" });
      return;
    }
    const role: string = session.snapshot.role;
    if (!GpsViewPolicy.canSchedule(role)) {
      setPresentation({ kind: "denied" });
      return;
    }
    if (queryId.trim().length === 0) {
      setPresentation({ kind: "need-family" });
      return;
    }
    setPresentation((p_current: SurprisePresentation) => {
      if (p_current.kind === "hit" || p_current.kind === "empty") {
        return p_current;
      }
      return { kind: "idle" };
    });
  }, [queryId, session.isLoading, session.snapshot?.role]);

  const value: SurpriseSessionContextValue = {
    presentation,
    familyId: queryId.trim(),
    idDraft,
    setIdDraft,
    applyId: (): void => {
      const nextId: string = idDraft.trim();
      if (nextId.length === 0) {
        router.replace("/missions/surprise");
        setPresentation({ kind: "need-family" });
        return;
      }
      if (nextId === queryId.trim()) {
        setPresentation({ kind: "idle" });
        return;
      }
      router.replace(`/missions/surprise?id=${encodeURIComponent(nextId)}`);
    },
    isSaving,
    draw: async (): Promise<void> => {
      const familyId: string = queryId.trim();
      if (familyId.length === 0) {
        setPresentation({ kind: "need-family" });
        return;
      }
      const role: string | undefined = session.snapshot?.role;
      if (role === undefined || !GpsViewPolicy.canSchedule(role)) {
        setPresentation({ kind: "denied" });
        return;
      }
      setIsSaving(true);
      setPresentation({ kind: "loading" });
      try {
        const command: PostSurpriseCommand = new PostSurpriseCommand(familyId);
        const payload: SurprisePayload = await command.execute();
        if (payload.kind === "empty") {
          setPresentation({ kind: "empty", id: payload.id });
          return;
        }
        setPresentation({
          kind: "hit",
          cycleId: payload.id,
          title: payload.title,
          description: payload.description,
        });
      } catch (p_error: unknown) {
        if (p_error instanceof SurpriseForbiddenError) {
          setPresentation({ kind: "denied" });
        } else if (p_error instanceof SurpriseMissingFamilyError) {
          setPresentation({ kind: "missing" });
        } else {
          setPresentation({
            kind: "error",
            message: "Could not open the surprise.",
          });
        }
      } finally {
        setIsSaving(false);
      }
    },
  };

  return (
    <SurpriseSessionContext.Provider value={value}>
      {p_props.children}
    </SurpriseSessionContext.Provider>
  );
}

export function useSurpriseSession(): SurpriseSessionContextValue {
  const value: SurpriseSessionContextValue | null = useContext(
    SurpriseSessionContext,
  );
  if (value === null) {
    throw new Error("useSurpriseSession requires SurpriseSessionProvider");
  }
  return value;
}
