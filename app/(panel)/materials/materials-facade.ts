import {
  failResponse,
  isRecord,
  readJson,
  type JsonFail,
} from "../shell/panel-staff-facade";

export const MATERIAL_TYPES: readonly string[] = [
  "Book",
  "Play Manual",
  "Activity",
  "HandsOn-Activity",
  "Faith-Teaching",
  "Money-Teaching",
  "Workout",
  "Volunteer",
];

export type PanelMaterialRow = {
  id: string;
  type: string;
  title: string;
  status: string;
  description: string | null;
  feat_img_path: string | null;
  file_path: string | null;
  deleted: boolean;
};

export type PanelMaterialsResult =
  | { ok: true; id: string; materials: PanelMaterialRow[] }
  | JsonFail;

export type PanelMaterialResult =
  | { ok: true; id: string; material: PanelMaterialRow }
  | JsonFail;

function readMaterialRow(p_value: unknown): PanelMaterialRow | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const id: unknown = Reflect.get(p_value, "id");
  const type: unknown = Reflect.get(p_value, "type");
  const title: unknown = Reflect.get(p_value, "title");
  const status: unknown = Reflect.get(p_value, "status");
  const description: unknown = Reflect.get(p_value, "description");
  const featImgPath: unknown = Reflect.get(p_value, "feat_img_path");
  const filePath: unknown = Reflect.get(p_value, "file_path");
  const deleted: unknown = Reflect.get(p_value, "deleted");
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }
  if (typeof type !== "string" || typeof title !== "string") {
    return null;
  }
  if (typeof status !== "string") {
    return null;
  }
  if (description !== null && typeof description !== "string") {
    return null;
  }
  if (featImgPath !== null && typeof featImgPath !== "string") {
    return null;
  }
  if (filePath !== null && typeof filePath !== "string") {
    return null;
  }
  if (typeof deleted !== "boolean") {
    return null;
  }
  return {
    id,
    type,
    title,
    status,
    description,
    feat_img_path: featImgPath,
    file_path: filePath,
    deleted,
  };
}

function readListBody(
  p_value: unknown,
): { id: string; materials: PanelMaterialRow[] } | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const id: unknown = Reflect.get(p_value, "id");
  const materials: unknown = Reflect.get(p_value, "materials");
  if (typeof id !== "string" || id.length === 0 || !Array.isArray(materials)) {
    return null;
  }
  const rows: PanelMaterialRow[] = [];
  for (let i: number = 0; i < materials.length; i += 1) {
    const row: PanelMaterialRow | null = readMaterialRow(materials[i]);
    if (row === null) {
      return null;
    }
    rows.push(row);
  }
  return { id, materials: rows };
}

function readOneBody(
  p_value: unknown,
): { id: string; material: PanelMaterialRow } | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const id: unknown = Reflect.get(p_value, "id");
  const material: PanelMaterialRow | null = readMaterialRow(
    Reflect.get(p_value, "material"),
  );
  if (typeof id !== "string" || id.length === 0 || material === null) {
    return null;
  }
  return { id, material };
}

export class MaterialsFacade {
  public constructor(
    private fetchFn: typeof fetch = globalThis.fetch.bind(globalThis),
  ) {}

  public async loadMaterials(): Promise<PanelMaterialsResult> {
    try {
      const response: Response = await this.fetchFn("/api/panel/materials", {
        cache: "no-store",
      });
      const body: unknown = await readJson(response);
      if (!response.ok) {
        return failResponse(response, body);
      }
      const parsed: { id: string; materials: PanelMaterialRow[] } | null =
        readListBody(body);
      if (parsed === null) {
        return { ok: false, status: response.status, error: "invalid materials" };
      }
      return { ok: true, id: parsed.id, materials: parsed.materials };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "materials load failed" };
    }
  }

  public async createMaterial(p_draft: {
    type: string;
    title: string;
    description?: string;
  }): Promise<PanelMaterialResult> {
    try {
      const response: Response = await this.fetchFn("/api/panel/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(p_draft),
      });
      const body: unknown = await readJson(response);
      if (!response.ok) {
        return failResponse(response, body);
      }
      const parsed: { id: string; material: PanelMaterialRow } | null =
        readOneBody(body);
      if (parsed === null) {
        return { ok: false, status: response.status, error: "invalid material" };
      }
      return { ok: true, id: parsed.id, material: parsed.material };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "material create failed" };
    }
  }

  public async deleteMaterial(p_id: string): Promise<PanelMaterialResult> {
    try {
      const response: Response = await this.fetchFn(
        `/api/panel/materials/${encodeURIComponent(p_id)}`,
        { method: "DELETE", cache: "no-store" },
      );
      const body: unknown = await readJson(response);
      if (!response.ok) {
        return failResponse(response, body);
      }
      const parsed: { id: string; material: PanelMaterialRow } | null =
        readOneBody(body);
      if (parsed === null) {
        return { ok: false, status: response.status, error: "invalid delete" };
      }
      return { ok: true, id: parsed.id, material: parsed.material };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "material delete failed" };
    }
  }

  public async uploadMaterialFile(
    p_id: string,
    p_file: File,
  ): Promise<PanelMaterialResult> {
    try {
      const data: FormData = new FormData();
      data.set("file", p_file);
      const response: Response = await this.fetchFn(
        `/api/panel/materials/${encodeURIComponent(p_id)}/upload`,
        { method: "POST", cache: "no-store", body: data },
      );
      const body: unknown = await readJson(response);
      if (!response.ok) {
        return failResponse(response, body);
      }
      const parsed: { id: string; material: PanelMaterialRow } | null =
        readOneBody(body);
      if (parsed === null) {
        return { ok: false, status: response.status, error: "invalid upload" };
      }
      return { ok: true, id: parsed.id, material: parsed.material };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "material upload failed" };
    }
  }
}
