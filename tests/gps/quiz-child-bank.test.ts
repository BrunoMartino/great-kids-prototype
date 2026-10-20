import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import { arrangeGpsFamily, jsonRequest, seedLiveFamilyQuiz } from "./helpers";

type RouteContext = {
  params: Promise<{ id: string }>;
};

describe("Child context cannot edit the question bank", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns 403 when Child PATCHes a panel question", async () => {
    // Break: Child PATCH /api/panel/questions/{id} succeeds.
    await arrangeGpsFamily();
    const question = await seedLiveFamilyQuiz("Bank row");
    const { applyRole } = await import("@/app/api/session/presentation-strategy");
    applyRole("Child");
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Child";
    const { PATCH } = await import("@/app/api/panel/questions/[id]/route");
    const response: Response = await PATCH(
      jsonRequest(`/api/panel/questions/${question.id}`, "PATCH", {
        question_text: "Hijacked",
      }),
      { params: Promise.resolve({ id: question.id }) } as RouteContext,
    );
    expect(response.status).toBe(403);
  });
});
