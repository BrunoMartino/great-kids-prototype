import { SupportPolicy } from "@/app/api/panel/families/support-policy";
import { getMockSession } from "@/internal/db/mock-session";
import { Family } from "@/models/family";
import { Plan, type PlanRecord } from "@/models/plan";

type FamilyRouteContext = {
  params: Promise<{ id: string }>;
};

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

export async function PATCH(
  p_request: Request,
  p_context: FamilyRouteContext,
): Promise<Response> {
  try {
    SupportPolicy.assertPanel(getMockSession().role);
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  const body: unknown = await p_request.json();
  if (!isRecord(body) || typeof body.plan_id !== "string") {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  const plan: PlanRecord | null = Plan.instance.findById(body.plan_id);
  if (plan === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  try {
    Family.instance.updatePlanId(familyId, body.plan_id);
    return Response.json({ id: familyId, plan_id: body.plan_id }, { status: 200 });
  } catch {
    return Response.json({ error: "not found" }, { status: 404 });
  }
}
