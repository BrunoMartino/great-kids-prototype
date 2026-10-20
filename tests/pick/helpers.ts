import {
  arrangeFamilyViaHusk,
  familyRouteParams,
  jsonRequest,
  type ArrangedFamily,
  type FamilyRouteParams,
} from "../family/helpers";

export { familyRouteParams, jsonRequest };
export type { ArrangedFamily, FamilyRouteParams };

const WATCH_ID: string = "f43929c0-ec67-51da-aeb9-9e461f57f364";

export const RAIN_CONTEXT_ID: string = "26533182-4f8b-58e3-83ef-3e551d134baf";
export const UNKNOWN_ID: string = "00000000-0000-4000-8000-000000000404";

export async function arrangePickFamily(): Promise<ArrangedFamily> {
  const arranged: ArrangedFamily = await arrangeFamilyViaHusk();
  const { getMockSession } = await import("@/internal/db/mock-session");
  getMockSession().role = "Parent";
  const { applyRole } = await import("@/app/api/session/presentation-strategy");
  applyRole("Parent");
  return arranged;
}

export async function arrangeDraftMission(p_title: string): Promise<string> {
  const { DraftMissionFactory } = await import("@/app/api/missions/mission-factory");
  const factory: InstanceType<typeof DraftMissionFactory> = new DraftMissionFactory();
  const created: { id: string } = await factory.create({
    category_id: WATCH_ID,
    title: p_title,
  });
  return created.id;
}

export async function arrangePublishedMission(p_title: string): Promise<string> {
  const missionId: string = await arrangeDraftMission(p_title);
  const { ReviewState } = await import("@/app/api/missions/[id]/review-state");
  const { Mission } = await import("@/models/mission");
  Mission.instance.updateReviewStatus(missionId, ReviewState.transition("draft", "in_review"));
  Mission.instance.updateReviewStatus(
    missionId,
    ReviewState.transition("in_review", "published"),
  );
  return missionId;
}

export async function setMissionRepeatable(p_missionId: string, p_repeatable: 0 | 1): Promise<void> {
  const { queryRaw } = await import("@/internal/db/connection");
  queryRaw("UPDATE mission SET repeatable = ? WHERE id = ?", [p_repeatable, p_missionId]);
}

export async function insertCompletedFamilyMission(
  p_familyId: string,
  p_missionId: string,
): Promise<void> {
  const { queryRaw } = await import("@/internal/db/connection");
  const now: string = "2026-10-18T12:00:00.000Z";
  queryRaw(
    `INSERT INTO family_mission (
      id, fam_id, mission_id, status, accepted_at, completed_at, created_at, updated_at
    ) VALUES (?, ?, ?, 'Completed', ?, ?, ?, ?)`,
    [crypto.randomUUID(), p_familyId, p_missionId, now, now, now, now],
  );
}
