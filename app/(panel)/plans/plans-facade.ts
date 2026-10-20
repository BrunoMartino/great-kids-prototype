import {
  failResponse,
  isRecord,
  readJson,
  type JsonFail,
} from "../shell/panel-staff-facade";

export type PanelPlanRow = {
  id: string;
  name: string;
  status: string;
};

export type PanelPlansResult =
  | { ok: true; plans: PanelPlanRow[] }
  | JsonFail;

export type PanelPlanResult = { ok: true; plan: PanelPlanRow } | JsonFail;

function readPlan(p_value: unknown): PanelPlanRow | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const id: unknown = Reflect.get(p_value, "id");
  const name: unknown = Reflect.get(p_value, "name");
  const status: unknown = Reflect.get(p_value, "status");
  if (
    typeof id !== "string" ||
    id.length === 0 ||
    typeof name !== "string" ||
    typeof status !== "string"
  ) {
    return null;
  }
  return { id, name, status };
}

export class PlansFacade {
  public constructor(
    private fetchFn: typeof fetch = globalThis.fetch.bind(globalThis),
  ) {}

  public async loadPlans(): Promise<PanelPlansResult> {
    try {
      const response: Response = await this.fetchFn("/api/panel/plans", {
        cache: "no-store",
      });
      const body: unknown = await readJson(response);
      if (!response.ok) {
        return failResponse(response, body);
      }
      if (!isRecord(body)) {
        return { ok: false, status: response.status, error: "invalid plans" };
      }
      const plansRaw: unknown = Reflect.get(body, "plans");
      if (!Array.isArray(plansRaw)) {
        return { ok: false, status: response.status, error: "invalid plans" };
      }
      const plans: PanelPlanRow[] = [];
      for (let i: number = 0; i < plansRaw.length; i += 1) {
        const row: PanelPlanRow | null = readPlan(plansRaw[i]);
        if (row === null) {
          return { ok: false, status: response.status, error: "invalid plans" };
        }
        plans.push(row);
      }
      return { ok: true, plans };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "plans load failed" };
    }
  }

  public async createPlan(p_draft: {
    name: string;
    status: string;
  }): Promise<PanelPlanResult> {
    try {
      const response: Response = await this.fetchFn("/api/panel/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(p_draft),
      });
      const body: unknown = await readJson(response);
      if (!response.ok) {
        return failResponse(response, body);
      }
      if (!isRecord(body)) {
        return { ok: false, status: response.status, error: "invalid plan" };
      }
      const plan: PanelPlanRow | null = readPlan(Reflect.get(body, "plan"));
      if (plan === null) {
        return { ok: false, status: response.status, error: "invalid plan" };
      }
      return { ok: true, plan };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "plan create failed" };
    }
  }

  public async patchPlanStatus(
    p_id: string,
    p_status: string,
  ): Promise<PanelPlanResult> {
    try {
      const response: Response = await this.fetchFn(
        `/api/panel/plans/${encodeURIComponent(p_id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ status: p_status }),
        },
      );
      const body: unknown = await readJson(response);
      if (!response.ok) {
        return failResponse(response, body);
      }
      if (!isRecord(body)) {
        return { ok: false, status: response.status, error: "invalid plan" };
      }
      const plan: PanelPlanRow | null = readPlan(Reflect.get(body, "plan"));
      if (plan === null) {
        return { ok: false, status: response.status, error: "invalid plan" };
      }
      return { ok: true, plan };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "plan patch failed" };
    }
  }
}
