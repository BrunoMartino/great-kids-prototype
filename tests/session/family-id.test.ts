import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

const DEMO_FAMILY_ID: string = "c10a0003-3333-4333-8333-000000000010";

describe("getMockSession familyId", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("defaults familyId to the seeded demo family and keeps Parent", async () => {
    // Break: familyId missing, empty, or role no longer Parent.
    const { getMockSession } = await import("@/internal/db/mock-session");
    const session = getMockSession();
    expect(session.role).toBe("Parent");
    expect(session.familyId).toBe(DEMO_FAMILY_ID);
  });

  it("keeps familyId when panel switches Admin", async () => {
    // Break: POST /api/panel/session clears familyId.
    const { getMockSession } = await import("@/internal/db/mock-session");
    const { POST } = await import("@/app/api/panel/session/route");
    const response: Response = await POST(
      new Request("http://localhost/api/panel/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: "Admin" }),
      }),
    );
    expect(response.status).toBe(200);
    expect(getMockSession().role).toBe("Admin");
    expect(getMockSession().familyId).toBe(DEMO_FAMILY_ID);
  });
});
