import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeGpsFamily,
  familyRouteParams,
  jsonRequest,
  seedLiveFamilyQuiz,
} from "./helpers";

type QuizOffer = {
  id: string;
  questions: Array<{ id: string; question_text: string }>;
};

describe("GET /api/families/[id]/quiz", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns live Family-Quiz questions as an envelope", async () => {
    // Break: missing GET, missing envelope, or live question omitted.
    const arranged = await arrangeGpsFamily();
    const live = await seedLiveFamilyQuiz("What is our weekend ritual?");
    const { GET } = await import("@/app/api/families/[id]/quiz/route");
    const response: Response = await GET(
      jsonRequest(`/api/families/${arranged.familyId}/quiz`, "GET"),
      familyRouteParams(arranged.familyId),
    );
    const body: QuizOffer = (await response.json()) as QuizOffer;
    expect(response.status).toBe(200);
    expect(typeof body.id).toBe("string");
    expect(body.questions).toEqual([{ id: live.id, question_text: "What is our weekend ritual?" }]);
  });

  it("returns an empty questions array when the bank has no live Family-Quiz rows", async () => {
    // Break: missing bank is 404 or questions is undefined.
    const arranged = await arrangeGpsFamily();
    const { GET } = await import("@/app/api/families/[id]/quiz/route");
    const response: Response = await GET(
      jsonRequest(`/api/families/${arranged.familyId}/quiz`, "GET"),
      familyRouteParams(arranged.familyId),
    );
    const body: QuizOffer = (await response.json()) as QuizOffer;
    expect(response.status).toBe(200);
    expect(body.questions).toEqual([]);
  });

  it("omits deleted bank rows from the family offer", async () => {
    // Break: deleted family_quiz id still appears in GET quiz.
    const arranged = await arrangeGpsFamily();
    const live = await seedLiveFamilyQuiz("Live prompt");
    const gone = await seedLiveFamilyQuiz("Deleted prompt");
    const { FamilyQuiz } = await import("@/models/family_quiz");
    FamilyQuiz.instance.softDelete(gone.id);
    const { GET } = await import("@/app/api/families/[id]/quiz/route");
    const response: Response = await GET(
      jsonRequest(`/api/families/${arranged.familyId}/quiz`, "GET"),
      familyRouteParams(arranged.familyId),
    );
    const body: QuizOffer = (await response.json()) as QuizOffer;
    expect(body.questions.map((p_row) => p_row.id)).toEqual([live.id]);
  });

  it("treats an injection-shaped family id as data and does not 500", async () => {
    // Break: quoted id crashes the handler or runs SQL.
    await arrangeGpsFamily();
    const { GET } = await import("@/app/api/families/[id]/quiz/route");
    const injected: string = "1'; DROP TABLE family_quiz;--";
    const response: Response = await GET(
      jsonRequest(`/api/families/${injected}/quiz`, "GET"),
      familyRouteParams(injected),
    );
    expect(response.status).not.toBe(500);
    const { queryRaw } = await import("@/internal/db/connection");
    const tables: Array<{ name: string }> = queryRaw<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'family_quiz'",
      [],
    );
    expect(tables).toHaveLength(1);
  });
});
