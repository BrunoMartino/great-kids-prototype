import { AddressPolicy } from "@/app/api/families/[id]/address/address-policy";
import { getFamilyRole } from "@/internal/db/mock-session";
import { Family, type FamilyAddress } from "@/models/family";

type FamilyRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(
  p_request: Request,
  p_context: FamilyRouteContext,
): Promise<Response> {
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  const actorUserId: string = p_request.headers.get("x-actor-user-id") ?? "";
  const holderUserId: string = Family.instance.findHolderUserId(familyId) ?? "";
  try {
    AddressPolicy.assertCanWrite(actorUserId, getFamilyRole(), holderUserId);
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const body: unknown = await p_request.json();
  try {
    const stored: FamilyAddress = Family.instance.replaceAddress(familyId, body);
    return Response.json(stored, { status: 200 });
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
