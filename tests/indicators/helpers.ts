import { jsonRequest } from "../family/helpers";
import { putScheduledDay } from "../calendar-ops/helpers";
import {
  arrangePublishedMission,
  arrangePickFamily,
  insertCompletedFamilyMission,
} from "../pick/helpers";
import { arrangeAcceptedCycle, patchCycle, setMissionRepeatable } from "../mission-play/helpers";

export { jsonRequest };

export async function getIndicators(): Promise<Response> {
  const { GET } = await import("@/app/api/panel/indicators/route");
  return GET(jsonRequest("/api/panel/indicators", "GET"));
}

export async function asStaff(p_role: "Admin" | "Operator"): Promise<void> {
  const { getMockSession } = await import("@/internal/db/mock-session");
  getMockSession().role = p_role;
}

export async function asParent(): Promise<void> {
  const { getMockSession } = await import("@/internal/db/mock-session");
  getMockSession().role = "Parent";
}

export async function seedScheduledAndDone(): Promise<void> {
  const arranged = await arrangePickFamily();
  const scheduledMission: string = await arrangePublishedMission("Scheduled walk");
  const doneMission: string = await arrangePublishedMission("Done walk");
  await putScheduledDay(arranged.familyId, "2026-10-20", "sug-scheduled", scheduledMission);
  const { PUT } = await import("@/app/api/families/[id]/calendar/[day]/route");
  const { calendarRouteParams } = await import("../calendar/helpers");
  const response: Response = await PUT(
    jsonRequest(`/api/families/${arranged.familyId}/calendar/2026-10-21`, "PUT", {
      suggestions: {
        id: "env-2026-10-21",
        suggestions: [
          {
            id: "sug-done",
            mission_id: doneMission,
            curated_material_id: null,
            status: "done",
          },
        ],
      },
    }),
    calendarRouteParams(arranged.familyId, "2026-10-21"),
  );
  if (response.status !== 200) {
    throw new Error(`seed done day failed: ${String(response.status)}`);
  }
}

export async function seedCompletedRows(p_count: number): Promise<void> {
  const arranged = await arrangePickFamily();
  for (let p_index = 0; p_index < p_count; p_index += 1) {
    const missionId: string = await arrangePublishedMission(`Done ${String(p_index)}`);
    await insertCompletedFamilyMission(arranged.familyId, missionId);
  }
}

export async function seedRepeatedMission(): Promise<void> {
  const first = await arrangeAcceptedCycle("Repeat picnic");
  await setMissionRepeatable(first.missionId, 1);
  await patchCycle(first.cycleId, { status: "Doing" });
  await patchCycle(first.cycleId, {
    status: "Completed",
    closing: { do_again: true, save_memory: false },
  });
  const { AcceptedFamilyMissionFactory } = await import(
    "@/app/api/families/[id]/missions/surprise/accepted-factory"
  );
  const second: { id: string } = await new AcceptedFamilyMissionFactory().create(
    first.familyId,
    first.missionId,
  );
  await patchCycle(second.id, { status: "Doing" });
  const completed: Response = await patchCycle(second.id, {
    status: "Completed",
    closing: { do_again: false, save_memory: false },
  });
  if (completed.status !== 200) {
    throw new Error(`second complete failed: ${String(completed.status)}`);
  }
}
