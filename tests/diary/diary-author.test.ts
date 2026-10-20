import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeCompletedCycle,
  arrangeDiaryFamily,
  getDiary,
  postDiary,
} from "./helpers";

type NoteItem = {
  id?: string;
  text?: string;
  kind?: string;
  author?: string;
};

type DiaryBody = {
  family_notes?: { notes?: NoteItem[] };
  mission_note?: {
    notes?: Array<{ note?: NoteItem; mission_id?: string }>;
  };
};

describe("diary note author Parent|Child", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("stores author Parent on a family note", async () => {
    const arranged = await arrangeDiaryFamily();
    const response: Response = await postDiary(arranged.familyId, {
      kind: "phrase",
      text: "Parent wrote this",
    });
    const body: DiaryBody = (await response.json()) as DiaryBody;
    expect(response.status).toBe(200);
    expect(body.family_notes?.notes?.[0]?.author).toBe("Parent");
  });

  it("allows Child to author a mission note only", async () => {
    const cycle = await arrangeCompletedCycle("Child memory mission");
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Child";
    const { applyRole } = await import("@/app/api/session/presentation-strategy");
    applyRole("Child");
    const blocked: Response = await postDiary(cycle.familyId, {
      kind: "phrase",
      text: "Child family note blocked",
    });
    expect(blocked.status).toBe(403);
    const allowed: Response = await postDiary(cycle.familyId, {
      kind: "funny",
      text: "Child laughed on the mission",
      mission_id: cycle.missionId,
      family_mission_id: cycle.cycleId,
    });
    const body: DiaryBody = (await allowed.json()) as DiaryBody;
    expect(allowed.status).toBe(200);
    expect(body.mission_note?.notes?.[0]?.note?.author).toBe("Child");
    expect(body.mission_note?.notes?.[0]?.note?.text).toBe(
      "Child laughed on the mission",
    );
  });

  it("Parent GET still lists notes after Child authored a mission note", async () => {
    const cycle = await arrangeCompletedCycle("Shared diary mission");
    const { getMockSession } = await import("@/internal/db/mock-session");
    const { applyRole } = await import("@/app/api/session/presentation-strategy");
    getMockSession().role = "Child";
    applyRole("Child");
    await postDiary(cycle.familyId, {
      kind: "learned",
      text: "Child learned something",
      mission_id: cycle.missionId,
      family_mission_id: cycle.cycleId,
    });
    getMockSession().role = "Parent";
    applyRole("Parent");
    const listed: DiaryBody = (await (await getDiary(cycle.familyId)).json()) as DiaryBody;
    expect(
      listed.mission_note?.notes?.some(
        (p_item) => p_item.note?.author === "Child",
      ),
    ).toBe(true);
  });
});
