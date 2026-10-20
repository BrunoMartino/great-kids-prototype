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

describe("POST /api/families/[id]/quiz", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("appends an answer that references the family_quiz id", async () => {
    // Break: POST missing, answer not stored, or question_id drifts from the bank id.
    const arranged = await arrangeGpsFamily();
    const question = await seedLiveFamilyQuiz("What is our weekend ritual?");
    const { POST } = await import("@/app/api/families/[id]/quiz/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/quiz`, "POST", {
        question_id: question.id,
        answer_text: "Pancakes on Sunday",
      }),
      familyRouteParams(arranged.familyId),
    );
    const body: AnswersEnvelope = (await response.json()) as AnswersEnvelope;
    expect(response.status).toBe(200);
    expect(typeof body.id).toBe("string");
    expect(body.answers).toEqual([
      { question_id: question.id, answer_text: "Pancakes on Sunday", deleted: false },
    ]);
  });

  it("rejects empty answer_text", async () => {
    // Break: empty text is stored.
    const arranged = await arrangeGpsFamily();
    const question = await seedLiveFamilyQuiz("Empty check");
    const { POST } = await import("@/app/api/families/[id]/quiz/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/quiz`, "POST", {
        question_id: question.id,
        answer_text: "   ",
      }),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(400);
  });

  it("rejects an unknown question_id", async () => {
    // Break: unknown id is appended to quiz_answer.
    const arranged = await arrangeGpsFamily();
    const { POST } = await import("@/app/api/families/[id]/quiz/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/quiz`, "POST", {
        question_id: "00000000-0000-4000-8000-000000000404",
        answer_text: "Ghost",
      }),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(400);
  });

  it("stores injection-shaped answer_text as data, never a bare answers array", async () => {
    // Break: payload runs as SQL, or quiz_answer column is a JSON array (INV-004).
    const arranged = await arrangeGpsFamily();
    const question = await seedLiveFamilyQuiz("Bound text");
    const payload: string = "x'; DROP TABLE family_profile;--";
    const { POST } = await import("@/app/api/families/[id]/quiz/route");
    const response: Response = await POST(
      jsonRequest(`/api/families/${arranged.familyId}/quiz`, "POST", {
        question_id: question.id,
        answer_text: payload,
      }),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(200);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: Array<{ quiz_answer: string }> = queryRaw<{ quiz_answer: string }>(
      `SELECT quiz_answer FROM family_profile
       WHERE id = (SELECT fam_profile_id FROM family WHERE id = ?)`,
      [arranged.familyId],
    );
    const stored: unknown = JSON.parse(rows[0].quiz_answer);
    expect(Array.isArray(stored)).toBe(false);
    const envelope: AnswersEnvelope = stored as AnswersEnvelope;
    expect(envelope.answers[0].answer_text).toBe(payload);
    const tables: Array<{ name: string }> = queryRaw<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'family_profile'",
      [],
    );
    expect(tables).toHaveLength(1);
  });
});
