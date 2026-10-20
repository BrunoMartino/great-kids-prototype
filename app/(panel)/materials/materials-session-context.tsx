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
  MaterialsFacade,
  type PanelMaterialResult,
  type PanelMaterialRow,
  type PanelMaterialsResult,
} from "./materials-facade";

export type MaterialsSessionContextValue = {
  role: PanelMockRole | null;
  activeRole: StaffRole | null;
  materials: PanelMaterialRow[];
  isLoading: boolean;
  isForbidden: boolean;
  errorMessage: string | null;
  formError: string | null;
  switchRole: (p_role: StaffRole) => Promise<void>;
  createMaterial: (p_draft: {
    type: string;
    title: string;
    description: string;
    file: File | null;
  }) => Promise<boolean>;
  deleteMaterial: (p_id: string) => Promise<boolean>;
  uploadMaterialFile: (p_id: string, p_file: File) => Promise<boolean>;
};

type MaterialsSessionProviderProps = {
  children: ReactNode;
};

const MaterialsSessionContext =
  createContext<MaterialsSessionContextValue | null>(null);

function makeStaff(): PanelStaffFacade {
  return new PanelStaffFacade();
}

function makeMaterials(): MaterialsFacade {
  return new MaterialsFacade();
}

export function MaterialsSessionProvider(
  p_props: MaterialsSessionProviderProps,
): ReactElement {
  const [role, setRole] = useState<PanelMockRole | null>(null);
  const [activeRole, setActiveRole] = useState<StaffRole | null>(null);
  const [materials, setMaterials] = useState<PanelMaterialRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const reload = async (p_facade: MaterialsFacade): Promise<boolean> => {
    const listResult: PanelMaterialsResult = await p_facade.loadMaterials();
    if (!listResult.ok) {
      setMaterials([]);
      setIsForbidden(listResult.status === 403);
      setErrorMessage(
        listResult.status === 403
          ? "Access denied"
          : "Could not load materials.",
      );
      return false;
    }
    setMaterials(listResult.materials.filter((p_row: PanelMaterialRow): boolean => {
      return !p_row.deleted;
    }));
    setIsForbidden(false);
    setErrorMessage(null);
    return true;
  };

  useEffect(() => {
    let isActive: boolean = true;
    const staff: PanelStaffFacade = makeStaff();
    const facade: MaterialsFacade = makeMaterials();
    const loadPanel = async (): Promise<void> => {
      const sessionResult: PanelSessionResult = await staff.loadSession();
      if (!isActive) {
        return;
      }
      if (!sessionResult.ok) {
        setRole(null);
        setActiveRole(null);
        setMaterials([]);
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
      await reload(facade);
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
    const staff: PanelStaffFacade = makeStaff();
    const setResult: PanelSetRoleResult = await staff.setRole(p_role);
    if (!setResult.ok) {
      setErrorMessage("Could not switch role.");
      setIsLoading(false);
      return;
    }
    setRole(setResult.role);
    setActiveRole(asStaffRole(setResult.role));
    const sessionResult: PanelSessionResult = await staff.loadSession();
    if (!sessionResult.ok) {
      setMaterials([]);
      setIsForbidden(sessionResult.status === 403);
      setErrorMessage("Access denied");
      setIsLoading(false);
      return;
    }
    await reload(makeMaterials());
    setIsLoading(false);
  };

  const createMaterial = async (p_draft: {
    type: string;
    title: string;
    description: string;
    file: File | null;
  }): Promise<boolean> => {
    if (p_draft.title.trim().length === 0 || p_draft.type.length === 0) {
      setFormError("Type and title are required.");
      return false;
    }
    const facade: MaterialsFacade = makeMaterials();
    const payload: { type: string; title: string; description?: string } = {
      type: p_draft.type,
      title: p_draft.title.trim(),
    };
    if (p_draft.description.trim().length > 0) {
      payload.description = p_draft.description.trim();
    }
    const result: PanelMaterialResult = await facade.createMaterial(payload);
    if (!result.ok) {
      setFormError(
        result.status === 400
          ? "Invalid type or title."
          : "Could not create the material.",
      );
      return false;
    }
    if (p_draft.file !== null) {
      const upload: PanelMaterialResult = await facade.uploadMaterialFile(
        result.material.id,
        p_draft.file,
      );
      if (!upload.ok) {
        setFormError("Material created, but the file upload was rejected.");
        await reload(facade);
        return false;
      }
    }
    setFormError(null);
    await reload(facade);
    return true;
  };

  const deleteMaterial = async (p_id: string): Promise<boolean> => {
    const facade: MaterialsFacade = makeMaterials();
    const result: PanelMaterialResult = await facade.deleteMaterial(p_id);
    if (!result.ok) {
      setFormError("Could not delete the material.");
      return false;
    }
    setFormError(null);
    await reload(facade);
    return true;
  };

  const uploadMaterialFile = async (
    p_id: string,
    p_file: File,
  ): Promise<boolean> => {
    const facade: MaterialsFacade = makeMaterials();
    const result: PanelMaterialResult = await facade.uploadMaterialFile(
      p_id,
      p_file,
    );
    if (!result.ok) {
      setFormError(
        result.status === 400
          ? "Empty file or type not accepted."
          : "Could not upload the file.",
      );
      return false;
    }
    setFormError(null);
    await reload(facade);
    return true;
  };

  const value: MaterialsSessionContextValue = {
    role,
    activeRole,
    materials,
    isLoading,
    isForbidden,
    errorMessage,
    formError,
    switchRole,
    createMaterial,
    deleteMaterial,
    uploadMaterialFile,
  };

  return (
    <MaterialsSessionContext.Provider value={value}>
      {p_props.children}
    </MaterialsSessionContext.Provider>
  );
}

export function useMaterialsSession(): MaterialsSessionContextValue {
  const value: MaterialsSessionContextValue | null = useContext(
    MaterialsSessionContext,
  );
  if (value === null) {
    throw new Error("useMaterialsSession requires MaterialsSessionProvider");
  }
  return value;
}
