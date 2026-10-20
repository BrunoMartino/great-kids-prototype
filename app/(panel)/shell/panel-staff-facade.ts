export type PanelMockRole = "Admin" | "Operator" | "Parent" | "Child";
export type StaffRole = "Admin" | "Operator";

export type PanelSessionResult =
  | { ok: true; role: PanelMockRole }
  | { ok: false; status: number; error: string };

export type PanelSetRoleResult =
  | { ok: true; role: PanelMockRole }
  | { ok: false; status: number; error: string };

export type JsonFail = { ok: false; status: number; error: string };

async function readJsonBody(p_response: Response): Promise<unknown> {
  try {
    return await p_response.json();
  } catch (p_error: unknown) {
    void p_error;
    return null;
  }
}

export function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object";
}

export function readErrorBody(p_value: unknown): string {
  if (!isRecord(p_value)) {
    return "erro";
  }
  const error: unknown = Reflect.get(p_value, "error");
  if (typeof error !== "string" || error.length === 0) {
    return "erro";
  }
  return error;
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

export async function readJson(p_response: Response): Promise<unknown> {
  return readJsonBody(p_response);
}

export function asStaffRole(p_role: PanelMockRole): StaffRole | null {
  if (p_role === "Admin" || p_role === "Operator") {
    return p_role;
  }
  return null;
}

export class PanelStaffFacade {
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
}

export function failResponse(
  p_response: Response,
  p_body: unknown,
): JsonFail {
  return {
    ok: false,
    status: p_response.status,
    error: readErrorBody(p_body),
  };
}
