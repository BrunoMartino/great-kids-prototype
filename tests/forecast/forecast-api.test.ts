import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

const WATCH_ID: string = "f43929c0-ec67-51da-aeb9-9e461f57f364";
const RAIN_ID: string = "26533182-4f8b-58e3-83ef-3e551d134baf";
const UNKNOWN_CONTEXT_ID: string = "00000000-0000-4000-8000-000000000099";

type ContextsEnvelope = {
  id: string;
  contexts: Array<{ id: string; slug: string; name: string }>;
};

type ContextSetBody = {
  id: string;
  context_ids: string[];
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

describe("GET /api/forecast-contexts and PUT mission context set", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns the four seeded contexts in an envelope for Operator", async () => {
    // Break: not 200 or missing rain/holiday/christmas/back-to-school.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Operator";
    const { GET } = await import("@/app/api/forecast-contexts/route");
    const response: Response = await GET(jsonRequest("/api/forecast-contexts", "GET"));
    const body: ContextsEnvelope = (await response.json()) as ContextsEnvelope;
    expect(response.status).toBe(200);
    expect(typeof body.id).toBe("string");
    expect(body.contexts).toHaveLength(4);
    expect(body.contexts.map((p_row) => p_row.slug).sort()).toEqual(
      ["back-to-school", "christmas", "holiday", "rain"].sort(),
    );
  });

  it("rejects Parent GET with 403", async () => {
    // Break: Parent lists forecast contexts (200).
    const { GET } = await import("@/app/api/forecast-contexts/route");
    const response: Response = await GET(jsonRequest("/api/forecast-contexts", "GET"));
    expect(response.status).toBe(403);
  });

  it("PUTs a rain tag on a draft mission for Admin", async () => {
    // Break: unpublished tag rejected, or envelope context_ids drift.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { POST } = await import("@/app/api/missions/route");
    const createdResponse: Response = await POST(
      jsonRequest("/api/missions", "POST", {
        category_id: WATCH_ID,
        title: "Paper boats",
      }),
    );
    const created: { mission: { id: string } } = (await createdResponse.json()) as {
      mission: { id: string };
    };
    const { PUT } = await import("@/app/api/forecast-contexts/missions/[id]/route");
    const response: Response = await PUT(
      jsonRequest(
        `/api/forecast-contexts/missions/${created.mission.id}`,
        "PUT",
        { id: created.mission.id, context_ids: [RAIN_ID] },
      ),
      idParams(created.mission.id),
    );
    const body: ContextSetBody = (await response.json()) as ContextSetBody;
    expect(response.status).toBe(200);
    expect(body.id).toBe(created.mission.id);
    expect(body.context_ids).toEqual([RAIN_ID]);
  });

  it("rejects unknown and duplicate context_ids", async () => {
    // Break: unknown uuid stored or duplicate pair accepted.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { POST } = await import("@/app/api/missions/route");
    const createdResponse: Response = await POST(
      jsonRequest("/api/missions", "POST", {
        category_id: WATCH_ID,
        title: "Paper boats",
      }),
    );
    const created: { mission: { id: string } } = (await createdResponse.json()) as {
      mission: { id: string };
    };
    const { PUT } = await import("@/app/api/forecast-contexts/missions/[id]/route");
    const unknownResponse: Response = await PUT(
      jsonRequest(
        `/api/forecast-contexts/missions/${created.mission.id}`,
        "PUT",
        { id: created.mission.id, context_ids: [UNKNOWN_CONTEXT_ID] },
      ),
      idParams(created.mission.id),
    );
    expect(unknownResponse.status).toBe(400);
    const duplicateResponse: Response = await PUT(
      jsonRequest(
        `/api/forecast-contexts/missions/${created.mission.id}`,
        "PUT",
        { id: created.mission.id, context_ids: [RAIN_ID, RAIN_ID] },
      ),
      idParams(created.mission.id),
    );
    expect(duplicateResponse.status).toBe(409);
  });
});
