import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeGpsFamily,
  familyRouteParams,
  jsonRequest,
  seedLiveFamilyQuiz,
} from "./helpers";

type Envelope = {
  id: string;
  answers?: unknown[];
  rhythms?: unknown[];
  achievements?: unknown[];
};

type ProfileBody = {
  id: string;
  quiz_answer: Envelope;
  rhythms: Envelope;
  achievements: Envelope;
  profile_notes: string | null;
  photo?: unknown;
  img?: unknown;
};

describe("GET /api/families/[id]/profile", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns quiz_answer, rhythms, and achievements envelopes", async () => {
    // Break: GET missing, bare arrays, or a required envelope key omitted.
    const arranged = await arrangeGpsFamily();
    const { GET } = await import("@/app/api/families/[id]/profile/route");
    const response: Response = await GET(
      jsonRequest(`/api/families/${arranged.familyId}/profile`, "GET"),
      familyRouteParams(arranged.familyId),
    );
    const body: ProfileBody = (await response.json()) as ProfileBody;
    expect(response.status).toBe(200);
    expect(typeof body.id).toBe("string");
    expect(typeof body.quiz_answer.id).toBe("string");
    expect(body.quiz_answer.answers).toEqual([]);
    expect(typeof body.rhythms.id).toBe("string");
    expect(body.rhythms.rhythms).toEqual([]);
    expect(typeof body.achievements.id).toBe("string");
    expect(body.achievements.achievements).toEqual([]);
  });

  it("rejects a bare quiz_answer array on the Composite", async () => {
    // Break: ProfileComposite accepts [].
    const { ProfileComposite } = await import(
      "@/app/api/families/[id]/profile/profile-composite"
    );
    expect(() => {
      ProfileComposite.fromStored("[]", '{"id":"r","rhythms":[]}', '{"id":"a","achievements":[]}');
    }).toThrow();
  });

  it("omits child photo fields from the GPS document (INV-002)", async () => {
    // Break: GPS JSON includes photo or img keys.
    const arranged = await arrangeGpsFamily();
    const { GET } = await import("@/app/api/families/[id]/profile/route");
    const response: Response = await GET(
      jsonRequest(`/api/families/${arranged.familyId}/profile`, "GET"),
      familyRouteParams(arranged.familyId),
    );
    const body: ProfileBody = (await response.json()) as ProfileBody;
    expect(Object.prototype.hasOwnProperty.call(body, "photo")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(body, "img")).toBe(false);
  });

  it("requires fam_profile_id: unknown family is not 200", async () => {
    // Break: missing family still returns a GPS document.
    await arrangeGpsFamily();
    const { GET } = await import("@/app/api/families/[id]/profile/route");
    const unknownId: string = "00000000-0000-4000-8000-000000000404";
    const response: Response = await GET(
      jsonRequest(`/api/families/${unknownId}/profile`, "GET"),
      familyRouteParams(unknownId),
    );
    expect(response.status).toBe(404);
  });

  it("shows a quiz answer on the profile after POST (unidirectional quiz → profile)", async () => {
    // Break: POST answer does not update GET profile, or GET profile inserts quiz rows.
    const arranged = await arrangeGpsFamily();
    const { queryRaw } = await import("@/internal/db/connection");
    const before: Array<{ n: number }> = queryRaw<{ n: number }>(
      "SELECT count(*) AS n FROM family_quiz",
      [],
    );
    const question = await seedLiveFamilyQuiz("Observer prompt");
    const { POST } = await import("@/app/api/families/[id]/quiz/route");
    await POST(
      jsonRequest(`/api/families/${arranged.familyId}/quiz`, "POST", {
        question_id: question.id,
        answer_text: "Observed",
      }),
      familyRouteParams(arranged.familyId),
    );
    const { GET } = await import("@/app/api/families/[id]/profile/route");
    const response: Response = await GET(
      jsonRequest(`/api/families/${arranged.familyId}/profile`, "GET"),
      familyRouteParams(arranged.familyId),
    );
    const body: ProfileBody = (await response.json()) as ProfileBody;
    expect(body.quiz_answer.answers).toEqual([
      { question_id: question.id, answer_text: "Observed", deleted: false },
    ]);
    const afterGet: Array<{ n: number }> = queryRaw<{ n: number }>(
      "SELECT count(*) AS n FROM family_quiz",
      [],
    );
    expect(afterGet[0].n).toBe(before[0].n + 1);
  });
});
