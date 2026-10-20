import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

const WATCH_ID: string = "f43929c0-ec67-51da-aeb9-9e461f57f364";

type MissionCreated = {
  id: string;
  mission: {
    id: string;
    category_id: string;
    review_status: string;
  };
};

type PublishedItem = {
  id: string;
  title?: string;
};

type FicheEnvelope = {
  id: string;
  mission: {
    title?: string;
    review_status?: string;
  };
  error?: string;
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
  const { DraftMissionFactory } = await import("@/app/api/missions/mission-factory");
  const factory: InstanceType<typeof DraftMissionFactory> = new DraftMissionFactory();
  const created: { id: string } = await factory.create({
    category_id: WATCH_ID,
    title: "Paper boats",
  });
  return created.id;
}

async function setReviewStatus(p_missionId: string, p_from: string, p_to: string): Promise<void> {
  const { ReviewState } = await import("@/app/api/missions/[id]/review-state");
  const { Mission } = await import("@/models/mission");
  const nextStatus: string = ReviewState.transition(p_from, p_to);
  Mission.instance.updateReviewStatus(p_missionId, nextStatus);
}

describe("Mission.listPublished and Parent GET /api/missions/[id]", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("omits Factory drafts and includes the id after a legal publish", async () => {
    // Break: drafts appear in listPublished, or published id is missing. INV-001 / INV-005.
    const { Mission } = await import("@/models/mission");
    const missionId: string = await createPaperBoatsDraft();
    const beforePublish: PublishedItem[] = Mission.instance.listPublished();
    expect(beforePublish.some((item: PublishedItem) => item.id === missionId)).toBe(false);
    await setReviewStatus(missionId, "draft", "in_review");
    await setReviewStatus(missionId, "in_review", "published");
    const afterPublish: PublishedItem[] = Mission.instance.listPublished();
    expect(afterPublish.some((item: PublishedItem) => item.id === missionId)).toBe(true);
  });

  it("omits in_review missions from listPublished", async () => {
    // Break: in_review rows leak to family list. INV-005.
    const { Mission } = await import("@/models/mission");
    const missionId: string = await createPaperBoatsDraft();
    await setReviewStatus(missionId, "draft", "in_review");
    const listed: PublishedItem[] = Mission.instance.listPublished();
    expect(listed.some((item: PublishedItem) => item.id === missionId)).toBe(false);
  });

  it("hides a mission from listPublished after published to in_review", async () => {
    // Break: re-review leaves the row on the family list.
    const { Mission } = await import("@/models/mission");
    const missionId: string = await createPaperBoatsDraft();
    await setReviewStatus(missionId, "draft", "in_review");
    await setReviewStatus(missionId, "in_review", "published");
    await setReviewStatus(missionId, "published", "in_review");
    const listed: PublishedItem[] = Mission.instance.listPublished().filter(
      (item: PublishedItem) => item.id === missionId,
    );
    expect(listed).toHaveLength(0);
  });

  it("hides drafts from Parent GET, shows published catalog rows, and never invents a mission", async () => {
    // Break: Parent reads a draft, or empty catalog invents a mission. INV-001.
    const { Mission } = await import("@/models/mission");
    const emptyList: PublishedItem[] = Mission.instance.listPublished();
    expect(emptyList).toEqual([]);

    const missionId: string = await createPaperBoatsDraft();
    const { GET } = await import("@/app/api/missions/[id]/route");
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
    const parentDraftResponse: Response = await GET(
      new Request(`http://localhost/api/missions/${missionId}`),
      idParams(missionId),
    );
    const parentDraftBody: FicheEnvelope = (await parentDraftResponse.json()) as FicheEnvelope;
    expect(parentDraftResponse.status).toBe(404);
    expect(parentDraftBody.mission?.title).not.toBe("Untitled");
    expect(parentDraftBody.mission?.title).not.toBe("Generated mission");

    getMockSession().role = "Admin";
    const staffDraftResponse: Response = await GET(
      new Request(`http://localhost/api/missions/${missionId}`),
      idParams(missionId),
    );
    const staffDraftBody: FicheEnvelope = (await staffDraftResponse.json()) as FicheEnvelope;
    expect(staffDraftResponse.status).toBe(200);
    expect(staffDraftBody.mission.title).toBe("Paper boats");

    await setReviewStatus(missionId, "draft", "in_review");
    await setReviewStatus(missionId, "in_review", "published");
    getMockSession().role = "Parent";
    const parentPublishedResponse: Response = await GET(
      new Request(`http://localhost/api/missions/${missionId}`),
      idParams(missionId),
    );
    const parentPublishedBody: FicheEnvelope =
      (await parentPublishedResponse.json()) as FicheEnvelope;
    expect(parentPublishedResponse.status).toBe(200);
    expect(parentPublishedBody.mission.title).toBe("Paper boats");
  });
});
