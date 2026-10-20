import {
  arrangePickFamily,
  arrangePublishedMission,
  familyRouteParams,
  jsonRequest,
  setMissionRepeatable,
  type ArrangedFamily,
  type FamilyRouteParams,
} from "../pick/helpers";

export { familyRouteParams, jsonRequest, setMissionRepeatable };
export type { ArrangedFamily, FamilyRouteParams };

export type CycleRouteParams = {
  params: Promise<{ id: string }>;
};

export type ArrangedCycle = {
  familyId: string;
  missionId: string;
  cycleId: string;
};

export function cycleRouteParams(p_cycleId: string): CycleRouteParams {
  return { params: Promise.resolve({ id: p_cycleId }) };
}

export async function arrangeAcceptedCycle(p_title: string): Promise<ArrangedCycle> {
  const arranged: ArrangedFamily = await arrangePickFamily();
  const missionId: string = await arrangePublishedMission(p_title);
  const { AcceptedFamilyMissionFactory } = await import(
    "@/app/api/families/[id]/missions/surprise/accepted-factory"
  );
  const created: { id: string } = await new AcceptedFamilyMissionFactory().create(
    arranged.familyId,
    missionId,
  );
  return { familyId: arranged.familyId, missionId, cycleId: created.id };
}

export async function patchCycle(
  p_cycleId: string,
  p_body: Record<string, unknown>,
): Promise<Response> {
  const { PATCH } = await import("@/app/api/family-missions/[id]/route");
  return PATCH(
    jsonRequest(`/api/family-missions/${p_cycleId}`, "PATCH", p_body),
    cycleRouteParams(p_cycleId),
  );
}

export async function getCompleted(p_familyId: string): Promise<Response> {
  const { GET } = await import("@/app/api/families/[id]/missions/route");
  return GET(
    jsonRequest(`/api/families/${p_familyId}/missions?status=Completed`, "GET"),
    familyRouteParams(p_familyId),
  );
}
