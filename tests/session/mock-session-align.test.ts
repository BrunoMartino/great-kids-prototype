import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type SessionBody = {
  role: string;
  presentation: string;
};

function jsonRequest(p_path: string, p_method: string, p_body: unknown): Request {
  return new Request(`http://localhost${p_path}`, {
    method: p_method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(p_body),
  });
}

describe("applyRole aligns mock session Parent/Child", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("sets mock session Child when presentation switches to Child", async () => {
    // Break: POST Child leaves getMockSession().role as Parent.
    const { POST } = await import("@/app/api/session/context/route");
    const { getMockSession } = await import("@/internal/db/mock-session");
    const response: Response = await POST(
      jsonRequest("/api/session/context", "POST", { role: "Child" }),
    );
    const body: SessionBody = (await response.json()) as SessionBody;
    expect(response.status).toBe(200);
    expect(body.role).toBe("Child");
    expect(getMockSession().role).toBe("Child");
  });

  it("restores mock session Parent after Child then Parent", async () => {
    // Break: leaving Child view leaves mock session Child.
    const { POST } = await import("@/app/api/session/context/route");
    const { getMockSession } = await import("@/internal/db/mock-session");
    await POST(jsonRequest("/api/session/context", "POST", { role: "Child" }));
    const response: Response = await POST(
      jsonRequest("/api/session/context", "POST", { role: "Parent" }),
    );
    expect(response.status).toBe(200);
    expect(getMockSession().role).toBe("Parent");
  });

  it("leaves mock session Parent when the role is invalid", async () => {
    // Break: invalid POST mutates mock session away from Parent.
    const { POST } = await import("@/app/api/session/context/route");
    const { getMockSession } = await import("@/internal/db/mock-session");
    const response: Response = await POST(
      jsonRequest("/api/session/context", "POST", { role: "Operator" }),
    );
    expect(response.status).toBe(400);
    expect(getMockSession().role).toBe("Parent");
  });

  it("does not overwrite Admin mock when presentation switches to Child", async () => {
    // Break: family context-switch replaces panel Admin on getMockSession().
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { POST } = await import("@/app/api/session/context/route");
    const response: Response = await POST(
      jsonRequest("/api/session/context", "POST", { role: "Child" }),
    );
    expect(response.status).toBe(200);
    expect(getMockSession().role).toBe("Admin");
  });
});
