import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type UsersEnvelope = {
  id: string;
  users: Array<{
    id: string;
    nick_name: string;
    role: string;
    status: string;
  }>;
};

type UserEnvelope = {
  id: string;
  user: {
    id: string;
    status: string;
    name: string | null;
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

describe("GET/PATCH /api/panel/users Admin Policy", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("lets Admin PATCH status to blocked and persists", async () => {
    // Break: 403 for Admin, hard delete, or status not blocked.
    const { AppUser } = await import("@/models/app_user");
    const created = await AppUser.instance.create({
      name: "Ana",
      nick_name: "Ana",
      email: "ana-block@example.com",
      role: "Parent",
      status: "active",
    });
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { PATCH } = await import("@/app/api/panel/users/[id]/route");
    const response: Response = await PATCH(
      jsonRequest(`/api/panel/users/${created.id}`, "PATCH", { status: "blocked" }),
      { params: Promise.resolve({ id: created.id }) },
    );
    const body: UserEnvelope = (await response.json()) as UserEnvelope;
    expect(response.status).toBe(200);
    expect(body.user.id).toBe(created.id);
    expect(body.user.status).toBe("blocked");
    const stored = AppUser.instance.findById(created.id);
    expect(stored?.status).toBe("blocked");
  });

  it("lets Operator GET the list and forbids Operator PATCH", async () => {
    // Break: Operator GET not 200, or Operator PATCH writes (not 403).
    const { AppUser } = await import("@/models/app_user");
    const created = await AppUser.instance.create({
      name: "Ana",
      nick_name: "Ana",
      email: "ana-op@example.com",
      role: "Parent",
      status: "active",
    });
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Operator";
    const { GET } = await import("@/app/api/panel/users/route");
    const listResponse: Response = await GET(jsonRequest("/api/panel/users", "GET"));
    const listBody: UsersEnvelope = (await listResponse.json()) as UsersEnvelope;
    expect(listResponse.status).toBe(200);
    expect(listBody.users.some((p_u) => p_u.id === created.id)).toBe(true);
    const { PATCH } = await import("@/app/api/panel/users/[id]/route");
    const patchResponse: Response = await PATCH(
      jsonRequest(`/api/panel/users/${created.id}`, "PATCH", { status: "blocked" }),
      { params: Promise.resolve({ id: created.id }) },
    );
    expect(patchResponse.status).toBe(403);
    const stored = AppUser.instance.findById(created.id);
    expect(stored?.status).toBe("active");
  });

  it("rejects hard-delete shaped PATCH and keeps the row", async () => {
    // Break: deleted flag or missing row after a delete-shaped body.
    const { AppUser } = await import("@/models/app_user");
    const created = await AppUser.instance.create({
      name: "Ana",
      nick_name: "Ana",
      email: "ana-keep@example.com",
      role: "Parent",
      status: "active",
    });
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { PATCH } = await import("@/app/api/panel/users/[id]/route");
    const response: Response = await PATCH(
      jsonRequest(`/api/panel/users/${created.id}`, "PATCH", { deleted: true }),
      { params: Promise.resolve({ id: created.id }) },
    );
    expect(response.status).toBe(400);
    expect(AppUser.instance.findById(created.id)?.status).toBe("active");
  });
});
