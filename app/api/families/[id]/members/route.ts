import { InvitePolicy } from "@/app/api/families/[id]/invites/invite-policy";
import { MemberPolicy } from "@/app/api/families/[id]/members/member-policy";
import {
  getPresentation,
  isPresentationPresent,
} from "@/app/api/session/presentation-strategy";
import { Family, type MembersEnvelope } from "@/models/family";
import { ContextPolicy } from "@/policies/role";

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
    ContextPolicy.assertSessionPresent(isPresentationPresent());
  } catch {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const presentationRole: string = getPresentation().role;
  try {
    ContextPolicy.assertCanInvite(presentationRole);
    InvitePolicy.assertCanInvite(actorUserId, presentationRole, holderUserId);
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const body: unknown = await p_request.json();
  try {
    MemberPolicy.assertWrite(body);
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  try {
    const stored: MembersEnvelope = Family.instance.replaceMembers(familyId, body);
    return Response.json(stored, { status: 200 });
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
