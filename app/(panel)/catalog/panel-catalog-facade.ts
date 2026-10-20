export type PanelMissionRow = {
  id: string;
  title: string;
  category_id: string;
  review_status: string;
};

export type PanelCategoryRow = {
  id: string;
  slug: string;
  name: string;
};

export type PanelMockRole = "Admin" | "Operator" | "Parent" | "Child";
export type StaffRole = "Admin" | "Operator";

export type PanelSessionResult =
  | { ok: true; role: PanelMockRole }
  | { ok: false; status: number; error: string };

export type PanelSetRoleResult =
  | { ok: true; role: PanelMockRole }
  | { ok: false; status: number; error: string };

export type PanelCatalogResult =
  | { ok: true; id: string; missions: PanelMissionRow[] }
  | { ok: false; status: number; error: string };

export type PanelCategoriesResult =
  | { ok: true; id: string; categories: PanelCategoryRow[] }
  | { ok: false; status: number; error: string };

export type PanelMissionResult =
  | { ok: true; id: string }
  | { ok: false; status: number; error: string };

export type PanelDeleteResult =
  | { ok: true }
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

function readMockRole(p_value: unknown): PanelMockRole | null {
  if (
    p_value !== "Admin" &&
    p_value !== "Operator" &&
    p_value !== "Parent" &&
    p_value !== "Child"
  ) {
    return null;
  }
  return p_value;
}

function readSessionBody(p_value: unknown): { role: PanelMockRole } | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const parsedRole: PanelMockRole | null = readMockRole(
    Reflect.get(p_value, "role"),
  );
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

function readCategoryRow(p_value: unknown): PanelCategoryRow | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const id: unknown = Reflect.get(p_value, "id");
  const slug: unknown = Reflect.get(p_value, "slug");
  const name: unknown = Reflect.get(p_value, "name");
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }
  if (typeof slug !== "string") {
    return null;
  }
  if (typeof name !== "string") {
    return null;
  }
  return { id, slug, name };
}

function readCategoriesBody(
  p_value: unknown,
): { id: string; categories: PanelCategoryRow[] } | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const id: unknown = Reflect.get(p_value, "id");
  const categories: unknown = Reflect.get(p_value, "categories");
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }
  if (!Array.isArray(categories)) {
    return null;
  }
  const rows: PanelCategoryRow[] = [];
  const items: unknown[] = categories;
  for (let i: number = 0; i < items.length; i += 1) {
    const row: PanelCategoryRow | null = readCategoryRow(items[i]);
    if (row === null) {
      return null;
    }
    rows.push(row);
  }
  return { id, categories: rows };
}

function readCreatedMission(p_value: unknown): { id: string } | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const mission: unknown = Reflect.get(p_value, "mission");
  if (!isRecord(mission)) {
    return null;
  }
  const missionId: unknown = Reflect.get(mission, "id");
  if (typeof missionId !== "string" || missionId.length === 0) {
    return null;
  }
  return { id: missionId };
}

export class PanelCatalogFacade {
  public constructor(
    private fetchFn: typeof fetch = globalThis.fetch.bind(globalThis),
  ) {}

  public async setRole(p_role: StaffRole): Promise<PanelSetRoleResult> {
    try {
      const response: Response = await this.fetchFn("/api/panel/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ role: p_role }),
      });
      const body: unknown = await readJsonBody(response);
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: readErrorBody(body),
        };
      }
      const parsed: { role: PanelMockRole } | null = readSessionBody(body);
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
      return { ok: false, status: 0, error: "session set failed" };
    }
  }

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
      const parsed: { role: PanelMockRole } | null = readSessionBody(body);
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

  public async loadCategories(): Promise<PanelCategoriesResult> {
    try {
      const response: Response = await this.fetchFn("/api/panel/categories", {
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
      const parsed: { id: string; categories: PanelCategoryRow[] } | null =
        readCategoriesBody(body);
      if (parsed === null) {
        return {
          ok: false,
          status: response.status,
          error: "invalid categories",
        };
      }
      return { ok: true, id: parsed.id, categories: parsed.categories };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "categories load failed" };
    }
  }

  public async createMission(p_draft: {
    category_id: string;
    title: string;
  }): Promise<PanelMissionResult> {
    try {
      const response: Response = await this.fetchFn("/api/panel/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(p_draft),
      });
      const body: unknown = await readJsonBody(response);
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: readErrorBody(body),
        };
      }
      const parsed: { id: string } | null = readCreatedMission(body);
      if (parsed === null) {
        return {
          ok: false,
          status: response.status,
          error: "invalid mission",
        };
      }
      return { ok: true, id: parsed.id };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "mission create failed" };
    }
  }

  public async deleteMission(p_id: string): Promise<PanelDeleteResult> {
    try {
      const response: Response = await this.fetchFn(
        `/api/panel/catalog/${encodeURIComponent(p_id)}`,
        {
          method: "DELETE",
          cache: "no-store",
        },
      );
      const body: unknown = await readJsonBody(response);
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: readErrorBody(body),
        };
      }
      return { ok: true };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "mission delete failed" };
    }
  }

  public async uploadMissionImage(
    p_id: string,
    p_file: File,
  ): Promise<PanelMissionResult> {
    try {
      const data: FormData = new FormData();
      data.set("file", p_file);
      const response: Response = await this.fetchFn(
        `/api/panel/catalog/${encodeURIComponent(p_id)}/image`,
        {
          method: "POST",
          cache: "no-store",
          body: data,
        },
      );
      const body: unknown = await readJsonBody(response);
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: readErrorBody(body),
        };
      }
      return { ok: true, id: p_id };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "image upload failed" };
    }
  }
}
