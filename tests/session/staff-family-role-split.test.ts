import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type SessionBody = {
  role: string;
  presentation?: string;
};

function jsonRequest(p_path: string, p_method: string, p_body?: unknown): Request {
  const init: RequestInit = { method: p_method, headers: {} };
  if (p_body !== undefined) {
    (init.headers as Record<string, string>)["content-type"] = "application/json";
    init.body = JSON.stringify(p_body);
  }
  return new Request(`http://localhost${p_path}`, init);
}

describe("staffRole and familyRole stay independent", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("keeps familyRole Parent after panel Admin while family calendar GET succeeds", async () => {
    const { getFamilyRole, getStaffRole, getMockSession } = await import(
      "@/internal/db/mock-session"
    );
    expect(getFamilyRole()).toBe("Parent");
    expect(getStaffRole()).toBeNull();

    const { POST: postPanel } = await import("@/app/api/panel/session/route");
    const panelResponse: Response = await postPanel(
      jsonRequest("/api/panel/session", "POST", { role: "Admin" }),
    );
    expect(panelResponse.status).toBe(200);
    expect(getStaffRole()).toBe("Admin");
    expect(getFamilyRole()).toBe("Parent");
    expect(getMockSession().role).toBe("Admin");

    const { arrangeCalendarFamily, calendarRouteParams } = await import(
      "../calendar/helpers"
    );
    const arranged = await arrangeCalendarFamily();
    expect(getFamilyRole()).toBe("Parent");
    expect(getStaffRole()).toBe("Admin");
    const { GET: getDay } = await import(
      "@/app/api/families/[id]/calendar/[day]/route"
    );
    const dayResponse: Response = await getDay(
      jsonRequest(
        `/api/families/${arranged.familyId}/calendar/2026-10-20`,
        "GET",
      ),
      calendarRouteParams(arranged.familyId, "2026-10-20"),
    );
    expect(dayResponse.status).toBe(200);
  });

  it("rejects Parent and Child on panel session POST", async () => {
    const { POST } = await import("@/app/api/panel/session/route");
    const { getStaffRole } = await import("@/internal/db/mock-session");
    const parentResponse: Response = await POST(
      jsonRequest("/api/panel/session", "POST", { role: "Parent" }),
    );
    expect(parentResponse.status).toBe(400);
    expect(getStaffRole()).toBeNull();
    const childResponse: Response = await POST(
      jsonRequest("/api/panel/session", "POST", { role: "Child" }),
    );
    expect(childResponse.status).toBe(400);
    expect(getStaffRole()).toBeNull();
  });

  it("applyRole updates familyRole even while staffRole stays Admin", async () => {
    const { setStaffRole, getFamilyRole, getStaffRole, getMockSession } =
      await import("@/internal/db/mock-session");
    setStaffRole("Admin");
    const { POST } = await import("@/app/api/session/context/route");
    const response: Response = await POST(
      jsonRequest("/api/session/context", "POST", { role: "Child" }),
    );
    const body: SessionBody = (await response.json()) as SessionBody;
    expect(response.status).toBe(200);
    expect(body.role).toBe("Child");
    expect(getFamilyRole()).toBe("Child");
    expect(getStaffRole()).toBe("Admin");
    expect(getMockSession().role).toBe("Admin");
  });

  it("panel session GET is 403 when staffRole is null", async () => {
    const { GET } = await import("@/app/api/panel/session/route");
    const response: Response = await GET(jsonRequest("/api/panel/session", "GET"));
    expect(response.status).toBe(403);
  });
});
