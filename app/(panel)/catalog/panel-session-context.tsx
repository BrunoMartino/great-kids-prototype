"use client";

import { PanelPolicy } from "@/app/api/panel/panel-policy";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  PanelCatalogFacade,
  type PanelCatalogResult,
  type PanelMissionRow,
  type PanelSessionResult,
  type PanelStaffRole,
} from "./panel-catalog-facade";

export type PanelSessionContextValue = {
  role: PanelStaffRole | null;
  catalogId: string | null;
  missions: PanelMissionRow[];
  isLoading: boolean;
  isForbidden: boolean;
  errorMessage: string | null;
};

type PanelSessionProviderProps = {
  children: ReactNode;
};

const PanelSessionContext = createContext<PanelSessionContextValue | null>(
  null,
);

export function PanelSessionProvider(
  p_props: PanelSessionProviderProps,
): ReactElement {
  const [role, setRole] = useState<PanelStaffRole | null>(null);
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [missions, setMissions] = useState<PanelMissionRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive: boolean = true;
    const nativeFetch: typeof fetch = globalThis.fetch.bind(globalThis);
    const facade: PanelCatalogFacade = new PanelCatalogFacade(nativeFetch);

    const loadPanel = async (): Promise<void> => {
      const sessionResult: PanelSessionResult = await facade.loadSession();
      if (!isActive) {
        return;
      }
      if (!sessionResult.ok) {
        setRole(null);
        setCatalogId(null);
        setMissions([]);
        setIsForbidden(sessionResult.status === 403);
        setErrorMessage(
          sessionResult.status === 403
            ? "Acesso negado"
            : "Não foi possível carregar a sessão.",
        );
        setIsLoading(false);
        return;
      }
      try {
        PanelPolicy.assertStaff(sessionResult.role);
      } catch (p_error: unknown) {
        void p_error;
        if (isActive) {
          setRole(null);
          setCatalogId(null);
          setMissions([]);
          setIsForbidden(true);
          setErrorMessage("Acesso negado");
          setIsLoading(false);
        }
        return;
      }
      const catalogResult: PanelCatalogResult = await facade.loadCatalog();
      if (!isActive) {
        return;
      }
      if (!catalogResult.ok) {
        setRole(sessionResult.role);
        setCatalogId(null);
        setMissions([]);
        setIsForbidden(catalogResult.status === 403);
        setErrorMessage(
          catalogResult.status === 403
            ? "Acesso negado"
            : "Não foi possível carregar o catálogo.",
        );
        setIsLoading(false);
        return;
      }
      setRole(sessionResult.role);
      setCatalogId(catalogResult.id);
      setMissions(catalogResult.missions);
      setIsForbidden(false);
      setErrorMessage(null);
      setIsLoading(false);
    };

    void loadPanel();
    return (): void => {
      isActive = false;
    };
  }, []);

  const value: PanelSessionContextValue = {
    role,
    catalogId,
    missions,
    isLoading,
    isForbidden,
    errorMessage,
  };

  return (
    <PanelSessionContext.Provider value={value}>
      {p_props.children}
    </PanelSessionContext.Provider>
  );
}

export function usePanelSession(): PanelSessionContextValue {
  const value: PanelSessionContextValue | null =
    useContext(PanelSessionContext);
  if (value === null) {
    throw new Error("usePanelSession requires PanelSessionProvider");
  }
  return value;
}
