import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import { getMockSession } from "@/internal/db/mock-session";
import { DuplicatePlanNameError, Plan, type PlanRecord } from "@/models/plan";

type PlanPostBody = {
  name?: string;
  status?: string;
};

function assertStaff(): Response | null {
  const facade: SurfaceFacade = new SurfaceFacade();
  try {
    facade.assertPanel(getMockSession().role);
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(p_request: Request): Promise<Response> {
  void p_request;
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const plans: PlanRecord[] = Plan.instance.list();
  return Response.json({ id: crypto.randomUUID(), plans }, { status: 200 });
}

export async function POST(p_request: Request): Promise<Response> {
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const body: PlanPostBody = (await p_request.json()) as PlanPostBody;
  try {
    const created: PlanRecord = Plan.instance.create(body.name ?? "", body.status ?? "active");
    return Response.json({ id: crypto.randomUUID(), plan: created }, { status: 201 });
  } catch (p_error: unknown) {
    if (p_error instanceof DuplicatePlanNameError) {
      return Response.json({ error: "conflict" }, { status: 409 });
    }
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
