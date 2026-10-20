import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type PlanJson = {
  id: string;
  name: string;
  status: string;
};

type PlansEnvelope = {
  id: string;
  plans: PlanJson[];
};

type PlanEnvelope = {
  id: string;
  plan: PlanJson;
};

function jsonRequest(p_path: string, p_method: string, p_body?: unknown): Request {
  const init: RequestInit = { method: p_method, headers: {} };
  if (p_body !== undefined) {
    (init.headers as Record<string, string>)["content-type"] = "application/json";
    init.body = JSON.stringify(p_body);
  }
  return new Request(`http://localhost${p_path}`, init);
}

describe("GET/POST/PATCH /api/panel/plans", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("lists Free and creates a named plan", async () => {
    // Break: GET missing Free, or POST not 201.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { GET, POST } = await import("@/app/api/panel/plans/route");
    const listResponse: Response = await GET(jsonRequest("/api/panel/plans", "GET"));
    const listBody: PlansEnvelope = (await listResponse.json()) as PlansEnvelope;
    expect(listResponse.status).toBe(200);
    expect(listBody.plans.some((p_plan) => p_plan.name === "Free")).toBe(true);
    const createdResponse: Response = await POST(
      jsonRequest("/api/panel/plans", "POST", { name: "Family", status: "active" }),
    );
    const created: PlanEnvelope = (await createdResponse.json()) as PlanEnvelope;
    expect(createdResponse.status).toBe(201);
    expect(created.plan.name).toBe("Family");
    expect(created.plan.status).toBe("active");
  });

  it("patches plan status to inactive without dropping the row", async () => {
    // Break: PATCH missing or hard-deletes the plan.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Operator";
    const { POST } = await import("@/app/api/panel/plans/route");
    const createdResponse: Response = await POST(
      jsonRequest("/api/panel/plans", "POST", { name: "Pause me", status: "active" }),
    );
    const created: PlanEnvelope = (await createdResponse.json()) as PlanEnvelope;
    const { PATCH } = await import("@/app/api/panel/plans/[id]/route");
    const patchedResponse: Response = await PATCH(
      jsonRequest(`/api/panel/plans/${created.plan.id}`, "PATCH", { status: "inactive" }),
      { params: Promise.resolve({ id: created.plan.id }) },
    );
    const patched: PlanEnvelope = (await patchedResponse.json()) as PlanEnvelope;
    expect(patchedResponse.status).toBe(200);
    expect(patched.plan.status).toBe("inactive");
    const { Plan } = await import("@/models/plan");
    expect(Plan.instance.findById(created.plan.id)?.status).toBe("inactive");
  });
});
