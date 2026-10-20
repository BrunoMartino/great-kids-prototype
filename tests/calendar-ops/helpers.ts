import {
  arrangeCalendarFamily,
  arrangeDraftMission,
  arrangePublishedMission,
  calendarRouteParams,
  jsonRequest,
  type ArrangedFamily,
} from "../calendar/helpers";
import { familyRouteParams } from "../family/helpers";

export {
  arrangeCalendarFamily,
  arrangeDraftMission,
  arrangePublishedMission,
  calendarRouteParams,
  familyRouteParams,
  jsonRequest,
};
export type { ArrangedFamily };

export type SuggestionRouteParams = {
  params: Promise<{ id: string; day: string; sid: string }>;
};

export function suggestionRouteParams(
  p_familyId: string,
  p_day: string,
  p_sid: string,
): SuggestionRouteParams {
  return { params: Promise.resolve({ id: p_familyId, day: p_day, sid: p_sid }) };
}

export async function putScheduledDay(
  p_familyId: string,
  p_day: string,
  p_suggestionId: string,
  p_missionId: string,
): Promise<void> {
  const { PUT } = await import("@/app/api/families/[id]/calendar/[day]/route");
  const response: Response = await PUT(
    jsonRequest(`/api/families/${p_familyId}/calendar/${p_day}`, "PUT", {
      suggestions: {
        id: `env-${p_day}`,
        suggestions: [
          {
            id: p_suggestionId,
            mission_id: p_missionId,
            curated_material_id: null,
            status: "scheduled",
          },
        ],
      },
    }),
    calendarRouteParams(p_familyId, p_day),
  );
  if (response.status !== 200) {
    throw new Error(`seed PUT ${p_day} failed: ${String(response.status)}`);
  }
}
