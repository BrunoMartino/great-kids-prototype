import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type SessionBody = {
  role: string;
  presentation: string;
};

type CountRow = {
  n: number;
};

function jsonRequest(p_path: string, p_method: string, p_body: unknown): Request {
  return new Request(`http://localhost${p_path}`, {
    method: p_method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(p_body),
  });
}

describe("GET /api/session and POST /api/session/context", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("GET default session is Parent", async () => {
    // Break: missing handler or role not Parent
    const { GET } = await import("@/app/api/session/route");
    const response: Response = await GET(new Request("http://localhost/api/session"));
    const body: SessionBody = (await response.json()) as SessionBody;
    expect(response.status).toBe(200);
    expect(body.role).toBe("Parent");
    expect(body.presentation).toBe("parent");
  });

  it("POST Child returns child presentation", async () => {
    // Break: 200 with Parent or no persist
    const { POST } = await import("@/app/api/session/context/route");
    const { GET } = await import("@/app/api/session/route");
    const { getConnection, queryRaw } = await import("@/internal/db/connection");
    const postResponse: Response = await POST(
      jsonRequest("/api/session/context", "POST", { role: "Child" }),
    );
    const postBody: SessionBody = (await postResponse.json()) as SessionBody;
    expect(postResponse.status).toBe(200);
    expect(postBody.role).toBe("Child");
    expect(postBody.presentation).toBe("child");
    const getResponse: Response = await GET(new Request("http://localhost/api/session"));
    const getBody: SessionBody = (await getResponse.json()) as SessionBody;
    expect(getResponse.status).toBe(200);
    expect(getBody.role).toBe("Child");
    expect(getBody.presentation).toBe("child");
    getConnection();
    const rows: CountRow[] = queryRaw<CountRow>("SELECT count(*) AS n FROM app_user", []);
    expect(rows[0].n).toBe(0);
  });

  it("POST Parent restores parent presentation", async () => {
    // Break: cannot leave Child view
    const { POST } = await import("@/app/api/session/context/route");
    await POST(jsonRequest("/api/session/context", "POST", { role: "Child" }));
    const response: Response = await POST(
      jsonRequest("/api/session/context", "POST", { role: "Parent" }),
    );
    const body: SessionBody = (await response.json()) as SessionBody;
    expect(response.status).toBe(200);
    expect(body.role).toBe("Parent");
    expect(body.presentation).toBe("parent");
  });

  it("POST invalid role is 400", async () => {
    // Break: invalid stored as 200
    const { POST } = await import("@/app/api/session/context/route");
    const response: Response = await POST(
      jsonRequest("/api/session/context", "POST", { role: "Operator" }),
    );
    expect(response.status).toBe(400);
  });

  it("GET is 401 when session cleared", async () => {
    // Break: missing session still 200 Parent
    const { GET, DELETE } = await import("@/app/api/session/route");
    await DELETE(new Request("http://localhost/api/session", { method: "DELETE" }));
    const response: Response = await GET(new Request("http://localhost/api/session"));
    expect(response.status).toBe(401);
  });
});
