"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { SEEDED_FAMILY_ID } from "../chrome/seeded-family";

export type SessionRole = "Parent" | "Child";
export type SessionPresentationKind = "parent" | "child";

export type SessionSnapshot = {
  role: SessionRole;
  presentation: SessionPresentationKind;
};

export type FamilySessionContextValue = {
  snapshot: SessionSnapshot | null;
  familyId: string;
  isLoading: boolean;
  isSwitching: boolean;
  errorMessage: string | null;
  switchRole: (p_role: SessionRole) => Promise<void>;
};

type FamilySessionProviderProps = {
  children: ReactNode;
};

const FamilySessionContext = createContext<FamilySessionContextValue | null>(
  null,
);

function readSessionBody(p_value: unknown): SessionSnapshot | null {
  if (p_value === null || typeof p_value !== "object") {
    return null;
  }
  const role: unknown = Reflect.get(p_value, "role");
  const presentation: unknown = Reflect.get(p_value, "presentation");
  if (role !== "Parent" && role !== "Child") {
    return null;
  }
  if (presentation !== "parent" && presentation !== "child") {
    return null;
  }
  return { role, presentation };
}

export function FamilySessionProvider(
  p_props: FamilySessionProviderProps,
): ReactElement {
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive: boolean = true;

    const loadSession = async (): Promise<void> => {
      try {
        const response: Response = await fetch("/api/session");
        if (response.status === 401) {
          if (isActive) {
            setSnapshot(null);
            setErrorMessage("Session missing. Do not call family APIs.");
          }
          return;
        }
        if (!response.ok) {
          throw new Error("session load failed");
        }
        const body: unknown = await response.json();
        const parsed: SessionSnapshot | null = readSessionBody(body);
        if (!isActive) {
          return;
        }
        if (parsed === null) {
          setSnapshot(null);
          setErrorMessage("Invalid session response.");
          return;
        }
        setSnapshot(parsed);
        setErrorMessage(null);
      } catch (p_error: unknown) {
        void p_error;
        if (isActive) {
          setSnapshot(null);
          setErrorMessage("Could not load the session.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadSession();
    return (): void => {
      isActive = false;
    };
  }, []);

  const switchRole = async (p_role: SessionRole): Promise<void> => {
    setIsSwitching(true);
    try {
      const response: Response = await fetch("/api/session/context", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: p_role }),
      });
      if (!response.ok) {
        setErrorMessage("Could not switch context.");
        return;
      }
      const body: unknown = await response.json();
      const parsed: SessionSnapshot | null = readSessionBody(body);
      if (parsed === null) {
        setErrorMessage("Invalid session response.");
        return;
      }
      setSnapshot(parsed);
      setErrorMessage(null);
    } catch (p_error: unknown) {
      void p_error;
      setErrorMessage("Could not switch context.");
    } finally {
      setIsSwitching(false);
    }
  };

  const value: FamilySessionContextValue = {
    snapshot,
    familyId: SEEDED_FAMILY_ID,
    isLoading,
    isSwitching,
    errorMessage,
    switchRole,
  };

  return (
    <FamilySessionContext.Provider value={value}>
      {p_props.children}
    </FamilySessionContext.Provider>
  );
}

export function useFamilySession(): FamilySessionContextValue {
  const value: FamilySessionContextValue | null = useContext(
    FamilySessionContext,
  );
  if (value === null) {
    throw new Error("useFamilySession requires FamilySessionProvider");
  }
  return value;
}
