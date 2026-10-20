import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import { getMockSession } from "@/internal/db/mock-session";
import { Plan, type PlanRecord } from "@/models/plan";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type PlanPatchBody = {
  status?: string;
  name?: string;
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

export async function PATCH(p_request: Request, p_context: RouteContext): Promise<Response> {
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const params: { id: string } = await p_context.params;
  const body: PlanPatchBody = (await p_request.json()) as PlanPatchBody;
  try {
    const updated: PlanRecord | null = Plan.instance.updateStatus(
      params.id,
      body.status ?? "",
    );
    if (updated === null) {
      return Response.json({ error: "not found" }, { status: 404 });
    }
    return Response.json({ id: crypto.randomUUID(), plan: updated }, { status: 200 });
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
