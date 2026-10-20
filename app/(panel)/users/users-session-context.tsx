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
  UsersFacade,
  type PanelUserResult,
  type PanelUserRow,
  type PanelUsersResult,
} from "./users-facade";

export type UsersSessionContextValue = {
  role: PanelMockRole | null;
  activeRole: StaffRole | null;
  users: PanelUserRow[];
  canWrite: boolean;
  isLoading: boolean;
  isForbidden: boolean;
  errorMessage: string | null;
  formError: string | null;
  switchRole: (p_role: StaffRole) => Promise<void>;
  blockUser: (p_id: string) => Promise<boolean>;
};

type UsersSessionProviderProps = {
  children: ReactNode;
};

const UsersSessionContext = createContext<UsersSessionContextValue | null>(null);

export function UsersSessionProvider(
  p_props: UsersSessionProviderProps,
): ReactElement {
  const [role, setRole] = useState<PanelMockRole | null>(null);
  const [activeRole, setActiveRole] = useState<StaffRole | null>(null);
  const [users, setUsers] = useState<PanelUserRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const reload = async (): Promise<boolean> => {
    const result: PanelUsersResult = await new UsersFacade().loadUsers();
    if (!result.ok) {
      setUsers([]);
      setIsForbidden(result.status === 403);
      setErrorMessage(
        result.status === 403
          ? "Access denied"
          : "Could not load users.",
      );
      return false;
    }
    setUsers(result.users);
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
        setUsers([]);
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
      setUsers([]);
      setIsForbidden(true);
      setErrorMessage("Access denied");
      setIsLoading(false);
      return;
    }
    await reload();
    setIsLoading(false);
  };

  const blockUser = async (p_id: string): Promise<boolean> => {
    if (role !== "Admin") {
      setFormError("Only Admin can block users.");
      return false;
    }
    const result: PanelUserResult = await new UsersFacade().patchUser(p_id, {
      status: "blocked",
    });
    if (!result.ok) {
      setFormError(
        result.status === 403
          ? "Operator cannot change users."
          : "Could not block the user.",
      );
      return false;
    }
    setFormError(null);
    await reload();
    return true;
  };

  const value: UsersSessionContextValue = {
    role,
    activeRole,
    users,
    canWrite: role === "Admin",
    isLoading,
    isForbidden,
    errorMessage,
    formError,
    switchRole,
    blockUser,
  };

  return (
    <UsersSessionContext.Provider value={value}>
      {p_props.children}
    </UsersSessionContext.Provider>
  );
}

export function useUsersSession(): UsersSessionContextValue {
  const value: UsersSessionContextValue | null = useContext(UsersSessionContext);
  if (value === null) {
    throw new Error("useUsersSession requires UsersSessionProvider");
  }
  return value;
}
