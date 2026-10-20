import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

const WATCH_ID: string = "f43929c0-ec67-51da-aeb9-9e461f57f364";

type SessionBody = {
  role: string;
};

type CatalogEnvelope = {
  id: string;
  missions: Array<{ id: string; review_status: string }>;
};

function jsonRequest(p_path: string, p_method: string, p_body?: unknown): Request {
  const init: RequestInit = { method: p_method, headers: {} };
  if (p_body !== undefined) {
    (init.headers as Record<string, string>)["content-type"] = "application/json";
    init.body = JSON.stringify(p_body);
  }
  return new Request(`http://localhost${p_path}`, init);
}

describe("GET /api/panel/session and /api/panel/catalog", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns Admin role for an Admin mock", async () => {
    // Break: missing handler or role not Admin.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { GET } = await import("@/app/api/panel/session/route");
    const response: Response = await GET(jsonRequest("/api/panel/session", "GET"));
    const body: SessionBody = (await response.json()) as SessionBody;
    expect(response.status).toBe(200);
    expect(body.role).toBe("Admin");
  });

  it("returns Operator role for an Operator mock", async () => {
    // Break: Operator session is not 200 Operator.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Operator";
    const { GET } = await import("@/app/api/panel/session/route");
    const response: Response = await GET(jsonRequest("/api/panel/session", "GET"));
    const body: SessionBody = (await response.json()) as SessionBody;
    expect(response.status).toBe(200);
    expect(body.role).toBe("Operator");
  });

  it("rejects Parent on session and catalog with 403", async () => {
    // Break: Parent reads panel session or catalog (200).
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
    const { GET: getSession } = await import("@/app/api/panel/session/route");
    const sessionResponse: Response = await getSession(
      jsonRequest("/api/panel/session", "GET"),
    );
    expect(sessionResponse.status).toBe(403);
    const { GET: getCatalog } = await import("@/app/api/panel/catalog/route");
    const catalogResponse: Response = await getCatalog(
      jsonRequest("/api/panel/catalog", "GET"),
    );
    expect(catalogResponse.status).toBe(403);
  });

  it("lists staff catalog drafts for Admin including unpublished", async () => {
    // Break: Admin catalog omits drafts or is not the missions envelope.
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
    const { GET } = await import("@/app/api/panel/catalog/route");
    const response: Response = await GET(jsonRequest("/api/panel/catalog", "GET"));
    const body: CatalogEnvelope = (await response.json()) as CatalogEnvelope;
    expect(response.status).toBe(200);
    expect(typeof body.id).toBe("string");
    const found = body.missions.find((p_row) => p_row.id === created.mission.id);
    expect(found).toBeDefined();
    expect(found?.review_status).toBe("draft");
  });
});
