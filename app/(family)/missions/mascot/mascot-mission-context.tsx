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
import { SEEDED_PUBLISHED_MISSIONS } from "../../chrome/seeded-family";
import { MascotMessageDecorator } from "./mascot-message-decorator";
import {
  PublishedMission,
  UnpublishedMissionError,
} from "./published-mission";

export type MascotPresentation =
  | { kind: "loading" }
  | { kind: "unpublished" }
  | { kind: "empty" }
  | { kind: "published"; mission: MascotMessageDecorator };

export type MascotMissionContextValue = {
  presentation: MascotPresentation;
  idDraft: string;
  setIdDraft: (p_id: string) => void;
  applyId: () => void;
  showEmptyPreview: () => void;
  showUnpublishedPreview: () => void;
};

type MascotMissionProviderProps = {
  children: ReactNode;
};

const MascotMissionContext = createContext<MascotMissionContextValue | null>(
  null,
);

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object";
}

function readMissionPayload(p_value: unknown): {
  id: string;
  title: string;
  description: string;
  review_status: string;
} | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const mission: unknown = Reflect.get(p_value, "mission");
  if (!isRecord(mission)) {
    return null;
  }
  const id: unknown = Reflect.get(mission, "id");
  const title: unknown = Reflect.get(mission, "title");
  const description: unknown = Reflect.get(mission, "description");
  const reviewStatus: unknown = Reflect.get(mission, "review_status");
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }
  if (typeof title !== "string") {
    return null;
  }
  if (typeof reviewStatus !== "string") {
    return null;
  }
  const descriptionText: string =
    typeof description === "string" ? description : "";
  return {
    id,
    title,
    description: descriptionText,
    review_status: reviewStatus,
  };
}

export function MascotMissionProvider(
  p_props: MascotMissionProviderProps,
): ReactElement {
  const router: ReturnType<typeof useRouter> = useRouter();
  const searchParams: URLSearchParams = useSearchParams();
  const queryId: string =
    (searchParams.get("id") ?? "").trim() ||
    SEEDED_PUBLISHED_MISSIONS[0]?.id ||
    "";
  const [presentation, setPresentation] = useState<MascotPresentation>({
    kind: queryId.length > 0 ? "loading" : "unpublished",
  });
  const [idDraft, setIdDraft] = useState<string>(queryId);

  const loadById = async (
    p_id: string,
    p_signal?: AbortSignal,
  ): Promise<void> => {
    const trimmed: string = p_id.trim();
    if (trimmed.length === 0) {
      setPresentation({ kind: "unpublished" });
      return;
    }
    setPresentation({ kind: "loading" });
    try {
      const response: Response = await fetch(
        `/api/missions/${encodeURIComponent(trimmed)}`,
        { cache: "no-store", signal: p_signal },
      );
      if (p_signal?.aborted) {
        return;
      }
      if (response.status === 404 || !response.ok) {
        setPresentation({ kind: "unpublished" });
        return;
      }
      const body: unknown = await response.json();
      if (p_signal?.aborted) {
        return;
      }
      const payload: {
        id: string;
        title: string;
        description: string;
        review_status: string;
      } | null = readMissionPayload(body);
      if (payload === null) {
        setPresentation({ kind: "unpublished" });
        return;
      }
      const mission: PublishedMission = new PublishedMission(payload);
      const decorated: MascotMessageDecorator = new MascotMessageDecorator(
        mission,
      );
      if (decorated.isCopyEmpty()) {
        setPresentation({ kind: "empty" });
        return;
      }
      setPresentation({ kind: "published", mission: decorated });
    } catch (p_error: unknown) {
      if (p_signal?.aborted) {
        return;
      }
      if (p_error instanceof DOMException && p_error.name === "AbortError") {
        return;
      }
      if (p_error instanceof UnpublishedMissionError) {
        setPresentation({ kind: "unpublished" });
        return;
      }
      setPresentation({ kind: "unpublished" });
    }
  };

  useEffect(() => {
    if (queryId.trim().length === 0) {
      return;
    }
    const controller: AbortController = new AbortController();
    void loadById(queryId, controller.signal);
    return (): void => {
      controller.abort();
    };
  }, [queryId]);

  const value: MascotMissionContextValue = {
    presentation,
    idDraft,
    setIdDraft,
    applyId: (): void => {
      const nextId: string = idDraft.trim();
      if (nextId.length === 0) {
        router.replace("/missions/mascot");
        setPresentation({ kind: "unpublished" });
        return;
      }
      if (nextId === queryId.trim()) {
        void loadById(nextId);
        return;
      }
      router.replace(`/missions/mascot?id=${encodeURIComponent(nextId)}`);
    },
    showEmptyPreview: (): void => {
      setPresentation({ kind: "empty" });
    },
    showUnpublishedPreview: (): void => {
      setPresentation({ kind: "unpublished" });
    },
  };

  return (
    <MascotMissionContext.Provider value={value}>
      {p_props.children}
    </MascotMissionContext.Provider>
  );
}

export function useMascotMission(): MascotMissionContextValue {
  const value: MascotMissionContextValue | null =
    useContext(MascotMissionContext);
  if (value === null) {
    throw new Error("useMascotMission requires MascotMissionProvider");
  }
  return value;
}
