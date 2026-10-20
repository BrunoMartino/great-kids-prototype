import { getConnection, queryRaw } from "@/internal/db/connection";

export type FamilyQuizKind = "Family-Quiz" | "Say-What";
export type FamilyQuizStatus = "active" | "inactive";

export type FamilyQuizRecord = {
  id: string;
  question_text: string;
  kind: string;
  status: string;
  weight: number;
  deleted: number;
};

export type FamilyQuizCreateInput = {
  question_text: string;
  kind: string;
  weight: number;
  status: string;
};

export type FamilyQuizUpdateInput = {
  question_text?: string;
  kind?: string;
  weight?: number;
  status?: string;
};

function isKind(p_kind: string): p_kind is FamilyQuizKind {
  return p_kind === "Family-Quiz" || p_kind === "Say-What";
}

function isStatus(p_status: string): p_status is FamilyQuizStatus {
  return p_status === "active" || p_status === "inactive";
}

export class FamilyQuiz {
  private static _instance: FamilyQuiz | null = null;

  private constructor() {}

  public static get instance(): FamilyQuiz {
    if (FamilyQuiz._instance === null) {
      FamilyQuiz._instance = new FamilyQuiz();
    }
    return FamilyQuiz._instance;
  }

  public create(p_input: FamilyQuizCreateInput): FamilyQuizRecord {
    this.assertText(p_input.question_text);
    this.assertKind(p_input.kind);
    this.assertStatus(p_input.status);
    this.assertWeight(p_input.weight);
    getConnection();
    const id: string = crypto.randomUUID();
    const now: string = new Date().toISOString();
    queryRaw(
      `INSERT INTO family_quiz (
        id, question_text, status, weight, kind, deleted, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      [id, p_input.question_text, p_input.status, p_input.weight, p_input.kind, now, now],
    );
    return {
      id,
      question_text: p_input.question_text,
      kind: p_input.kind,
      status: p_input.status,
      weight: p_input.weight,
      deleted: 0,
    };
  }

  public findById(p_id: string): FamilyQuizRecord | null {
    getConnection();
    const rows: FamilyQuizRecord[] = queryRaw<FamilyQuizRecord>(
      "SELECT id, question_text, kind, status, weight, deleted FROM family_quiz WHERE id = ?",
      [p_id],
    );
    const first: FamilyQuizRecord | undefined = rows[0];
    return first ?? null;
  }

  public list(p_kind?: string): FamilyQuizRecord[] {
    getConnection();
    if (p_kind !== undefined) {
      return queryRaw<FamilyQuizRecord>(
        "SELECT id, question_text, kind, status, weight, deleted FROM family_quiz WHERE kind = ? ORDER BY created_at",
        [p_kind],
      );
    }
    return queryRaw<FamilyQuizRecord>(
      "SELECT id, question_text, kind, status, weight, deleted FROM family_quiz ORDER BY created_at",
      [],
    );
  }

  public listLive(p_kind: string): FamilyQuizRecord[] {
    getConnection();
    return queryRaw<FamilyQuizRecord>(
      "SELECT id, question_text, kind, status, weight, deleted FROM family_quiz WHERE deleted = 0 AND kind = ? ORDER BY created_at",
      [p_kind],
    );
  }

  public update(p_id: string, p_input: FamilyQuizUpdateInput): FamilyQuizRecord | null {
    const current: FamilyQuizRecord | null = this.findById(p_id);
    if (current === null) {
      return null;
    }
    const questionText: string = p_input.question_text ?? current.question_text;
    const kind: string = p_input.kind ?? current.kind;
    const status: string = p_input.status ?? current.status;
    const weight: number = p_input.weight ?? current.weight;
    this.assertText(questionText);
    this.assertKind(kind);
    this.assertStatus(status);
    this.assertWeight(weight);
    getConnection();
    const now: string = new Date().toISOString();
    queryRaw(
      `UPDATE family_quiz
       SET question_text = ?, kind = ?, status = ?, weight = ?, updated_at = ?
       WHERE id = ?`,
      [questionText, kind, status, weight, now, p_id],
    );
    return this.findById(p_id);
  }

  public softDelete(p_id: string): FamilyQuizRecord | null {
    const current: FamilyQuizRecord | null = this.findById(p_id);
    if (current === null) {
      return null;
    }
    getConnection();
    const now: string = new Date().toISOString();
    queryRaw("UPDATE family_quiz SET deleted = 1, updated_at = ? WHERE id = ?", [now, p_id]);
    return this.findById(p_id);
  }

  private assertText(p_text: string): void {
    if (p_text.trim() === "") {
      throw new Error("empty question_text");
    }
  }

  private assertKind(p_kind: string): void {
    if (!isKind(p_kind)) {
      throw new Error("invalid kind");
    }
  }

  private assertStatus(p_status: string): void {
    if (!isStatus(p_status)) {
      throw new Error("invalid status");
    }
  }

  private assertWeight(p_weight: number): void {
    if (p_weight < 0) {
      throw new Error("invalid weight");
    }
  }
}
