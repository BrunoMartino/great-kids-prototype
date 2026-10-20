import { InvitePolicy } from "@/app/api/families/[id]/invites/invite-policy";
import {
  getPresentation,
  isPresentationPresent,
} from "@/app/api/session/presentation-strategy";
import { Family } from "@/models/family";
import { ContextPolicy } from "@/policies/role";

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
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  const actorUserId: string = p_request.headers.get("x-actor-user-id") ?? "";
  const holderUserId: string = Family.instance.findHolderUserId(familyId) ?? "";
  try {
    ContextPolicy.assertSessionPresent(isPresentationPresent());
  } catch {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const presentationRole: string = getPresentation().role;
  try {
    ContextPolicy.assertCanChangePlan(presentationRole);
    InvitePolicy.assertCanChangePlan(actorUserId, holderUserId, presentationRole);
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const body: unknown = await p_request.json();
  if (!isRecord(body) || typeof body.plan_id !== "string") {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  try {
    Family.instance.updatePlanId(familyId, body.plan_id);
    return Response.json({ id: familyId, plan_id: body.plan_id }, { status: 200 });
  } catch {
    return Response.json({ error: "not found" }, { status: 404 });
  }
}
