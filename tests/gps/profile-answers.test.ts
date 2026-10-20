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

async function postAnswer(
  p_familyId: string,
  p_questionId: string,
  p_text: string,
): Promise<void> {
  const { POST } = await import("@/app/api/families/[id]/quiz/route");
  await POST(
    jsonRequest(`/api/families/${p_familyId}/quiz`, "POST", {
      question_id: p_questionId,
      answer_text: p_text,
    }),
    familyRouteParams(p_familyId),
  );
}

describe("GET/PATCH/DELETE /api/families/[id]/profile/answers", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("lists stored answers with a source question_id", async () => {
    // Break: GET answers omits question_id or the envelope.
    const arranged = await arrangeGpsFamily();
    const question = await seedLiveFamilyQuiz("Source prompt");
    await postAnswer(arranged.familyId, question.id, "We hike");
    const { GET } = await import("@/app/api/families/[id]/profile/answers/route");
    const response: Response = await GET(
      jsonRequest(`/api/families/${arranged.familyId}/profile/answers`, "GET"),
      familyRouteParams(arranged.familyId),
    );
    const body: AnswersEnvelope = (await response.json()) as AnswersEnvelope;
    expect(response.status).toBe(200);
    expect(body.answers).toEqual([
      { question_id: question.id, answer_text: "We hike", deleted: false },
    ]);
  });

  it("hides a deleted answer from the family list", async () => {
    // Break: deleted answer still appears on GET answers.
    const arranged = await arrangeGpsFamily();
    const question = await seedLiveFamilyQuiz("Hide me");
    await postAnswer(arranged.familyId, question.id, "Secret");
    const { DELETE, GET } = await import("@/app/api/families/[id]/profile/answers/route");
    await DELETE(
      jsonRequest(`/api/families/${arranged.familyId}/profile/answers`, "DELETE", {
        question_id: question.id,
      }),
      familyRouteParams(arranged.familyId),
    );
    const response: Response = await GET(
      jsonRequest(`/api/families/${arranged.familyId}/profile/answers`, "GET"),
      familyRouteParams(arranged.familyId),
    );
    const body: AnswersEnvelope = (await response.json()) as AnswersEnvelope;
    expect(body.answers).toEqual([]);
  });

  it("rejects empty PATCH text", async () => {
    // Break: empty edit is persisted.
    const arranged = await arrangeGpsFamily();
    const question = await seedLiveFamilyQuiz("Edit me");
    await postAnswer(arranged.familyId, question.id, "Original");
    const { PATCH } = await import("@/app/api/families/[id]/profile/answers/route");
    const response: Response = await PATCH(
      jsonRequest(`/api/families/${arranged.familyId}/profile/answers`, "PATCH", {
        question_id: question.id,
        answer_text: "  ",
      }),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(400);
  });

  it("sets deleted true without removing the bank question", async () => {
    // Break: DELETE drops family_quiz or leaves deleted false.
    const arranged = await arrangeGpsFamily();
    const question = await seedLiveFamilyQuiz("Keep bank");
    await postAnswer(arranged.familyId, question.id, "Erase me");
    const { DELETE } = await import("@/app/api/families/[id]/profile/answers/route");
    const response: Response = await DELETE(
      jsonRequest(`/api/families/${arranged.familyId}/profile/answers`, "DELETE", {
        question_id: question.id,
      }),
      familyRouteParams(arranged.familyId),
    );
    const body: AnswersEnvelope = (await response.json()) as AnswersEnvelope;
    expect(response.status).toBe(200);
    expect(body.answers).toEqual([
      { question_id: question.id, answer_text: "Erase me", deleted: true },
    ]);
    const { FamilyQuiz } = await import("@/models/family_quiz");
    const bank = FamilyQuiz.instance.findById(question.id);
    expect(bank).not.toBeNull();
    expect(bank?.deleted).toBe(0);
  });

  it("forbids Child from wiping GPS answers", async () => {
    // Break: Child DELETE is 200.
    const arranged = await arrangeGpsFamily();
    const question = await seedLiveFamilyQuiz("Child wipe");
    await postAnswer(arranged.familyId, question.id, "Stay");
    const { applyRole } = await import("@/app/api/session/presentation-strategy");
    applyRole("Child");
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Child";
    const { DELETE } = await import("@/app/api/families/[id]/profile/answers/route");
    const response: Response = await DELETE(
      jsonRequest(`/api/families/${arranged.familyId}/profile/answers`, "DELETE", {
        question_id: question.id,
      }),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(403);
  });
});

describe("FamilyProfile.liveAnswers skips deleted", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("omits deleted answers from liveAnswers", async () => {
    // Break: pick-facing liveAnswers still returns deleted facts.
    const arranged = await arrangeGpsFamily();
    const keep = await seedLiveFamilyQuiz("Keep");
    const drop = await seedLiveFamilyQuiz("Drop");
    await postAnswer(arranged.familyId, keep.id, "Keep me");
    await postAnswer(arranged.familyId, drop.id, "Drop me");
    const { DELETE } = await import("@/app/api/families/[id]/profile/answers/route");
    await DELETE(
      jsonRequest(`/api/families/${arranged.familyId}/profile/answers`, "DELETE", {
        question_id: drop.id,
      }),
      familyRouteParams(arranged.familyId),
    );
    const { FamilyProfile } = await import("@/models/family_profile");
    const live = FamilyProfile.instance.liveAnswers(arranged.familyId);
    expect(live.map((p_row) => p_row.question_id)).toEqual([keep.id]);
  });
});
