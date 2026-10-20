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

describe("POST /api/panel/session mock role switch", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("switches default Parent to Admin without a password and opens catalog", async () => {
    // Break: no POST, password required, or catalog still 403 after Admin.
    const { getMockSession } = await import("@/internal/db/mock-session");
    expect(getMockSession().role).toBe("Parent");
    const { POST } = await import("@/app/api/panel/session/route");
    const postResponse: Response = await POST(
      jsonRequest("/api/panel/session", "POST", { role: "Admin" }),
    );
    const postBody: SessionBody = (await postResponse.json()) as SessionBody;
    expect(postResponse.status).toBe(200);
    expect(postBody.role).toBe("Admin");
    expect(getMockSession().role).toBe("Admin");
    const { GET: getSession } = await import("@/app/api/panel/session/route");
    const sessionResponse: Response = await getSession(
      jsonRequest("/api/panel/session", "GET"),
    );
    const sessionBody: SessionBody = (await sessionResponse.json()) as SessionBody;
    expect(sessionResponse.status).toBe(200);
    expect(sessionBody.role).toBe("Admin");
    const { POST: postMission } = await import("@/app/api/missions/route");
    const createdResponse: Response = await postMission(
      jsonRequest("/api/missions", "POST", {
        category_id: WATCH_ID,
        title: "Paper boats",
      }),
    );
    const created: { mission: { id: string } } = (await createdResponse.json()) as {
      mission: { id: string };
    };
    const { GET: getCatalog } = await import("@/app/api/panel/catalog/route");
    const catalogResponse: Response = await getCatalog(
      jsonRequest("/api/panel/catalog", "GET"),
    );
    const catalog: CatalogEnvelope = (await catalogResponse.json()) as CatalogEnvelope;
    expect(catalogResponse.status).toBe(200);
    expect(catalog.missions.find((p_row) => p_row.id === created.mission.id)).toBeDefined();
  });

  it("accepts Operator, Parent, and Child as mock roles", async () => {
    // Break: only Admin is writable, or Parent/Child stay forbidden to set.
    const { POST } = await import("@/app/api/panel/session/route");
    const { getMockSession } = await import("@/internal/db/mock-session");
    const operatorResponse: Response = await POST(
      jsonRequest("/api/panel/session", "POST", { role: "Operator" }),
    );
    const operatorBody: SessionBody = (await operatorResponse.json()) as SessionBody;
    expect(operatorResponse.status).toBe(200);
    expect(operatorBody.role).toBe("Operator");
    expect(getMockSession().role).toBe("Operator");
    const parentResponse: Response = await POST(
      jsonRequest("/api/panel/session", "POST", { role: "Parent" }),
    );
    expect(parentResponse.status).toBe(200);
    expect(getMockSession().role).toBe("Parent");
    const childResponse: Response = await POST(
      jsonRequest("/api/panel/session", "POST", { role: "Child" }),
    );
    expect(childResponse.status).toBe(200);
    expect(getMockSession().role).toBe("Child");
  });

  it("rejects missing and unknown roles with 400", async () => {
    // Break: empty or unknown role stored as 200.
    const { POST } = await import("@/app/api/panel/session/route");
    const { getMockSession } = await import("@/internal/db/mock-session");
    const missing: Response = await POST(jsonRequest("/api/panel/session", "POST", {}));
    expect(missing.status).toBe(400);
    expect(getMockSession().role).toBe("Parent");
    const unknown: Response = await POST(
      jsonRequest("/api/panel/session", "POST", { role: "Superuser" }),
    );
    expect(unknown.status).toBe(400);
    expect(getMockSession().role).toBe("Parent");
  });

  it("ignores a password field and does not let family context overwrite Admin", async () => {
    // Break: password required, or applyRole overwrites HTTP-set Admin.
    const { POST } = await import("@/app/api/panel/session/route");
    const { getMockSession } = await import("@/internal/db/mock-session");
    const switchResponse: Response = await POST(
      jsonRequest("/api/panel/session", "POST", { role: "Admin", password: "secret" }),
    );
    expect(switchResponse.status).toBe(200);
    expect(getMockSession().role).toBe("Admin");
    const { POST: postContext } = await import("@/app/api/session/context/route");
    const familyResponse: Response = await postContext(
      jsonRequest("/api/session/context", "POST", { role: "Child" }),
    );
    expect(familyResponse.status).toBe(200);
    expect(getMockSession().role).toBe("Admin");
  });
});
