import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type QuizRow = {
  id: string;
  question_text: string;
  kind: string;
  status: string;
  weight: number;
  deleted: number;
};

describe("FamilyQuiz Active Record", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("creates a Family-Quiz row with text, weight, and active status", async () => {
    // Break: insert missing, or kind/status/weight not persisted.
    const { FamilyQuiz } = await import("@/models/family_quiz");
    const { queryRaw } = await import("@/internal/db/connection");
    const created: QuizRow = FamilyQuiz.instance.create({
      question_text: "What is our weekend ritual?",
      kind: "Family-Quiz",
      weight: 1,
      status: "active",
    });
    const rows: QuizRow[] = queryRaw<QuizRow>(
      "SELECT id, question_text, kind, status, weight, deleted FROM family_quiz WHERE id = ?",
      [created.id],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].question_text).toBe("What is our weekend ritual?");
    expect(rows[0].kind).toBe("Family-Quiz");
    expect(rows[0].status).toBe("active");
    expect(rows[0].weight).toBe(1);
    expect(rows[0].deleted).toBe(0);
  });

  it("allows weight zero", async () => {
    // Break: weight 0 is rejected.
    const { FamilyQuiz } = await import("@/models/family_quiz");
    const created: QuizRow = FamilyQuiz.instance.create({
      question_text: "Zero weight prompt",
      kind: "Say-What",
      weight: 0,
      status: "inactive",
    });
    expect(created.weight).toBe(0);
    expect(created.kind).toBe("Say-What");
    expect(created.status).toBe("inactive");
  });

  it("rejects empty question_text and invalid kind", async () => {
    // Break: empty text or unknown kind is stored.
    const { FamilyQuiz } = await import("@/models/family_quiz");
    await expect(async () => {
      FamilyQuiz.instance.create({
        question_text: "",
        kind: "Family-Quiz",
        weight: 1,
        status: "active",
      });
    }).rejects.toThrow();
    await expect(async () => {
      FamilyQuiz.instance.create({
        question_text: "Bad kind",
        kind: "Trivia",
        weight: 1,
        status: "active",
      });
    }).rejects.toThrow();
  });

  it("stores an injection-shaped question_text as data", async () => {
    // Break: concatenated text drops family_quiz.
    const { FamilyQuiz } = await import("@/models/family_quiz");
    const { queryRaw } = await import("@/internal/db/connection");
    const injectedText: string = "'; DROP TABLE family_quiz; --";
    const created: QuizRow = FamilyQuiz.instance.create({
      question_text: injectedText,
      kind: "Family-Quiz",
      weight: 1,
      status: "active",
    });
    expect(created.question_text).toBe(injectedText);
    const tables: Array<{ name: string }> = queryRaw<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      ["family_quiz"],
    );
    expect(tables).toEqual([{ name: "family_quiz" }]);
  });
});
