import { GpsPolicy } from "@/app/api/families/[id]/profile/gps-policy";
import { AcceptedFamilyMissionFactory } from "@/app/api/families/[id]/missions/surprise/accepted-factory";
import { SurpriseSelectionStrategy } from "@/app/api/families/[id]/missions/surprise/selection-strategy";
import { getMockSession } from "@/internal/db/mock-session";
import { Family } from "@/models/family";

type FamilyRouteContext = {
  params: Promise<{ id: string }>;
};

function deny(): Response {
  return Response.json({ error: "forbidden" }, { status: 403 });
}

export async function POST(
  p_request: Request,
  p_context: FamilyRouteContext,
): Promise<Response> {
  void p_request;
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  try {
    GpsPolicy.assertCanEdit(getMockSession().role);
  } catch {
    return deny();
  }
  if (Family.instance.findHolderUserId(familyId) === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const chosen: string | null = new SurpriseSelectionStrategy().choose({ familyId });
  if (chosen === null) {
    return Response.json({ id: crypto.randomUUID(), mission_id: null }, { status: 200 });
  }
  const created = await new AcceptedFamilyMissionFactory().create(familyId, chosen);
  return Response.json(created, { status: 200 });
}
