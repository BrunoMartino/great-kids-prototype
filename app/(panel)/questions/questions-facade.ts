import { KindFilterStrategy } from "./kind-filter-strategy";

export type PanelMockRole = "Admin" | "Operator" | "Parent" | "Child";
export type QuestionKind = "Family-Quiz" | "Say-What";
export type QuestionStatus = "active" | "inactive";

export type PanelQuestionRow = {
  id: string;
  question_text: string;
  kind: QuestionKind;
  status: QuestionStatus;
  weight: number;
  deleted: boolean;
};

export type PanelQuestionDraft = {
  question_text: string;
  kind: QuestionKind;
  weight: number;
  status: QuestionStatus;
};

export type PanelQuestionPatch = {
  question_text?: string;
  kind?: QuestionKind;
  weight?: number;
  status?: QuestionStatus;
};

export type PanelSessionResult =
  | { ok: true; role: PanelMockRole }
  | { ok: false; status: number; error: string };

export type PanelSetRoleResult =
  | { ok: true; role: PanelMockRole }
  | { ok: false; status: number; error: string };

export type PanelQuestionsResult =
  | { ok: true; id: string; questions: PanelQuestionRow[] }
  | { ok: false; status: number; error: string };

export type PanelQuestionResult =
  | { ok: true; id: string; question: PanelQuestionRow }
  | { ok: false; status: number; error: string };

export type PanelDeleteResult =
  | { ok: true; id: string; deleted: true }
  | { ok: false; status: number; error: string };

async function readJsonBody(p_response: Response): Promise<unknown> {
  try {
    return await p_response.json();
  } catch (p_error: unknown) {
    void p_error;
    return null;
  }
}

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object";
}

function readMockRole(p_value: unknown): PanelMockRole | null {
  if (
    p_value !== "Admin" &&
    p_value !== "Operator" &&
    p_value !== "Parent" &&
    p_value !== "Child"
  ) {
    return null;
  }
  return p_value;
}

function readKind(p_value: unknown): QuestionKind | null {
  if (p_value !== "Family-Quiz" && p_value !== "Say-What") {
    return null;
  }
  return p_value;
}

function readStatus(p_value: unknown): QuestionStatus | null {
  if (p_value !== "active" && p_value !== "inactive") {
    return null;
  }
  return p_value;
}

function readSessionBody(p_value: unknown): { role: PanelMockRole } | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const role: unknown = Reflect.get(p_value, "role");
  const parsedRole: PanelMockRole | null = readMockRole(role);
  if (parsedRole === null) {
    return null;
  }
  return { role: parsedRole };
}

function readMockRoleBody(p_value: unknown): { role: PanelMockRole } | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const role: unknown = Reflect.get(p_value, "role");
  const parsedRole: PanelMockRole | null = readMockRole(role);
  if (parsedRole === null) {
    return null;
  }
  return { role: parsedRole };
}

function readErrorBody(p_value: unknown): string {
  if (!isRecord(p_value)) {
    return "erro";
  }
  const error: unknown = Reflect.get(p_value, "error");
  if (typeof error !== "string" || error.length === 0) {
    return "erro";
  }
  return error;
}

function readQuestionRow(p_value: unknown): PanelQuestionRow | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const id: unknown = Reflect.get(p_value, "id");
  const questionText: unknown = Reflect.get(p_value, "question_text");
  const kind: QuestionKind | null = readKind(Reflect.get(p_value, "kind"));
  const status: QuestionStatus | null = readStatus(
    Reflect.get(p_value, "status"),
  );
  const weight: unknown = Reflect.get(p_value, "weight");
  const deleted: unknown = Reflect.get(p_value, "deleted");
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }
  if (typeof questionText !== "string") {
    return null;
  }
  if (kind === null) {
    return null;
  }
  if (status === null) {
    return null;
  }
  if (typeof weight !== "number" || !Number.isFinite(weight) || weight < 0) {
    return null;
  }
  if (typeof deleted !== "boolean") {
    return null;
  }
  return {
    id,
    question_text: questionText,
    kind,
    status,
    weight,
    deleted,
  };
}

function readQuestionsBody(
  p_value: unknown,
): { id: string; questions: PanelQuestionRow[] } | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const id: unknown = Reflect.get(p_value, "id");
  const questions: unknown = Reflect.get(p_value, "questions");
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }
  if (!Array.isArray(questions)) {
    return null;
  }
  const rows: PanelQuestionRow[] = [];
  const items: unknown[] = questions;
  for (let i: number = 0; i < items.length; i += 1) {
    const item: unknown = items[i];
    const row: PanelQuestionRow | null = readQuestionRow(item);
    if (row === null) {
      return null;
    }
    rows.push(row);
  }
  return { id, questions: rows };
}

