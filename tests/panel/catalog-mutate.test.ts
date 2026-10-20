import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

const WATCH_ID: string = "f43929c0-ec67-51da-aeb9-9e461f57f364";

type MissionCreated = {
  id: string;
  mission: {
    id: string;
    category_id: string;
    review_status: string;
    title?: string;
  };
};

type MissionEnvelope = {
  id: string;
  mission: {
    id: string;
    title: string;
    deleted?: boolean;
    img_path: string | null;
    review_status: string;
  };
};

function jsonRequest(p_path: string, p_method: string, p_body?: unknown): Request {
  const init: RequestInit = { method: p_method, headers: {} };
  if (p_body !== undefined) {
    (init.headers as Record<string, string>)["content-type"] = "application/json";
    init.body = JSON.stringify(p_body);
  }
  return new Request(`http://localhost${p_path}`, init);
}

describe("POST/PATCH/DELETE /api/panel/catalog", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    delete process.env.S3_ENDPOINT;
    delete process.env.S3_BUCKET;
    delete process.env.S3_ACCESS_KEY;
    delete process.env.S3_SECRET_KEY;
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("creates a draft mission on the panel catalog", async () => {
    // Break: POST missing, not 201, or review_status not draft.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { POST } = await import("@/app/api/panel/catalog/route");
    const response: Response = await POST(
      jsonRequest("/api/panel/catalog", "POST", {
        category_id: WATCH_ID,
        title: "Kite afternoon",
      }),
    );
    const body: MissionCreated = (await response.json()) as MissionCreated;
    expect(response.status).toBe(201);
    expect(body.mission.category_id).toBe(WATCH_ID);
    expect(body.mission.review_status).toBe("draft");
    expect(typeof body.mission.id).toBe("string");
  });

  it("soft-deletes a catalog mission", async () => {
    // Break: DELETE missing or hard-deletes the row.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Operator";
    const { POST } = await import("@/app/api/panel/catalog/route");
    const createdResponse: Response = await POST(
      jsonRequest("/api/panel/catalog", "POST", {
        category_id: WATCH_ID,
        title: "Kite afternoon",
      }),
    );
    const created: MissionCreated = (await createdResponse.json()) as MissionCreated;
    const { DELETE } = await import("@/app/api/panel/catalog/[id]/route");
    const deletedResponse: Response = await DELETE(
      jsonRequest(`/api/panel/catalog/${created.mission.id}`, "DELETE"),
      { params: Promise.resolve({ id: created.mission.id }) },
    );
    expect(deletedResponse.status).toBe(200);
    const { Mission } = await import("@/models/mission");
    expect(Mission.instance.findById(created.mission.id)).toBeNull();
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: Array<{ deleted: number }> = queryRaw<{ deleted: number }>(
      "SELECT deleted FROM mission WHERE id = ?",
      [created.mission.id],
    );
    expect(rows[0]?.deleted).toBe(1);
  });

  it("stores an uploaded mission image under great-kids/", async () => {
    // Break: img_path missing prefix or not saved.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { POST } = await import("@/app/api/panel/catalog/route");
    const createdResponse: Response = await POST(
      jsonRequest("/api/panel/catalog", "POST", {
        category_id: WATCH_ID,
        title: "Kite afternoon",
      }),
    );
    const created: MissionCreated = (await createdResponse.json()) as MissionCreated;
    const form: FormData = new FormData();
    form.append("file", new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" }), "kite.png");
    const { POST: postImage } = await import("@/app/api/panel/catalog/[id]/image/route");
    const uploadResponse: Response = await postImage(
      new Request(`http://localhost/api/panel/catalog/${created.mission.id}/image`, {
        method: "POST",
        body: form,
      }),
      { params: Promise.resolve({ id: created.mission.id }) },
    );
    const body: MissionEnvelope = (await uploadResponse.json()) as MissionEnvelope;
    expect(uploadResponse.status).toBe(200);
    expect(body.mission.img_path?.startsWith("great-kids/")).toBe(true);
  });

  it("rejects unknown category_id on create", async () => {
    // Break: unknown category is stored.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { POST } = await import("@/app/api/panel/catalog/route");
    const response: Response = await POST(
      jsonRequest("/api/panel/catalog", "POST", {
        category_id: "00000000-0000-4000-8000-000000000000",
        title: "Ghost",
      }),
    );
    expect(response.status).toBe(400);
  });
});
