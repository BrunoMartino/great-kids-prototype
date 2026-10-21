"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

export type TidePreferenceContextValue = {
  isPaused: boolean;
  togglePaused: () => void;
};

type TidePreferenceProviderProps = {
  children: ReactNode;
};

/** Per-device preference: the user can pause the ambient tide (WCAG 2.2.2). */
const TIDE_PAUSED_STORAGE_KEY: string = "gk.tide.paused";

const TidePreferenceContext = createContext<TidePreferenceContextValue>({
  isPaused: false,
  togglePaused: (): void => {},
});

function readStoredPaused(): boolean {
  try {
    return window.localStorage.getItem(TIDE_PAUSED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeStoredPaused(p_isPaused: boolean): void {
  try {
    window.localStorage.setItem(TIDE_PAUSED_STORAGE_KEY, p_isPaused ? "true" : "false");
  } catch {
    // Storage blocked (private mode): the preference lasts for this page only.
  }
}

export function TidePreferenceProvider(p_props: TidePreferenceProviderProps): ReactElement {
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect((): void => {
    setIsPaused(readStoredPaused());
    setIsHydrated(true);
  }, []);

  useEffect((): void => {
    if (isHydrated) {
      writeStoredPaused(isPaused);
    }
  }, [isHydrated, isPaused]);

  const value: TidePreferenceContextValue = {
    isPaused,
    togglePaused: (): void => {
      setIsPaused((p_previous: boolean): boolean => !p_previous);
    },
  };

  return (
    <TidePreferenceContext.Provider value={value}>
      {p_props.children}
    </TidePreferenceContext.Provider>
  );
}

export function useTidePreference(): TidePreferenceContextValue {
  return useContext(TidePreferenceContext);
}
