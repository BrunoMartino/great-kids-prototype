import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

const WATCH_ID: string = "f43929c0-ec67-51da-aeb9-9e461f57f364";
const UNKNOWN_ID: string = "00000000-0000-4000-8000-000000000404";

type MissionCreated = {
  id: string;
  mission: {
    id: string;
    category_id: string;
    review_status: string;
  };
};

type ReviewEnvelope = {
  id: string;
  mission: {
    id: string;
    review_status: string;
  };
};

type ReviewRow = {
  review_status: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

function jsonRequest(p_path: string, p_method: string, p_body: unknown): Request {
  return new Request(`http://localhost${p_path}`, {
    method: p_method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(p_body),
  });
}

function idParams(p_id: string): RouteContext {
  return { params: Promise.resolve({ id: p_id }) };
}

async function createPaperBoatsDraft(): Promise<string> {
  const { getMockSession } = await import("@/internal/db/mock-session");
  getMockSession().role = "Admin";
  const { POST } = await import("@/app/api/missions/route");
  const createdResponse: Response = await POST(
    jsonRequest("/api/missions", "POST", {
      category_id: WATCH_ID,
      title: "Paper boats",
    }),
  );
  const created: MissionCreated = (await createdResponse.json()) as MissionCreated;
  return created.mission.id;
}

describe("POST /api/missions/[id]/review", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("moves a draft through in_review then published for Admin", async () => {
    // Break: staff review POST missing or skips in_review.
    const missionId: string = await createPaperBoatsDraft();
    const { POST } = await import("@/app/api/missions/[id]/review/route");
    const inReviewResponse: Response = await POST(
      jsonRequest(`/api/missions/${missionId}/review`, "POST", {
        review_status: "in_review",
      }),
      idParams(missionId),
    );
    const inReviewBody: ReviewEnvelope = (await inReviewResponse.json()) as ReviewEnvelope;
    expect(inReviewResponse.status).toBe(200);
    expect(typeof inReviewBody.id).toBe("string");
    expect(inReviewBody.mission.id).toBe(missionId);
    expect(inReviewBody.mission.review_status).toBe("in_review");

    const publishedResponse: Response = await POST(
      jsonRequest(`/api/missions/${missionId}/review`, "POST", {
        review_status: "published",
      }),
      idParams(missionId),
    );
    const publishedBody: ReviewEnvelope = (await publishedResponse.json()) as ReviewEnvelope;
    expect(publishedResponse.status).toBe(200);
    expect(publishedBody.mission.id).toBe(missionId);
    expect(publishedBody.mission.review_status).toBe("published");
  });

  it("returns 404 for an unknown mission id", async () => {
    // Break: unknown review id returns 200.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { POST } = await import("@/app/api/missions/[id]/review/route");
    const response: Response = await POST(
      jsonRequest(`/api/missions/${UNKNOWN_ID}/review`, "POST", {
        review_status: "in_review",
      }),
      idParams(UNKNOWN_ID),
    );
    expect(response.status).toBe(404);
  });

  it("rejects Admin skip from draft to published and leaves draft", async () => {
    // Break: illegal skip persists published.
    const missionId: string = await createPaperBoatsDraft();
    const { queryRaw } = await import("@/internal/db/connection");
    const { POST } = await import("@/app/api/missions/[id]/review/route");
    const response: Response = await POST(
      jsonRequest(`/api/missions/${missionId}/review`, "POST", {
        review_status: "published",
      }),
      idParams(missionId),
    );
    const rows: ReviewRow[] = queryRaw<ReviewRow>(
      "SELECT review_status FROM mission WHERE id = ?",
      [missionId],
    );
    expect([400, 409]).toContain(response.status);
    expect(rows[0].review_status).toBe("draft");
  });
});
