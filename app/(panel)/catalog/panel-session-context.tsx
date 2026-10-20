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
  PanelCatalogFacade,
  type PanelCatalogResult,
  type PanelCategoriesResult,
  type PanelCategoryRow,
  type PanelDeleteResult,
  type PanelMissionResult,
  type PanelMissionRow,
  type PanelMockRole,
  type PanelSessionResult,
  type PanelSetRoleResult,
  type StaffRole,
} from "./panel-catalog-facade";

export type PanelSessionContextValue = {
  role: PanelMockRole | null;
  activeRole: StaffRole | null;
  catalogId: string | null;
  missions: PanelMissionRow[];
  categories: PanelCategoryRow[];
  isLoading: boolean;
  isForbidden: boolean;
  errorMessage: string | null;
  formError: string | null;
  switchRole: (p_role: StaffRole) => Promise<void>;
  createMission: (p_draft: {
    category_id: string;
    title: string;
    file: File | null;
  }) => Promise<boolean>;
  deleteMission: (p_id: string) => Promise<boolean>;
  uploadMissionImage: (p_id: string, p_file: File) => Promise<boolean>;
};

type PanelSessionProviderProps = {
  children: ReactNode;
};

const PanelSessionContext = createContext<PanelSessionContextValue | null>(
  null,
);

function makeFacade(): PanelCatalogFacade {
  const nativeFetch: typeof fetch = globalThis.fetch.bind(globalThis);
  return new PanelCatalogFacade(nativeFetch);
}

function asStaffRole(p_role: PanelMockRole): StaffRole | null {
  if (p_role === "Admin" || p_role === "Operator") {
    return p_role;
  }
  return null;
}

