export type PanelStaffRole = "Admin" | "Operator";

export type PanelMissionRow = {
  id: string;
  title: string;
  category_id: string;
  review_status: string;
};

export type PanelSessionResult =
  | { ok: true; role: PanelStaffRole }
  | { ok: false; status: number; error: string };

export type PanelCatalogResult =
  | { ok: true; id: string; missions: PanelMissionRow[] }
  | { ok: false; status: number; error: string };

async function readJsonBody(p_response: Response): Promise<unknown> {
  try {
    return await p_response.json();
  } catch (p_error: unknown) {
    void p_error;
    return null;
  }
}

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object";
}

function readStaffRole(p_value: unknown): PanelStaffRole | null {
  if (p_value !== "Admin" && p_value !== "Operator") {
    return null;
  }
  return p_value;
}

function readSessionBody(p_value: unknown): { role: PanelStaffRole } | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const role: unknown = Reflect.get(p_value, "role");
  const parsedRole: PanelStaffRole | null = readStaffRole(role);
  if (parsedRole === null) {
    return null;
  }
  return { role: parsedRole };
}

function readErrorBody(p_value: unknown): string {
  if (!isRecord(p_value)) {
    return "erro";
  }
  const error: unknown = Reflect.get(p_value, "error");
  if (typeof error !== "string" || error.length === 0) {
    return "erro";
  }
  return error;
}

function readMissionRow(p_value: unknown): PanelMissionRow | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const id: unknown = Reflect.get(p_value, "id");
  const title: unknown = Reflect.get(p_value, "title");
  const categoryId: unknown = Reflect.get(p_value, "category_id");
  const reviewStatus: unknown = Reflect.get(p_value, "review_status");
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }
  if (typeof title !== "string") {
    return null;
  }
  if (typeof categoryId !== "string") {
    return null;
  }
  if (typeof reviewStatus !== "string") {
    return null;
  }
  return {
    id,
    title,
    category_id: categoryId,
    review_status: reviewStatus,
  };
}

function readCatalogBody(
  p_value: unknown,
): { id: string; missions: PanelMissionRow[] } | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const id: unknown = Reflect.get(p_value, "id");
  const missions: unknown = Reflect.get(p_value, "missions");
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }
  if (!Array.isArray(missions)) {
    return null;
  }
  const rows: PanelMissionRow[] = [];
  const items: unknown[] = missions;
  for (let i: number = 0; i < items.length; i += 1) {
    const item: unknown = items[i];
    const row: PanelMissionRow | null = readMissionRow(item);
    if (row === null) {
      return null;
    }
    rows.push(row);
  }
  return { id, missions: rows };
}

export class PanelCatalogFacade {
  public constructor(
    private fetchFn: typeof fetch = globalThis.fetch.bind(globalThis),
  ) {}

  public async loadSession(): Promise<PanelSessionResult> {
    try {
      const response: Response = await this.fetchFn("/api/panel/session", {
        cache: "no-store",
      });
      const body: unknown = await readJsonBody(response);
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: readErrorBody(body),
        };
      }
      const parsed: { role: PanelStaffRole } | null = readSessionBody(body);
      if (parsed === null) {
        return {
          ok: false,
          status: response.status,
          error: "invalid session",
        };
      }
      return { ok: true, role: parsed.role };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "session load failed" };
    }
  }

  public async loadCatalog(): Promise<PanelCatalogResult> {
    try {
      const response: Response = await this.fetchFn("/api/panel/catalog", {
        cache: "no-store",
      });
      const body: unknown = await readJsonBody(response);
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: readErrorBody(body),
        };
      }
      const parsed: { id: string; missions: PanelMissionRow[] } | null =
        readCatalogBody(body);
      if (parsed === null) {
        return {
          ok: false,
          status: response.status,
          error: "invalid catalog",
        };
      }
      return { ok: true, id: parsed.id, missions: parsed.missions };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "catalog load failed" };
    }
  }
}
