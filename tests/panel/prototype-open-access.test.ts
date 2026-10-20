import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

function jsonRequest(p_path: string, p_method: string): Request {
  return new Request(`http://localhost${p_path}`, { method: p_method });
}

describe("prototype open panel access", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("lets Parent read panel session, catalog, questions, and indicators", async () => {
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
    const { GET: getSession } = await import("@/app/api/panel/session/route");
    const sessionResponse: Response = await getSession(
      jsonRequest("/api/panel/session", "GET"),
    );
    expect(sessionResponse.status).toBe(200);
    const { GET: getCatalog } = await import("@/app/api/panel/catalog/route");
    const catalogResponse: Response = await getCatalog(
      jsonRequest("/api/panel/catalog", "GET"),
    );
    expect(catalogResponse.status).toBe(200);
    const { GET: getQuestions } = await import("@/app/api/panel/questions/route");
    const questionsResponse: Response = await getQuestions(
      jsonRequest("/api/panel/questions", "GET"),
    );
    expect(questionsResponse.status).toBe(200);
    const { GET: getIndicators } = await import("@/app/api/panel/indicators/route");
    const indicatorsResponse: Response = await getIndicators(
      jsonRequest("/api/panel/indicators", "GET"),
    );
    expect(indicatorsResponse.status).toBe(200);
  });

  it("does not deny Parent or Child in panel staff policies", async () => {
    const { PanelPolicy } = await import("@/app/api/panel/panel-policy");
    const { StaffPolicy } = await import("@/app/api/missions/staff-policy");
    const { SupportPolicy } = await import(
      "@/app/api/panel/families/support-policy"
    );
    expect(() => {
      PanelPolicy.assertStaff("Parent");
    }).not.toThrow();
    expect(() => {
      StaffPolicy.assertStaff("Child");
    }).not.toThrow();
    expect(() => {
      SupportPolicy.assertPanel("Parent");
    }).not.toThrow();
  });
});
