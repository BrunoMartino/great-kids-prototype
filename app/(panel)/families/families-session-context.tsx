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
  asStaffRole,
  PanelStaffFacade,
  type PanelMockRole,
  type PanelSessionResult,
  type PanelSetRoleResult,
  type StaffRole,
} from "../shell/panel-staff-facade";
import {
  FamiliesFacade,
  type PanelFamiliesResult,
  type PanelFamilyRow,
} from "./families-facade";

export type FamiliesSessionContextValue = {
  role: PanelMockRole | null;
  activeRole: StaffRole | null;
  families: PanelFamilyRow[];
  isLoading: boolean;
  isForbidden: boolean;
  errorMessage: string | null;
  switchRole: (p_role: StaffRole) => Promise<void>;
};

type FamiliesSessionProviderProps = {
  children: ReactNode;
};

const FamiliesSessionContext =
  createContext<FamiliesSessionContextValue | null>(null);

export function FamiliesSessionProvider(
  p_props: FamiliesSessionProviderProps,
): ReactElement {
  const [role, setRole] = useState<PanelMockRole | null>(null);
  const [activeRole, setActiveRole] = useState<StaffRole | null>(null);
  const [families, setFamilies] = useState<PanelFamilyRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = async (): Promise<boolean> => {
    const result: PanelFamiliesResult = await new FamiliesFacade().loadFamilies();
    if (!result.ok) {
      setFamilies([]);
      setIsForbidden(result.status === 403);
      setErrorMessage(
        result.status === 403
          ? "Access denied"
          : "Could not load families.",
      );
      return false;
    }
    setFamilies(result.families);
    setIsForbidden(false);
    setErrorMessage(null);
    return true;
  };

  useEffect(() => {
    let isActive: boolean = true;
    const loadPanel = async (): Promise<void> => {
      const sessionResult: PanelSessionResult =
        await new PanelStaffFacade().loadSession();
      if (!isActive) {
        return;
      }
      if (!sessionResult.ok) {
        setRole(null);
        setActiveRole(null);
        setFamilies([]);
        setIsForbidden(sessionResult.status === 403);
        setErrorMessage(
          sessionResult.status === 403
            ? "Access denied"
            : "Could not load the session.",
        );
        setIsLoading(false);
        return;
      }
      setRole(sessionResult.role);
      setActiveRole(asStaffRole(sessionResult.role));
      await reload();
      if (isActive) {
        setIsLoading(false);
      }
    };
    void loadPanel();
    return (): void => {
      isActive = false;
    };
  }, []);

  const switchRole = async (p_role: StaffRole): Promise<void> => {
    setIsLoading(true);
    const setResult: PanelSetRoleResult = await new PanelStaffFacade().setRole(
      p_role,
    );
    if (!setResult.ok) {
      setErrorMessage("Could not switch role.");
      setIsLoading(false);
      return;
    }
    setRole(setResult.role);
    setActiveRole(asStaffRole(setResult.role));
    const sessionResult: PanelSessionResult =
      await new PanelStaffFacade().loadSession();
    if (!sessionResult.ok) {
      setFamilies([]);
      setIsForbidden(true);
      setErrorMessage("Access denied");
      setIsLoading(false);
      return;
    }
    await reload();
    setIsLoading(false);
  };

  const value: FamiliesSessionContextValue = {
    role,
    activeRole,
    families,
    isLoading,
    isForbidden,
    errorMessage,
    switchRole,
  };

  return (
    <FamiliesSessionContext.Provider value={value}>
      {p_props.children}
    </FamiliesSessionContext.Provider>
  );
}

export function useFamiliesSession(): FamiliesSessionContextValue {
  const value: FamiliesSessionContextValue | null = useContext(
    FamiliesSessionContext,
  );
  if (value === null) {
    throw new Error("useFamiliesSession requires FamiliesSessionProvider");
  }
  return value;
}
