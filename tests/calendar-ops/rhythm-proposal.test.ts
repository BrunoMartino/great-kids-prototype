import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeCalendarFamily,
  arrangePublishedMission,
  familyRouteParams,
  jsonRequest,
  putScheduledDay,
  suggestionRouteParams,
} from "./helpers";

type RhythmItem = {
  id: string;
  label: string;
  source_mission_id: string;
  weekday: string;
};

type RhythmsEnvelope = {
  id?: string;
  rhythms?: RhythmItem[];
  error?: string;
};

type PatchBody = {
  days?: unknown[];
  proposal?: { source_mission_id: string; weekday: string } | null;
};

async function markDone(
  p_familyId: string,
  p_day: string,
  p_sid: string,
): Promise<PatchBody> {
  const { PATCH } = await import(
    "@/app/api/families/[id]/calendar/[day]/suggestions/[sid]/route"
  );
  const response: Response = await PATCH(
    jsonRequest(
      `/api/families/${p_familyId}/calendar/${p_day}/suggestions/${p_sid}`,
      "PATCH",
      { status: "done" },
    ),
    suggestionRouteParams(p_familyId, p_day, p_sid),
  );
  return (await response.json()) as PatchBody;
}

describe("rhythm proposal Observer", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("emits a proposal after four repeats without writing rhythms", async () => {
    // Break: the fourth repeat auto-inserts a rhythm, or never proposes.
    const arranged = await arrangeCalendarFamily();
    const missionId: string = await arrangePublishedMission("Tuesday walk");
    const days: string[] = ["2026-10-06", "2026-10-13", "2026-10-20", "2026-10-27"];
    for (let index = 0; index < days.length; index += 1) {
      const day: string | undefined = days[index];
      if (day === undefined) {
        continue;
      }
      await putScheduledDay(arranged.familyId, day, `sug-r${String(index)}`, missionId);
    }
    await markDone(arranged.familyId, "2026-10-06", "sug-r0");
    await markDone(arranged.familyId, "2026-10-13", "sug-r1");
    await markDone(arranged.familyId, "2026-10-20", "sug-r2");
    const fourth: PatchBody = await markDone(arranged.familyId, "2026-10-27", "sug-r3");
    expect(fourth.proposal?.source_mission_id).toBe(missionId);
    const { FamilyProfile } = await import("@/models/family_profile");
    const gps = FamilyProfile.instance.findByFamilyId(arranged.familyId);
    expect(gps?.rhythms.rhythms).toEqual([]);
  });

  it("does not propose after three repeats", async () => {
    // Break: Observer fires before the four-repeat threshold.
    const arranged = await arrangeCalendarFamily();
    const missionId: string = await arrangePublishedMission("Short walk");
    const days: string[] = ["2026-10-06", "2026-10-13", "2026-10-20"];
    for (let index = 0; index < days.length; index += 1) {
      const day: string | undefined = days[index];
      if (day === undefined) {
        continue;
      }
      await putScheduledDay(arranged.familyId, day, `sug-t${String(index)}`, missionId);
    }
    await markDone(arranged.familyId, "2026-10-06", "sug-t0");
    await markDone(arranged.familyId, "2026-10-13", "sug-t1");
    const third: PatchBody = await markDone(arranged.familyId, "2026-10-20", "sug-t2");
    expect(third.proposal).toBeNull();
  });

  it("does not write rhythms when the proposal is dismissed", async () => {
    // Break: POST dismissed appends a rhythm item.
    const arranged = await arrangeCalendarFamily();
    const { POST } = await import("@/app/api/families/[id]/rhythms/proposal/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/rhythms/proposal`, "POST", {
        dismissed: true,
      }),
      familyRouteParams(arranged.familyId),
    );
    const body: RhythmsEnvelope = (await response.json()) as RhythmsEnvelope;
    expect(response.status).toBe(200);
    expect(body.rhythms).toEqual([]);
    const { FamilyProfile } = await import("@/models/family_profile");
    expect(FamilyProfile.instance.findByFamilyId(arranged.familyId)?.rhythms.rhythms).toEqual([]);
  });

  it("appends a rhythm envelope item when the Parent accepts", async () => {
    // Break: accept does not persist { id, label, source_mission_id, weekday }.
    const arranged = await arrangeCalendarFamily();
    const missionId: string = await arrangePublishedMission("Rhythm walk");
    const { POST } = await import("@/app/api/families/[id]/rhythms/proposal/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/rhythms/proposal`, "POST", {
        source_mission_id: missionId,
        label: "Walk on Tuesdays",
        weekday: "Tuesday",
      }),
      familyRouteParams(arranged.familyId),
    );
    const body: RhythmsEnvelope = (await response.json()) as RhythmsEnvelope;
    expect(response.status).toBe(200);
    expect(typeof body.id).toBe("string");
    expect(body.rhythms).toEqual([
      expect.objectContaining({
        label: "Walk on Tuesdays",
        source_mission_id: missionId,
        weekday: "Tuesday",
      }),
    ]);
  });

  it("rejects Child with 403 on proposal POST", async () => {
    // Break: Child can write family_profile.rhythms.
    const arranged = await arrangeCalendarFamily();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Child";
    const { applyRole } = await import("@/app/api/session/presentation-strategy");
    applyRole("Child");
    const { POST } = await import("@/app/api/families/[id]/rhythms/proposal/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/rhythms/proposal`, "POST", {
        dismissed: true,
      }),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(403);
  });
});
