import { AcceptInvite } from "@/app/api/families/[id]/invites/accept-invite";
import { InviteAdult } from "@/app/api/families/[id]/invites/invite-adult";
import { InvitePolicy } from "@/app/api/families/[id]/invites/invite-policy";
import { RevokeInvite } from "@/app/api/families/[id]/invites/revoke-invite";
import {
  getPresentation,
  isPresentationPresent,
} from "@/app/api/session/presentation-strategy";
import { Family } from "@/models/family";
import type { FamilyInviteRecord } from "@/models/family_invite";
import { ContextPolicy } from "@/policies/role";

type FamilyRouteContext = {
  params: Promise<{ id: string }>;
};

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

function readActorUserId(p_request: Request): string {
  return p_request.headers.get("x-actor-user-id") ?? "";
}

function assertTitularInvite(p_request: Request, p_familyId: string): void {
  const actorUserId: string = readActorUserId(p_request);
  const holderUserId: string = Family.instance.findHolderUserId(p_familyId) ?? "";
  const presentationRole: string = getPresentation().role;
  ContextPolicy.assertCanInvite(presentationRole);
  InvitePolicy.assertCanInvite(actorUserId, presentationRole, holderUserId);
}

function denyFamilyWrite(p_familyId: string, p_request: Request): Response | null {
  try {
    ContextPolicy.assertSessionPresent(isPresentationPresent());
  } catch {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    assertTitularInvite(p_request, p_familyId);
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}

export async function POST(
  p_request: Request,
  p_context: FamilyRouteContext,
): Promise<Response> {
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  const denied: Response | null = denyFamilyWrite(familyId, p_request);
  if (denied !== null) {
    return denied;
  }
  const body: unknown = await p_request.json();
  if (!isRecord(body) || typeof body.email !== "string" || typeof body.role !== "string") {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  try {
    const command: InviteAdult = new InviteAdult(familyId, body.email, body.role);
    const created: FamilyInviteRecord = command.execute();
    return Response.json(
      {
        id: created.id,
        family_id: created.family_id,
        email: created.email,
        role: created.role,
        status: created.status,
        expires_at: created.expires_at,
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}

export async function PATCH(
  p_request: Request,
  p_context: FamilyRouteContext,
): Promise<Response> {
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  const denied: Response | null = denyFamilyWrite(familyId, p_request);
  if (denied !== null) {
    return denied;
  }
  const body: unknown = await p_request.json();
  if (!isRecord(body) || typeof body.id !== "string" || typeof body.action !== "string") {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  try {
    if (body.action === "accept") {
      const command: AcceptInvite = new AcceptInvite(body.id);
      const accepted: FamilyInviteRecord = command.execute();
      if (accepted.status === "Expired") {
        return Response.json({ status: accepted.status }, { status: 409 });
      }
      return Response.json({ id: accepted.id, status: accepted.status }, { status: 200 });
    }
    if (body.action === "revoke") {
      const command: RevokeInvite = new RevokeInvite(body.id);
      const revoked: FamilyInviteRecord = command.execute();
      return Response.json({ id: revoked.id, status: revoked.status }, { status: 200 });
    }
    return Response.json({ error: "bad request" }, { status: 400 });
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
