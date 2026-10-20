import { GpsPolicy } from "@/app/api/families/[id]/profile/gps-policy";
import { getFamilyRole } from "@/internal/db/mock-session";
import { Family } from "@/models/family";
import { Mission, type MissionFiche } from "@/models/mission";
import { MissionPick, NoCandidateError, type PickResult } from "@/services/mission_pick/mission-pick";
import { RankerDiscardError } from "@/services/mission_pick/ranker-adapter";

type FamilyRouteContext = {
  params: Promise<{ id: string }>;
};

type PickPostBody = {
  context_id?: string;
};

function deny(): Response {
  return Response.json({ error: "forbidden" }, { status: 403 });
}

function noCandidate(): Response {
  return Response.json({ error: "no candidate" }, { status: 422 });
}

function rankerDiscarded(): Response {
  return Response.json({ error: "ranker discarded" }, { status: 422 });
}

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

export async function POST(
  p_request: Request,
  p_context: FamilyRouteContext,
): Promise<Response> {
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  try {
    GpsPolicy.assertCanEdit(getFamilyRole());
  } catch {
    return deny();
  }
  if (Family.instance.findHolderUserId(familyId) === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  let body: PickPostBody = {};
  try {
    const parsed: unknown = await p_request.json();
    if (isRecord(parsed) && typeof parsed.context_id === "string") {
      body = { context_id: parsed.context_id };
    }
  } catch {
    body = {};
  }
  try {
    const picked: PickResult = new MissionPick().pick({
      familyId,
      contextId: body.context_id,
    });
    const fiche: MissionFiche | null = Mission.instance.findById(picked.mission_id);
    if (fiche === null || fiche.review_status !== "published") {
      return rankerDiscarded();
    }
    return Response.json({ id: picked.id, mission_id: fiche.id }, { status: 200 });
  } catch (p_error: unknown) {
    if (p_error instanceof NoCandidateError) {
      return noCandidate();
    }
    if (p_error instanceof RankerDiscardError) {
      return rankerDiscarded();
    }
    throw p_error;
  }
}
