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
  IndicatorsPanelFacade,
  type IndicatorsCounts,
  type IndicatorsResult,
  type PanelMockRole,
  type PanelSessionResult,
  type PanelSetRoleResult,
  type PanelStaffRole,
} from "./indicators-facade";

export type SwitchableRole = "Admin" | "Operator" | "Parent";

export type IndicatorsSessionContextValue = {
  role: PanelStaffRole | null;
  activeRole: SwitchableRole;
  counts: IndicatorsCounts | null;
  isLoading: boolean;
  isForbidden: boolean;
  errorMessage: string | null;
  switchRole: (p_role: SwitchableRole) => Promise<void>;
};

type IndicatorsSessionProviderProps = {
  children: ReactNode;
};

const IndicatorsSessionContext =
  createContext<IndicatorsSessionContextValue | null>(null);

function makeFacade(): IndicatorsPanelFacade {
  return IndicatorsPanelFacade.instance;
}

function asSwitchableRole(p_role: PanelMockRole): SwitchableRole {
  if (p_role === "Operator") {
    return "Operator";
  }
  if (p_role === "Parent") {
    return "Parent";
  }
  return "Admin";
}

export function IndicatorsSessionProvider(
  p_props: IndicatorsSessionProviderProps,
): ReactElement {
  const [role, setRole] = useState<PanelStaffRole | null>(null);
  const [activeRole, setActiveRole] = useState<SwitchableRole>("Parent");
  const [counts, setCounts] = useState<IndicatorsCounts | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive: boolean = true;
    const facade: IndicatorsPanelFacade = makeFacade();

    const loadPanel = async (): Promise<void> => {
      const sessionResult: PanelSessionResult = await facade.loadSession();
      if (!isActive) {
        return;
      }
      if (!sessionResult.ok) {
        setRole(null);
        setCounts(null);
        setIsForbidden(sessionResult.status === 403);
        setErrorMessage(
          sessionResult.status === 403
            ? "Acesso negado"
            : "Não foi possível carregar a sessão.",
        );
        setIsLoading(false);
        return;
      }
      setActiveRole(asSwitchableRole(sessionResult.role));
      const indicatorsResult: IndicatorsResult = await facade.loadIndicators();
      if (!isActive) {
        return;
      }
      if (!indicatorsResult.ok) {
        setRole(sessionResult.role);
        setCounts(null);
        setIsForbidden(indicatorsResult.status === 403);
        setErrorMessage(
          indicatorsResult.status === 403
            ? "Acesso negado"
            : "Não foi possível carregar os indicadores.",
        );
        setIsLoading(false);
        return;
      }
      setRole(sessionResult.role);
      setCounts(indicatorsResult.counts);
      setIsForbidden(false);
      setErrorMessage(null);
      setIsLoading(false);
    };

    void loadPanel();
    return (): void => {
      isActive = false;
    };
  }, []);

  const switchRole = async (p_role: SwitchableRole): Promise<void> => {
    setIsLoading(true);
    const facade: IndicatorsPanelFacade = makeFacade();
    const setResult: PanelSetRoleResult = await facade.setRole(p_role);
    if (!setResult.ok) {
      setErrorMessage("Não foi possível trocar o papel.");
      setIsLoading(false);
      return;
    }
    setActiveRole(asSwitchableRole(setResult.role));
    const sessionResult: PanelSessionResult = await facade.loadSession();
    if (!sessionResult.ok) {
      setRole(null);
      setCounts(null);
      setIsForbidden(sessionResult.status === 403);
      setErrorMessage(
        sessionResult.status === 403
          ? "Acesso negado"
          : "Não foi possível carregar a sessão.",
      );
      setIsLoading(false);
      return;
    }
    const indicatorsResult: IndicatorsResult = await facade.loadIndicators();
    if (!indicatorsResult.ok) {
      setRole(sessionResult.role);
      setCounts(null);
      setIsForbidden(indicatorsResult.status === 403);
      setErrorMessage(
        indicatorsResult.status === 403
          ? "Acesso negado"
          : "Não foi possível carregar os indicadores.",
      );
      setIsLoading(false);
      return;
    }
    setRole(sessionResult.role);
    setCounts(indicatorsResult.counts);
    setIsForbidden(false);
    setErrorMessage(null);
    setIsLoading(false);
  };

  const value: IndicatorsSessionContextValue = {
    role,
    activeRole,
    counts,
    isLoading,
    isForbidden,
    errorMessage,
    switchRole,
  };

  return (
    <IndicatorsSessionContext.Provider value={value}>
      {p_props.children}
    </IndicatorsSessionContext.Provider>
  );
}

export function useIndicatorsSession(): IndicatorsSessionContextValue {
  const value: IndicatorsSessionContextValue | null = useContext(
    IndicatorsSessionContext,
  );
  if (value === null) {
    throw new Error("useIndicatorsSession requires IndicatorsSessionProvider");
  }
  return value;
}
