import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type QuestionBody = {
  id: string;
  question_text: string;
  kind: string;
  status: string;
  weight: number;
  deleted: boolean;
};

type QuestionsEnvelope = {
  id: string;
  questions: QuestionBody[];
};

type QuestionEnvelope = {
  id: string;
  question: QuestionBody;
};

type DeletedEnvelope = {
  id: string;
  question: { deleted: boolean };
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

function jsonRequest(p_path: string, p_method: string, p_body?: unknown): Request {
  const init: RequestInit = { method: p_method, headers: {} };
  if (p_body !== undefined) {
    (init.headers as Record<string, string>)["content-type"] = "application/json";
    init.body = JSON.stringify(p_body);
  }
  return new Request(`http://localhost${p_path}`, init);
}

function idParams(p_id: string): RouteContext {
  return { params: Promise.resolve({ id: p_id }) };
}

describe("GET/POST/PATCH/DELETE /api/panel/questions", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("lets Admin create and list a Family-Quiz question", async () => {
    // Break: missing handler, envelope, or created row omitted.
    const { POST: postSession } = await import("@/app/api/panel/session/route");
    await postSession(jsonRequest("/api/panel/session", "POST", { role: "Admin" }));
    const { POST } = await import("@/app/api/panel/questions/route");
    const createdResponse: Response = await POST(
      jsonRequest("/api/panel/questions", "POST", {
        question_text: "What is our weekend ritual?",
        kind: "Family-Quiz",
        weight: 1,
        status: "active",
      }),
    );
    const created: QuestionEnvelope = (await createdResponse.json()) as QuestionEnvelope;
    expect(createdResponse.status).toBe(201);
    expect(typeof created.id).toBe("string");
    expect(created.question.question_text).toBe("What is our weekend ritual?");
    expect(created.question.kind).toBe("Family-Quiz");
    expect(created.question.deleted).toBe(false);
    const { GET } = await import("@/app/api/panel/questions/route");
    const listResponse: Response = await GET(jsonRequest("/api/panel/questions", "GET"));
    const list: QuestionsEnvelope = (await listResponse.json()) as QuestionsEnvelope;
    expect(listResponse.status).toBe(200);
    expect(typeof list.id).toBe("string");
    const found: QuestionBody | undefined = list.questions.find(
      (p_row) => p_row.id === created.question.id,
    );
    expect(found).toBeDefined();
    expect(found?.kind).toBe("Family-Quiz");
  });

  it("filters by kind, reads one, patches text, and soft-deletes", async () => {
    // Break: kind filter mixes kinds, GET id missing, PATCH no-op, or hard delete.
    const { POST: postSession } = await import("@/app/api/panel/session/route");
    await postSession(jsonRequest("/api/panel/session", "POST", { role: "Operator" }));
    const { POST, GET } = await import("@/app/api/panel/questions/route");
    const family: QuestionEnvelope = (await (
      await POST(
        jsonRequest("/api/panel/questions", "POST", {
          question_text: "Family prompt",
          kind: "Family-Quiz",
          weight: 1,
          status: "active",
        }),
      )
    ).json()) as QuestionEnvelope;
    const sayWhat: QuestionEnvelope = (await (
      await POST(
        jsonRequest("/api/panel/questions", "POST", {
          question_text: "Say what prompt",
          kind: "Say-What",
          weight: 2,
          status: "active",
        }),
      )
    ).json()) as QuestionEnvelope;
    const filteredResponse: Response = await GET(
      jsonRequest("/api/panel/questions?kind=Family-Quiz", "GET"),
    );
    const filtered: QuestionsEnvelope = (await filteredResponse.json()) as QuestionsEnvelope;
    expect(filteredResponse.status).toBe(200);
    expect(filtered.questions.map((p_row) => p_row.id)).toEqual([family.question.id]);
    const { GET: getOne, PATCH, DELETE } = await import(
      "@/app/api/panel/questions/[id]/route"
    );
    const oneResponse: Response = await getOne(
      jsonRequest(`/api/panel/questions/${sayWhat.question.id}`, "GET"),
      idParams(sayWhat.question.id),
    );
    const one: QuestionEnvelope = (await oneResponse.json()) as QuestionEnvelope;
    expect(oneResponse.status).toBe(200);
    expect(one.question.id).toBe(sayWhat.question.id);
    expect(one.question.kind).toBe("Say-What");
    const patchedResponse: Response = await PATCH(
      jsonRequest(`/api/panel/questions/${family.question.id}`, "PATCH", {
        question_text: "Updated family prompt",
        weight: 3,
      }),
      idParams(family.question.id),
    );
    const patched: QuestionEnvelope = (await patchedResponse.json()) as QuestionEnvelope;
    expect(patchedResponse.status).toBe(200);
    expect(patched.question.question_text).toBe("Updated family prompt");
    expect(patched.question.weight).toBe(3);
    const deleteResponse: Response = await DELETE(
      jsonRequest(`/api/panel/questions/${family.question.id}`, "DELETE"),
      idParams(family.question.id),
    );
    const deleted: DeletedEnvelope = (await deleteResponse.json()) as DeletedEnvelope;
    expect(deleteResponse.status).toBe(200);
    expect(deleted.question.deleted).toBe(true);
  });

  it("rejects empty question_text and invalid kind with 400", async () => {
    // Break: empty text or Trivia kind stored as 201.
    const { POST: postSession } = await import("@/app/api/panel/session/route");
    await postSession(jsonRequest("/api/panel/session", "POST", { role: "Admin" }));
    const { POST } = await import("@/app/api/panel/questions/route");
    const emptyResponse: Response = await POST(
      jsonRequest("/api/panel/questions", "POST", {
        question_text: "",
        kind: "Family-Quiz",
        weight: 1,
        status: "active",
      }),
    );
    expect(emptyResponse.status).toBe(400);
    const kindResponse: Response = await POST(
      jsonRequest("/api/panel/questions", "POST", {
        question_text: "Bad kind",
        kind: "Trivia",
        weight: 1,
        status: "active",
      }),
    );
    expect(kindResponse.status).toBe(400);
  });

  it("rejects Parent CRUD on the bank with 403", async () => {
    // Break: Parent POST/GET/PATCH/DELETE is 200/201.
    const { POST } = await import("@/app/api/panel/questions/route");
    const createResponse: Response = await POST(
      jsonRequest("/api/panel/questions", "POST", {
        question_text: "Parent should not write",
        kind: "Family-Quiz",
        weight: 1,
        status: "active",
      }),
    );
    expect(createResponse.status).toBe(403);
    const { GET } = await import("@/app/api/panel/questions/route");
    const listResponse: Response = await GET(jsonRequest("/api/panel/questions", "GET"));
    expect(listResponse.status).toBe(403);
    const unknownId: string = "00000000-0000-4000-8000-000000000042";
    const { GET: getOne, PATCH, DELETE } = await import(
      "@/app/api/panel/questions/[id]/route"
    );
    const oneResponse: Response = await getOne(
      jsonRequest(`/api/panel/questions/${unknownId}`, "GET"),
      idParams(unknownId),
    );
    expect(oneResponse.status).toBe(403);
    const patchResponse: Response = await PATCH(
      jsonRequest(`/api/panel/questions/${unknownId}`, "PATCH", {
        question_text: "Nope",
      }),
      idParams(unknownId),
    );
    expect(patchResponse.status).toBe(403);
    const deleteResponse: Response = await DELETE(
      jsonRequest(`/api/panel/questions/${unknownId}`, "DELETE"),
      idParams(unknownId),
    );
    expect(deleteResponse.status).toBe(403);
  });
});
