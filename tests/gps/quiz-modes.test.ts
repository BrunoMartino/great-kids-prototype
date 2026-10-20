import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeGpsFamily,
  familyRouteParams,
  jsonRequest,
  seedLiveFamilyQuiz,
} from "./helpers";

type AnswersEnvelope = {
  id: string;
  answers: Array<{ question_id: string; answer_text: string; deleted: boolean }>;
};

describe("quiz mode Strategy on POST /api/families/[id]/quiz", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("persists one envelope answer for both solo and table", async () => {
    // Break: table mode skips storage, or writes a second answers store.
    const arranged = await arrangeGpsFamily();
    const soloQuestion = await seedLiveFamilyQuiz("Solo prompt");
    const tableQuestion = await seedLiveFamilyQuiz("Table prompt");
    const { POST } = await import("@/app/api/families/[id]/quiz/route");
    const soloResponse: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/quiz`, "POST", {
        question_id: soloQuestion.id,
        answer_text: "Solo answer",
        mode: "solo",
      }),
      familyRouteParams(arranged.familyId),
    );
    const tableResponse: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/quiz`, "POST", {
        question_id: tableQuestion.id,
        answer_text: "Table answer",
        mode: "table",
      }),
      familyRouteParams(arranged.familyId),
    );
    const tableBody: AnswersEnvelope = (await tableResponse.json()) as AnswersEnvelope;
    expect(soloResponse.status).toBe(200);
    expect(tableResponse.status).toBe(200);
    expect(tableBody.answers).toEqual([
      { question_id: soloQuestion.id, answer_text: "Solo answer", deleted: false },
      { question_id: tableQuestion.id, answer_text: "Table answer", deleted: false },
    ]);
  });

  it("defaults missing mode to solo and still saves", async () => {
    // Break: missing mode drops the write.
    const arranged = await arrangeGpsFamily();
    const question = await seedLiveFamilyQuiz("Default mode");
    const { POST } = await import("@/app/api/families/[id]/quiz/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/quiz`, "POST", {
        question_id: question.id,
        answer_text: "Saved without mode",
      }),
      familyRouteParams(arranged.familyId),
    );
    const body: AnswersEnvelope = (await response.json()) as AnswersEnvelope;
    expect(response.status).toBe(200);
    expect(body.answers[0].answer_text).toBe("Saved without mode");
  });

  it("rejects an invalid mode", async () => {
    // Break: unknown mode is stored as if it were solo/table.
    const arranged = await arrangeGpsFamily();
    const question = await seedLiveFamilyQuiz("Bad mode");
    const { POST } = await import("@/app/api/families/[id]/quiz/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/quiz`, "POST", {
        question_id: question.id,
        answer_text: "Nope",
        mode: "choir",
      }),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(400);
  });

  it("does not create a second table for table mode", async () => {
    // Break: table mode creates a quiz_answer / family_quiz_answer table.
    const arranged = await arrangeGpsFamily();
    const question = await seedLiveFamilyQuiz("No second table");
    const { POST } = await import("@/app/api/families/[id]/quiz/route");
    await POST(
      jsonRequest(`/api/families/${arranged.familyId}/quiz`, "POST", {
        question_id: question.id,
        answer_text: "Together",
        mode: "table",
      }),
      familyRouteParams(arranged.familyId),
    );
    const { queryRaw } = await import("@/internal/db/connection");
    const extra: Array<{ name: string }> = queryRaw<{ name: string }>(
      `SELECT name FROM sqlite_master
       WHERE type = 'table' AND name IN ('quiz_answer', 'family_quiz_answer', 'quiz_mode')`,
      [],
    );
    expect(extra).toEqual([]);
  });
});

describe("ModeStrategy", () => {
  it("resolves omitted mode to solo and rejects invalid", async () => {
    // Break: missing mode throws, or choir is accepted.
    const { ModeStrategy } = await import("@/app/api/families/[id]/quiz/mode-strategy");
    expect(new ModeStrategy().resolve(undefined)).toBe("solo");
    expect(new ModeStrategy().resolve("table")).toBe("table");
    expect(() => {
      new ModeStrategy().resolve("choir");
    }).toThrow();
  });
});