function readQuestionBody(
  p_value: unknown,
): { id: string; question: PanelQuestionRow } | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const id: unknown = Reflect.get(p_value, "id");
  const question: unknown = Reflect.get(p_value, "question");
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }
  const row: PanelQuestionRow | null = readQuestionRow(question);
  if (row === null) {
    return null;
  }
  return { id, question: row };
}

function readDeleteBody(p_value: unknown): { id: string; deleted: true } | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const id: unknown = Reflect.get(p_value, "id");
  const question: unknown = Reflect.get(p_value, "question");
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }
  if (!isRecord(question)) {
    return null;
  }
  const deleted: unknown = Reflect.get(question, "deleted");
  if (deleted !== true) {
    return null;
  }
  return { id, deleted: true };
}

export class QuestionsFacade {
  private static _instance: QuestionsFacade | null = null;

  private constructor(
    private fetchFn: typeof fetch = globalThis.fetch.bind(globalThis),
  ) {}

  public static get instance(): QuestionsFacade {
    if (QuestionsFacade._instance === null) {
      QuestionsFacade._instance = new QuestionsFacade();
    }
    return QuestionsFacade._instance;
  }

  public async setRole(p_role: PanelMockRole): Promise<PanelSetRoleResult> {
    try {
      const response: Response = await this.fetchFn("/api/panel/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ role: p_role }),
      });
      const body: unknown = await readJsonBody(response);
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: readErrorBody(body),
        };
      }
      const parsed: { role: PanelMockRole } | null = readMockRoleBody(body);
      if (parsed === null) {
        return {
          ok: false,
          status: response.status,
          error: "invalid session",
        };
      }
      return { ok: true, role: parsed.role };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "session set failed" };
    }
  }

  public async loadSession(): Promise<PanelSessionResult> {
    try {
      const response: Response = await this.fetchFn("/api/panel/session", {
        cache: "no-store",
      });
      const body: unknown = await readJsonBody(response);
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: readErrorBody(body),
        };
      }
      const parsed: { role: PanelMockRole } | null = readSessionBody(body);
      if (parsed === null) {
        return {
          ok: false,
          status: response.status,
          error: "invalid session",
        };
      }
      return { ok: true, role: parsed.role };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "session load failed" };
    }
  }

  public async loadQuestions(
    p_strategy: KindFilterStrategy = new KindFilterStrategy(),
  ): Promise<PanelQuestionsResult> {
    try {
      const response: Response = await this.fetchFn(p_strategy.queryPath(), {
        cache: "no-store",
      });
      const body: unknown = await readJsonBody(response);
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: readErrorBody(body),
        };
      }
      const parsed: { id: string; questions: PanelQuestionRow[] } | null =
        readQuestionsBody(body);
      if (parsed === null) {
        return {
          ok: false,
          status: response.status,
          error: "invalid questions",
        };
      }
      return { ok: true, id: parsed.id, questions: parsed.questions };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "questions load failed" };
    }
  }

  public async createQuestion(
    p_draft: PanelQuestionDraft,
  ): Promise<PanelQuestionResult> {
    try {
      const response: Response = await this.fetchFn("/api/panel/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(p_draft),
      });
      const body: unknown = await readJsonBody(response);
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: readErrorBody(body),
        };
      }
      const parsed: { id: string; question: PanelQuestionRow } | null =
        readQuestionBody(body);
      if (parsed === null) {
        return {
          ok: false,
          status: response.status,
          error: "invalid question",
        };
      }
      return { ok: true, id: parsed.id, question: parsed.question };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "question create failed" };
    }
  }

  public async updateQuestion(
    p_id: string,
    p_patch: PanelQuestionPatch,
  ): Promise<PanelQuestionResult> {
    try {
      const response: Response = await this.fetchFn(
        `/api/panel/questions/${encodeURIComponent(p_id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify(p_patch),
        },
      );
      const body: unknown = await readJsonBody(response);
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: readErrorBody(body),
        };
      }
      const parsed: { id: string; question: PanelQuestionRow } | null =
        readQuestionBody(body);
      if (parsed === null) {
        return {
          ok: false,
          status: response.status,
          error: "invalid question",
        };
      }
      return { ok: true, id: parsed.id, question: parsed.question };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "question update failed" };
    }
  }

  public async deleteQuestion(p_id: string): Promise<PanelDeleteResult> {
    try {
      const response: Response = await this.fetchFn(
        `/api/panel/questions/${encodeURIComponent(p_id)}`,
        {
          method: "DELETE",
          cache: "no-store",
        },
      );
      const body: unknown = await readJsonBody(response);
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: readErrorBody(body),
        };
      }
      const parsed: { id: string; deleted: true } | null = readDeleteBody(body);
      if (parsed === null) {
        return {
          ok: false,
          status: response.status,
          error: "invalid delete",
        };
      }
      return { ok: true, id: parsed.id, deleted: true };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "question delete failed" };
    }
  }
}
