import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type MaterialJson = {
  id: string;
  type: string;
  title: string;
  status: string;
  feat_img_path: string | null;
  file_path: string | null;
  deleted: boolean;
};

type MaterialEnvelope = {
  id: string;
  material: MaterialJson;
};

function jsonRequest(p_path: string, p_method: string, p_body?: unknown): Request {
  const init: RequestInit = { method: p_method, headers: {} };
  if (p_body !== undefined) {
    (init.headers as Record<string, string>)["content-type"] = "application/json";
    init.body = JSON.stringify(p_body);
  }
  return new Request(`http://localhost${p_path}`, init);
}

describe("CRUD /api/panel/materials", () => {
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

  it("creates a curated Book and soft-deletes it", async () => {
    // Break: create not 201, or DELETE hard-removes / leaves deleted false.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { POST } = await import("@/app/api/panel/materials/route");
    const createdResponse: Response = await POST(
      jsonRequest("/api/panel/materials", "POST", {
        type: "Book",
        title: "Idea Book",
        description: "Placeholder catalog art",
      }),
    );
    const created: MaterialEnvelope = (await createdResponse.json()) as MaterialEnvelope;
    expect(createdResponse.status).toBe(201);
    expect(created.material.type).toBe("Book");
    expect(created.material.title).toBe("Idea Book");
    expect(created.material.deleted).toBe(false);
    const { DELETE } = await import("@/app/api/panel/materials/[id]/route");
    const deletedResponse: Response = await DELETE(
      jsonRequest(`/api/panel/materials/${created.material.id}`, "DELETE"),
      { params: Promise.resolve({ id: created.material.id }) },
    );
    expect(deletedResponse.status).toBe(200);
    const { CuratedMaterial } = await import("@/models/curated_material");
    const stored = CuratedMaterial.instance.findById(created.material.id);
    expect(stored).not.toBeNull();
    expect(stored?.deleted).toBe(1);
  });

  it("uploads a file under great-kids/ and stores file_path", async () => {
    // Break: path not persisted, or key missing great-kids/.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Operator";
    const { POST } = await import("@/app/api/panel/materials/route");
    const createdResponse: Response = await POST(
      jsonRequest("/api/panel/materials", "POST", {
        type: "Activity",
        title: "Paper boats sheet",
      }),
    );
    const created: MaterialEnvelope = (await createdResponse.json()) as MaterialEnvelope;
    const form: FormData = new FormData();
    form.append("file", new Blob([new Uint8Array([1, 2, 3, 4])], { type: "application/pdf" }), "boats.pdf");
    const { POST: postUpload } = await import("@/app/api/panel/materials/[id]/upload/route");
    const uploadResponse: Response = await postUpload(
      new Request(`http://localhost/api/panel/materials/${created.material.id}/upload`, {
        method: "POST",
        body: form,
      }),
      { params: Promise.resolve({ id: created.material.id }) },
    );
    const uploaded: MaterialEnvelope = (await uploadResponse.json()) as MaterialEnvelope;
    expect(uploadResponse.status).toBe(200);
    expect(uploaded.material.file_path?.startsWith("great-kids/")).toBe(true);
  });

  it("does not persist a path for an empty upload", async () => {
    // Break: empty file still writes file_path.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { POST } = await import("@/app/api/panel/materials/route");
    const createdResponse: Response = await POST(
      jsonRequest("/api/panel/materials", "POST", {
        type: "Activity",
        title: "Empty upload",
      }),
    );
    const created: MaterialEnvelope = (await createdResponse.json()) as MaterialEnvelope;
    const form: FormData = new FormData();
    form.append("file", new Blob([], { type: "image/png" }), "empty.png");
    const { POST: postUpload } = await import("@/app/api/panel/materials/[id]/upload/route");
    const uploadResponse: Response = await postUpload(
      new Request(`http://localhost/api/panel/materials/${created.material.id}/upload`, {
        method: "POST",
        body: form,
      }),
      { params: Promise.resolve({ id: created.material.id }) },
    );
    expect(uploadResponse.status).toBe(400);
    const { CuratedMaterial } = await import("@/models/curated_material");
    expect(CuratedMaterial.instance.findById(created.material.id)?.file_path).toBeNull();
  });
});
