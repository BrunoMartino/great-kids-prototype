import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

const WATCH_ID: string = "f43929c0-ec67-51da-aeb9-9e461f57f364";
const UNKNOWN_ID: string = "00000000-0000-4000-8000-000000000404";
const VALUES_ID: string = "c0ffee00-0000-4000-8000-000000000001";

type MissionCreated = {
  id: string;
  mission: {
    id: string;
    category_id: string;
    review_status: string;
  };
};

type ValuesEnvelope = {
  id: string;
  values: string[];
};

type FicheMission = {
  title: string;
  description: string | null;
  img_path: string | null;
  type: string;
  format: string;
  duration_minutes: number | null;
  age_min: number | null;
  age_max: number | null;
  setting: string | null;
  values: ValuesEnvelope;
  materials: unknown[];
  review_status: string;
  status: string;
};

type FicheEnvelope = {
  id: string;
  mission: FicheMission;
};

type MissionAgeRow = {
  age_min: number | null;
  age_max: number | null;
  type: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

function jsonRequest(p_path: string, p_method: string, p_body: unknown): Request {
  return new Request(`http://localhost${p_path}`, {
    method: p_method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(p_body),
  });
}

function idParams(p_id: string): RouteContext {
  return { params: Promise.resolve({ id: p_id }) };
}

async function createPaperBoatsDraft(): Promise<string> {
  const { getMockSession } = await import("@/internal/db/mock-session");
  getMockSession().role = "Admin";
  const { POST } = await import("@/app/api/missions/route");
  const createdResponse: Response = await POST(
    jsonRequest("/api/missions", "POST", {
      category_id: WATCH_ID,
      title: "Paper boats",
    }),
  );
  const created: MissionCreated = (await createdResponse.json()) as MissionCreated;
  return created.mission.id;
}

describe("GET/PATCH /api/missions/[id]", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns a staff fiche and persists PATCH fields including img_path and values envelope", async () => {
    // Break: missing [id] route, feat_img_path alias, bare values array, or title rewritten.
    const missionId: string = await createPaperBoatsDraft();
    const { GET, PATCH } = await import("@/app/api/missions/[id]/route");
    const getAfterCreate: Response = await GET(
      new Request(`http://localhost/api/missions/${missionId}`),
      idParams(missionId),
    );
    const createdBody: FicheEnvelope = (await getAfterCreate.json()) as FicheEnvelope;
    const createdKeys: string[] = Object.keys(createdBody.mission);
    expect(getAfterCreate.status).toBe(200);
    expect(typeof createdBody.id).toBe("string");
    expect(createdKeys).toEqual(
      expect.arrayContaining([
        "title",
        "description",
        "img_path",
        "type",
        "format",
        "duration_minutes",
        "age_min",
        "age_max",
        "setting",
        "values",
        "materials",
        "review_status",
        "status",
      ]),
    );
    expect(createdKeys).toContain("img_path");
    expect(createdKeys).not.toContain("feat_img_path");
    expect(createdBody.mission.title).toBe("Paper boats");

    const patchResponse: Response = await PATCH(
      jsonRequest(`/api/missions/${missionId}`, "PATCH", {
        description: "Fold paper",
        img_path: "missions/boats.jpg",
        format: "Quick-Win",
        type: "Activity",
        duration_minutes: 15,
        age_min: 5,
        age_max: 10,
        setting: "Indoor",
        values: { id: VALUES_ID, values: ["patience"] },
      }),
      idParams(missionId),
    );
    expect(patchResponse.status).toBe(200);

    const getAfterPatch: Response = await GET(
      new Request(`http://localhost/api/missions/${missionId}`),
      idParams(missionId),
    );
    const patchedBody: FicheEnvelope = (await getAfterPatch.json()) as FicheEnvelope;
    expect(getAfterPatch.status).toBe(200);
    expect(Object.keys(patchedBody.mission)).toContain("img_path");
    expect(Object.keys(patchedBody.mission)).not.toContain("feat_img_path");
    expect(patchedBody.mission.img_path).toBe("missions/boats.jpg");
    expect(patchedBody.mission.title).toBe("Paper boats");
    expect(patchedBody.mission.values).toEqual({ id: VALUES_ID, values: ["patience"] });
    expect(Array.isArray(patchedBody.mission.values)).toBe(false);
  });

  it("returns 404 for an unknown mission id", async () => {
    // Break: unknown id returns 200 or a generated fiche.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { GET } = await import("@/app/api/missions/[id]/route");
    const response: Response = await GET(
      new Request(`http://localhost/api/missions/${UNKNOWN_ID}`),
      idParams(UNKNOWN_ID),
    );
    expect(response.status).toBe(404);
  });

  it("rejects inverted ages and leaves age_min/age_max unchanged", async () => {
    // Break: inverted ages persist.
    const missionId: string = await createPaperBoatsDraft();
    const { queryRaw } = await import("@/internal/db/connection");
    const { PATCH } = await import("@/app/api/missions/[id]/route");
    const before: MissionAgeRow[] = queryRaw<MissionAgeRow>(
      "SELECT age_min, age_max, type FROM mission WHERE id = ?",
      [missionId],
    );
    const response: Response = await PATCH(
      jsonRequest(`/api/missions/${missionId}`, "PATCH", {
        age_min: 10,
        age_max: 5,
      }),
      idParams(missionId),
    );
    const after: MissionAgeRow[] = queryRaw<MissionAgeRow>(
      "SELECT age_min, age_max, type FROM mission WHERE id = ?",
      [missionId],
    );
    expect(response.status).toBe(400);
    expect(after[0].age_min).toBe(before[0].age_min);
    expect(after[0].age_max).toBe(before[0].age_max);
  });

  it("rejects an invalid type enum and does not persist it", async () => {
    // Break: type Nope is stored.
    const missionId: string = await createPaperBoatsDraft();
    const { queryRaw } = await import("@/internal/db/connection");
    const { PATCH } = await import("@/app/api/missions/[id]/route");
    const response: Response = await PATCH(
      jsonRequest(`/api/missions/${missionId}`, "PATCH", {
        type: "Nope",
      }),
      idParams(missionId),
    );
    const rows: MissionAgeRow[] = queryRaw<MissionAgeRow>(
      "SELECT age_min, age_max, type FROM mission WHERE id = ?",
      [missionId],
    );
    expect(response.status).toBe(400);
    expect(rows[0].type).toBe("Activity");
  });
});