export function PanelSessionProvider(
  p_props: PanelSessionProviderProps,
): ReactElement {
  const [role, setRole] = useState<PanelMockRole | null>(null);
  const [activeRole, setActiveRole] = useState<StaffRole | null>(null);
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [missions, setMissions] = useState<PanelMissionRow[]>([]);
  const [categories, setCategories] = useState<PanelCategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isActive: boolean = true;
    const facade: PanelCatalogFacade = makeFacade();

    const loadPanel = async (): Promise<void> => {
      const sessionResult: PanelSessionResult = await facade.loadSession();
      if (!isActive) {
        return;
      }
      if (!sessionResult.ok) {
        setRole(null);
        setActiveRole(null);
        setCatalogId(null);
        setMissions([]);
        setCategories([]);
        setIsForbidden(sessionResult.status === 403);
        setErrorMessage(
          sessionResult.status === 403
            ? "Access denied"
            : "Could not load the session.",
        );
        setIsLoading(false);
        return;
      }
      const catalogResult: PanelCatalogResult = await facade.loadCatalog();
      const categoriesResult: PanelCategoriesResult =
        await facade.loadCategories();
      if (!isActive) {
        return;
      }
      if (!catalogResult.ok) {
        setRole(sessionResult.role);
        setActiveRole(asStaffRole(sessionResult.role));
        setCatalogId(null);
        setMissions([]);
        setCategories([]);
        setIsForbidden(catalogResult.status === 403);
        setErrorMessage(
          catalogResult.status === 403
            ? "Access denied"
            : "Could not load the catalog.",
        );
        setIsLoading(false);
        return;
      }
      setRole(sessionResult.role);
      setActiveRole(asStaffRole(sessionResult.role));
      setCatalogId(catalogResult.id);
      setMissions(catalogResult.missions);
      setCategories(
        categoriesResult.ok ? categoriesResult.categories : [],
      );
      setIsForbidden(false);
      setErrorMessage(null);
      setIsLoading(false);
    };

    void loadPanel();
    return (): void => {
      isActive = false;
    };
  }, []);

  const reloadCatalog = async (
    p_facade: PanelCatalogFacade,
  ): Promise<boolean> => {
    const catalogResult: PanelCatalogResult = await p_facade.loadCatalog();
    const categoriesResult: PanelCategoriesResult =
      await p_facade.loadCategories();
    if (!catalogResult.ok) {
      setMissions([]);
      setIsForbidden(catalogResult.status === 403);
      setErrorMessage(
        catalogResult.status === 403
          ? "Access denied"
          : "Could not load the catalog.",
      );
      return false;
    }
    setCatalogId(catalogResult.id);
    setMissions(catalogResult.missions);
    setCategories(categoriesResult.ok ? categoriesResult.categories : []);
    setIsForbidden(false);
    setErrorMessage(null);
    return true;
  };

  const switchRole = async (p_role: StaffRole): Promise<void> => {
    setIsLoading(true);
    setFormError(null);
    const facade: PanelCatalogFacade = makeFacade();
    const setResult: PanelSetRoleResult = await facade.setRole(p_role);
    if (!setResult.ok) {
      setErrorMessage("Could not switch role.");
      setIsLoading(false);
      return;
    }
    setRole(setResult.role);
    setActiveRole(asStaffRole(setResult.role));
    const sessionResult: PanelSessionResult = await facade.loadSession();
    if (!sessionResult.ok) {
      setCatalogId(null);
      setMissions([]);
      setCategories([]);
      setIsForbidden(sessionResult.status === 403);
      setErrorMessage(
        sessionResult.status === 403
          ? "Access denied"
          : "Could not load the session.",
      );
      setIsLoading(false);
      return;
    }
    const loaded: boolean = await reloadCatalog(facade);
    if (loaded) {
      setRole(sessionResult.role);
      setActiveRole(asStaffRole(sessionResult.role));
    }
    setIsLoading(false);
  };

  const createMission = async (p_draft: {
    category_id: string;
    title: string;
    file: File | null;
  }): Promise<boolean> => {
    if (p_draft.title.trim().length === 0 || p_draft.category_id.length === 0) {
      setFormError("Title and category are required.");
      return false;
    }
    const facade: PanelCatalogFacade = makeFacade();
    const result: PanelMissionResult = await facade.createMission({
      category_id: p_draft.category_id,
      title: p_draft.title.trim(),
    });
    if (!result.ok) {
      setFormError(
        result.status === 400
          ? "Unknown category or invalid data."
          : result.status === 403
            ? "Access denied"
            : "Could not create the mission.",
      );
      if (result.status === 403) {
        setIsForbidden(true);
        setErrorMessage("Access denied");
      }
      return false;
    }
    if (p_draft.file !== null) {
      const upload: PanelMissionResult = await facade.uploadMissionImage(
        result.id,
        p_draft.file,
      );
      if (!upload.ok) {
        setFormError(
          "Mission created, but the image upload was rejected.",
        );
        await reloadCatalog(facade);
        return false;
      }
    }
    setFormError(null);
    await reloadCatalog(facade);
    return true;
  };

  const deleteMission = async (p_id: string): Promise<boolean> => {
    const facade: PanelCatalogFacade = makeFacade();
    const result: PanelDeleteResult = await facade.deleteMission(p_id);
    if (!result.ok) {
      setFormError(
        result.status === 403
          ? "Access denied"
          : "Could not delete the mission.",
      );
      return false;
    }
    setFormError(null);
    await reloadCatalog(facade);
    return true;
  };

  const uploadMissionImage = async (
    p_id: string,
    p_file: File,
  ): Promise<boolean> => {
    const facade: PanelCatalogFacade = makeFacade();
    const result: PanelMissionResult = await facade.uploadMissionImage(
      p_id,
      p_file,
    );
    if (!result.ok) {
      setFormError(
        result.status === 400
          ? "Empty file or type not accepted."
          : "Could not upload the image.",
      );
      return false;
    }
    setFormError(null);
    await reloadCatalog(facade);
    return true;
  };

  const value: PanelSessionContextValue = {
    role,
    activeRole,
    catalogId,
    missions,
    categories,
    isLoading,
    isForbidden,
    errorMessage,
    formError,
    switchRole,
    createMission,
    deleteMission,
    uploadMissionImage,
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
