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

export type CalendarRouteParams = {
  params: Promise<{ id: string; day: string }>;
};

export async function arrangeCalendarFamily(): Promise<ArrangedFamily> {
  const arranged: ArrangedFamily = await arrangeFamilyViaHusk();
  const { getMockSession } = await import("@/internal/db/mock-session");
  getMockSession().role = "Parent";
  const { applyRole } = await import("@/app/api/session/presentation-strategy");
  applyRole("Parent");
  return arranged;
}

export function calendarRouteParams(p_familyId: string, p_day: string): CalendarRouteParams {
  return { params: Promise.resolve({ id: p_familyId, day: p_day }) };
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
