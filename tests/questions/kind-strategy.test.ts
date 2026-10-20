import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type QuizRow = {
  id: string;
  question_text: string;
  kind: string;
  deleted: number;
};

describe("KindStrategy offer filter", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("offers only live Family-Quiz rows", async () => {
    // Break: Say-What or deleted rows appear in Family-Quiz offer.
    const { FamilyQuiz } = await import("@/models/family_quiz");
    const live: QuizRow = FamilyQuiz.instance.create({
      question_text: "Live family",
      kind: "Family-Quiz",
      weight: 1,
      status: "active",
    });
    FamilyQuiz.instance.create({
      question_text: "Say what live",
      kind: "Say-What",
      weight: 1,
      status: "active",
    });
    const gone: QuizRow = FamilyQuiz.instance.create({
      question_text: "Deleted family",
      kind: "Family-Quiz",
      weight: 1,
      status: "active",
    });
    FamilyQuiz.instance.softDelete(gone.id);
    const { FamilyQuizKindStrategy } = await import(
      "@/app/api/panel/questions/kind-strategy"
    );
    const strategy: InstanceType<typeof FamilyQuizKindStrategy> = new FamilyQuizKindStrategy();
    const offered: QuizRow[] = strategy.offer();
    expect(offered.map((p_row) => p_row.id)).toEqual([live.id]);
  });

  it("offers only live Say-What rows", async () => {
    // Break: Family-Quiz rows leak into Say-What offer.
    const { FamilyQuiz } = await import("@/models/family_quiz");
    FamilyQuiz.instance.create({
      question_text: "Family only",
      kind: "Family-Quiz",
      weight: 1,
      status: "active",
    });
    const sayWhat: QuizRow = FamilyQuiz.instance.create({
      question_text: "Say what live",
      kind: "Say-What",
      weight: 1,
      status: "active",
    });
    const { SayWhatKindStrategy } = await import("@/app/api/panel/questions/kind-strategy");
    const strategy: InstanceType<typeof SayWhatKindStrategy> = new SayWhatKindStrategy();
    const offered: QuizRow[] = strategy.offer();
    expect(offered.map((p_row) => p_row.id)).toEqual([sayWhat.id]);
  });

  it("returns an empty offer when no live row matches the kind", async () => {
    // Break: strategy invents a question id.
    const { FamilyQuizKindStrategy } = await import(
      "@/app/api/panel/questions/kind-strategy"
    );
    const strategy: InstanceType<typeof FamilyQuizKindStrategy> = new FamilyQuizKindStrategy();
    expect(strategy.offer()).toEqual([]);
  });

  it("treats an injection-shaped kind as data", async () => {
    // Break: concatenated kind drops family_quiz.
    const { FamilyQuiz } = await import("@/models/family_quiz");
    const { queryRaw } = await import("@/internal/db/connection");
    FamilyQuiz.instance.create({
      question_text: "Keep me",
      kind: "Family-Quiz",
      weight: 1,
      status: "active",
    });
    const { KindStrategy } = await import("@/app/api/panel/questions/kind-strategy");
    const strategy: InstanceType<typeof KindStrategy> = new KindStrategy(
      "Family-Quiz'; DROP TABLE family_quiz;--",
    );
    expect(strategy.offer()).toEqual([]);
    const tables: Array<{ name: string }> = queryRaw<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      ["family_quiz"],
    );
    expect(tables).toEqual([{ name: "family_quiz" }]);
  });
});
