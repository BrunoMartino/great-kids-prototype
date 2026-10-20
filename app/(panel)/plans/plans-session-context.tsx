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
  PlansFacade,
  type PanelPlanResult,
  type PanelPlanRow,
  type PanelPlansResult,
} from "./plans-facade";

export type PlansSessionContextValue = {
  role: PanelMockRole | null;
  activeRole: StaffRole | null;
  plans: PanelPlanRow[];
  isLoading: boolean;
  isForbidden: boolean;
  errorMessage: string | null;
  formError: string | null;
  switchRole: (p_role: StaffRole) => Promise<void>;
  createPlan: (p_draft: { name: string; status: string }) => Promise<boolean>;
  patchPlanStatus: (p_id: string, p_status: string) => Promise<boolean>;
};

type PlansSessionProviderProps = {
  children: ReactNode;
};

const PlansSessionContext = createContext<PlansSessionContextValue | null>(null);

export function PlansSessionProvider(
  p_props: PlansSessionProviderProps,
): ReactElement {
  const [role, setRole] = useState<PanelMockRole | null>(null);
  const [activeRole, setActiveRole] = useState<StaffRole | null>(null);
  const [plans, setPlans] = useState<PanelPlanRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const reload = async (): Promise<boolean> => {
    const result: PanelPlansResult = await new PlansFacade().loadPlans();
    if (!result.ok) {
      setPlans([]);
      setIsForbidden(result.status === 403);
      setErrorMessage(
        result.status === 403
          ? "Access denied"
          : "Could not load plans.",
      );
      return false;
    }
    setPlans(result.plans);
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
        setPlans([]);
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
      setPlans([]);
      setIsForbidden(true);
      setErrorMessage("Access denied");
      setIsLoading(false);
      return;
    }
    await reload();
    setIsLoading(false);
  };

  const createPlan = async (p_draft: {
    name: string;
    status: string;
  }): Promise<boolean> => {
    if (p_draft.name.trim().length === 0) {
      setFormError("Plan name is required.");
      return false;
    }
    const result: PanelPlanResult = await new PlansFacade().createPlan({
      name: p_draft.name.trim(),
      status: p_draft.status,
    });
    if (!result.ok) {
      setFormError(
        result.status === 409
          ? "A plan with that name already exists."
          : "Could not create the plan.",
      );
      return false;
    }
    setFormError(null);
    await reload();
    return true;
  };

  const patchPlanStatus = async (
    p_id: string,
    p_status: string,
  ): Promise<boolean> => {
    const result: PanelPlanResult = await new PlansFacade().patchPlanStatus(
      p_id,
      p_status,
    );
    if (!result.ok) {
      setFormError("Could not update the plan.");
      return false;
    }
    setFormError(null);
    await reload();
    return true;
  };

  const value: PlansSessionContextValue = {
    role,
    activeRole,
    plans,
    isLoading,
    isForbidden,
    errorMessage,
    formError,
    switchRole,
    createPlan,
    patchPlanStatus,
  };

  return (
    <PlansSessionContext.Provider value={value}>
      {p_props.children}
    </PlansSessionContext.Provider>
  );
}

export function usePlansSession(): PlansSessionContextValue {
  const value: PlansSessionContextValue | null = useContext(PlansSessionContext);
  if (value === null) {
    throw new Error("usePlansSession requires PlansSessionProvider");
  }
  return value;
}
