import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

const WATCH_ID: string = "f43929c0-ec67-51da-aeb9-9e461f57f364";
const READ_ID: string = "5f9e8bba-8e25-5ad2-8ee9-8e9df3473ca1";

type MissionCreated = {
  id: string;
  mission: {
    id: string;
    category_id: string;
    review_status: string;
  };
};

type MissionsEnvelope = {
  id: string;
  missions: Array<{
    id: string;
    title: string;
    category_id: string;
    review_status: string;
  }>;
};

function jsonRequest(p_path: string, p_method: string, p_body: unknown): Request {
  return new Request(`http://localhost${p_path}`, {
    method: p_method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(p_body),
  });
}

describe("GET/POST /api/missions", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("creates a draft mission for Admin", async () => {
    // Break: 403 for Admin or review_status not draft.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { POST } = await import("@/app/api/missions/route");
    const response: Response = await POST(
      jsonRequest("/api/missions", "POST", {
        category_id: WATCH_ID,
        title: "Paper boats",
      }),
    );
    const body: MissionCreated = (await response.json()) as MissionCreated;
    expect(response.status).toBe(201);
    expect(body.mission.category_id).toBe(WATCH_ID);
    expect(body.mission.review_status).toBe("draft");
    expect(typeof body.id).toBe("string");
  });

  it("rejects Parent POST with 403", async () => {
    // Break: Parent creates catalog row (201). INV-001.
    const { POST } = await import("@/app/api/missions/route");
    const response: Response = await POST(
      jsonRequest("/api/missions", "POST", {
        category_id: WATCH_ID,
        title: "Sneaky",
      }),
    );
    expect(response.status).toBe(403);
  });

  it("lists staff missions including drafts in an envelope", async () => {
    // Break: envelope missing or drafts hidden from staff.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { POST, GET } = await import("@/app/api/missions/route");
    await POST(
      jsonRequest("/api/missions", "POST", {
        category_id: WATCH_ID,
        title: "Paper boats",
      }),
    );
    const response: Response = await GET(new Request("http://localhost/api/missions"));
    const body: MissionsEnvelope = (await response.json()) as MissionsEnvelope;
    expect(response.status).toBe(200);
    expect(typeof body.id).toBe("string");
    expect(body.missions.some((item) => item.title === "Paper boats")).toBe(true);
    expect(body.missions.find((item) => item.title === "Paper boats")?.review_status).toBe(
      "draft",
    );
  });

  it("filters GET by category_id", async () => {
    // Break: filter ignored.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { POST, GET } = await import("@/app/api/missions/route");
    await POST(
      jsonRequest("/api/missions", "POST", {
        category_id: WATCH_ID,
        title: "Paper boats",
      }),
    );
    await POST(
      jsonRequest("/api/missions", "POST", {
        category_id: READ_ID,
        title: "Bedtime story",
      }),
    );
    const response: Response = await GET(
      new Request(`http://localhost/api/missions?category_id=${WATCH_ID}`),
    );
    const body: MissionsEnvelope = (await response.json()) as MissionsEnvelope;
    expect(response.status).toBe(200);
    expect(body.missions).toHaveLength(1);
    expect(body.missions[0].title).toBe("Paper boats");
    expect(body.missions[0].category_id).toBe(WATCH_ID);
  });

  it("rejects Parent GET with 403", async () => {
    // Break: Parent lists drafts.
    const { GET } = await import("@/app/api/missions/route");
    const response: Response = await GET(new Request("http://localhost/api/missions"));
    expect(response.status).toBe(403);
  });

  it("returns an empty missions envelope for Admin", async () => {
    // Break: missing envelope or non-empty default rows.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { GET } = await import("@/app/api/missions/route");
    const response: Response = await GET(new Request("http://localhost/api/missions"));
    const body: MissionsEnvelope = (await response.json()) as MissionsEnvelope;
    expect(response.status).toBe(200);
    expect(typeof body.id).toBe("string");
    expect(body.missions).toEqual([]);
  });
});
