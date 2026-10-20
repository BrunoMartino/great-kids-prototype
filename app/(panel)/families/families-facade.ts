import {
  failResponse,
  isRecord,
  readJson,
  type JsonFail,
} from "../shell/panel-staff-facade";

export type PanelFamilyPlan = {
  name: string;
  status: string;
};

export type PanelFamilyInvite = {
  email: string;
  status: string;
};

export type PanelFamilyRow = {
  id: string;
  status: string;
  plan: PanelFamilyPlan | null;
  invites: PanelFamilyInvite[];
};

export type PanelFamiliesResult =
  | { ok: true; families: PanelFamilyRow[] }
  | JsonFail;

function readPlan(p_value: unknown): PanelFamilyPlan | null {
  if (p_value === null) {
    return null;
  }
  if (!isRecord(p_value)) {
    return null;
  }
  const name: unknown = Reflect.get(p_value, "name");
  const status: unknown = Reflect.get(p_value, "status");
  if (typeof name !== "string" || typeof status !== "string") {
    return null;
  }
  return { name, status };
}

function readInvite(p_value: unknown): PanelFamilyInvite | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const email: unknown = Reflect.get(p_value, "email");
  const status: unknown = Reflect.get(p_value, "status");
  if (typeof email !== "string" || typeof status !== "string") {
    return null;
  }
  return { email, status };
}

function readFamily(p_value: unknown): PanelFamilyRow | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const id: unknown = Reflect.get(p_value, "id");
  const status: unknown = Reflect.get(p_value, "status");
  const plan: PanelFamilyPlan | null | undefined = readPlan(
    Reflect.get(p_value, "plan"),
  );
  const invitesRaw: unknown = Reflect.get(p_value, "invites");
  if (typeof id !== "string" || typeof status !== "string") {
    return null;
  }
  if (!Array.isArray(invitesRaw)) {
    return null;
  }
  const invites: PanelFamilyInvite[] = [];
  for (let i: number = 0; i < invitesRaw.length; i += 1) {
    const invite: PanelFamilyInvite | null = readInvite(invitesRaw[i]);
    if (invite === null) {
      return null;
    }
    invites.push(invite);
  }
  return {
    id,
    status,
    plan: plan === undefined ? null : plan,
    invites,
  };
}

export class FamiliesFacade {
  public constructor(
    private fetchFn: typeof fetch = globalThis.fetch.bind(globalThis),
  ) {}

  public async loadFamilies(): Promise<PanelFamiliesResult> {
    try {
      const response: Response = await this.fetchFn("/api/panel/families", {
        cache: "no-store",
      });
      const body: unknown = await readJson(response);
      if (!response.ok) {
        return failResponse(response, body);
      }
      if (!isRecord(body)) {
        return { ok: false, status: response.status, error: "invalid families" };
      }
      const familiesRaw: unknown = Reflect.get(body, "families");
      if (!Array.isArray(familiesRaw)) {
        return { ok: false, status: response.status, error: "invalid families" };
      }
      const families: PanelFamilyRow[] = [];
      for (let i: number = 0; i < familiesRaw.length; i += 1) {
        const row: PanelFamilyRow | null = readFamily(familiesRaw[i]);
        if (row === null) {
          return { ok: false, status: response.status, error: "invalid families" };
        }
        families.push(row);
      }
      return { ok: true, families };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "families load failed" };
    }
  }
}
