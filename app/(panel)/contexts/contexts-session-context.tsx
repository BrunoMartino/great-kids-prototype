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
  ContextsFacade,
  type PanelContextResult,
  type PanelContextRow,
  type PanelContextsResult,
} from "./contexts-facade";

export type ContextsSessionContextValue = {
  role: PanelMockRole | null;
  activeRole: StaffRole | null;
  contexts: PanelContextRow[];
  isLoading: boolean;
  isForbidden: boolean;
  errorMessage: string | null;
  formError: string | null;
  switchRole: (p_role: StaffRole) => Promise<void>;
  patchContextName: (p_id: string, p_name: string) => Promise<boolean>;
};

type ContextsSessionProviderProps = {
  children: ReactNode;
};

const ContextsSessionContext =
  createContext<ContextsSessionContextValue | null>(null);

export function ContextsSessionProvider(
  p_props: ContextsSessionProviderProps,
): ReactElement {
  const [role, setRole] = useState<PanelMockRole | null>(null);
  const [activeRole, setActiveRole] = useState<StaffRole | null>(null);
  const [contexts, setContexts] = useState<PanelContextRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const reload = async (): Promise<boolean> => {
    const result: PanelContextsResult = await new ContextsFacade().loadContexts();
    if (!result.ok) {
      setContexts([]);
      setIsForbidden(result.status === 403);
      setErrorMessage(
        result.status === 403
          ? "Access denied"
          : "Could not load contexts.",
      );
      return false;
    }
    setContexts(result.contexts);
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
        setContexts([]);
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
    setFormError(null);
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
      setContexts([]);
      setIsForbidden(true);
      setErrorMessage("Access denied");
      setIsLoading(false);
      return;
    }
    await reload();
    setIsLoading(false);
  };

  const patchContextName = async (
    p_id: string,
    p_name: string,
  ): Promise<boolean> => {
    if (p_name.trim().length === 0) {
      setFormError("Context name is required.");
      return false;
    }
    const result: PanelContextResult = await new ContextsFacade().patchContextName(
      p_id,
      p_name.trim(),
    );
    if (!result.ok) {
      setFormError("Could not update the context.");
      return false;
    }
    setFormError(null);
    await reload();
    return true;
  };

  const value: ContextsSessionContextValue = {
    role,
    activeRole,
    contexts,
    isLoading,
    isForbidden,
    errorMessage,
    formError,
    switchRole,
    patchContextName,
  };

  return (
    <ContextsSessionContext.Provider value={value}>
      {p_props.children}
    </ContextsSessionContext.Provider>
  );
}

export function useContextsSession(): ContextsSessionContextValue {
  const value: ContextsSessionContextValue | null = useContext(
    ContextsSessionContext,
  );
  if (value === null) {
    throw new Error("useContextsSession requires ContextsSessionProvider");
  }
  return value;
}
