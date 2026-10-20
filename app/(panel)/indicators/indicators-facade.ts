export type PanelStaffRole = "Admin" | "Operator";
export type PanelMockRole = "Admin" | "Operator" | "Parent" | "Child";

export type IndicatorsCounts = {
  id: string;
  scheduled: number;
  completed: number;
  repeated: number;
};

export type PanelSessionResult =
  | { ok: true; role: PanelStaffRole }
  | { ok: false; status: number; error: string };

export type PanelSetRoleResult =
  | { ok: true; role: PanelMockRole }
  | { ok: false; status: number; error: string };

export type IndicatorsResult =
  | { ok: true; counts: IndicatorsCounts }
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

function readSessionBody(p_value: unknown): { role: PanelStaffRole } | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const parsedRole: PanelStaffRole | null = readStaffRole(
    Reflect.get(p_value, "role"),
  );
  if (parsedRole === null) {
    return null;
  }
  return { role: parsedRole };
}

function readMockRoleBody(p_value: unknown): { role: PanelMockRole } | null {
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

function readCountsBody(p_value: unknown): IndicatorsCounts | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const id: unknown = Reflect.get(p_value, "id");
  const scheduled: unknown = Reflect.get(p_value, "scheduled");
  const completed: unknown = Reflect.get(p_value, "completed");
  const repeated: unknown = Reflect.get(p_value, "repeated");
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }
  if (typeof scheduled !== "number" || !Number.isFinite(scheduled)) {
    return null;
  }
  if (typeof completed !== "number" || !Number.isFinite(completed)) {
    return null;
  }
  if (typeof repeated !== "number" || !Number.isFinite(repeated)) {
    return null;
  }
  return { id, scheduled, completed, repeated };
}

export class IndicatorsPanelFacade {
  private static _instance: IndicatorsPanelFacade | null = null;

  private constructor(
    private fetchFn: typeof fetch = globalThis.fetch.bind(globalThis),
  ) {}

  public static get instance(): IndicatorsPanelFacade {
    if (IndicatorsPanelFacade._instance === null) {
      IndicatorsPanelFacade._instance = new IndicatorsPanelFacade();
    }
    return IndicatorsPanelFacade._instance;
  }

  public async setRole(p_role: PanelMockRole): Promise<PanelSetRoleResult> {
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
      const parsed: { role: PanelMockRole } | null = readMockRoleBody(body);
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

  public async loadIndicators(): Promise<IndicatorsResult> {
    try {
      const response: Response = await this.fetchFn("/api/panel/indicators", {
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
      const counts: IndicatorsCounts | null = readCountsBody(body);
      if (counts === null) {
        return {
          ok: false,
          status: response.status,
          error: "invalid indicators",
        };
      }
      return { ok: true, counts };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "indicators load failed" };
    }
  }
}
