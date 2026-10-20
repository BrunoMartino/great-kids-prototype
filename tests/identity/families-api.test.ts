import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type AppUserCreated = {
  id: string;
};

type FamilyCreated = {
  id: string;
  status: string;
  plan_id: string | null;
  family_members: {
    id: string;
    members: Array<{ user_id: string; user_nickname: string; user_role: string }>;
  };
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
};

function jsonRequest(p_path: string, p_method: string, p_body: unknown): Request {
  return new Request(`http://localhost${p_path}`, {
    method: p_method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(p_body),
  });
}

describe("POST /api/families", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("creates a family husk for a Parent holder", async () => {
    // Break: 201 without husk envelopes or holder missing.
    const { POST: postUser } = await import("@/app/api/app-users/route");
    const { POST } = await import("@/app/api/families/route");
    const userResponse: Response = await postUser(
      jsonRequest("/api/app-users", "POST", {
        name: "Ana",
        nick_name: "Ana",
        email: "ana@example.com",
        role: "Parent",
        status: "active",
      }),
    );
    const user: AppUserCreated = (await userResponse.json()) as AppUserCreated;
    const response: Response = await POST(
      jsonRequest("/api/families", "POST", {
        holder_user_id: user.id,
        status: "active",
      }),
    );
    const body: FamilyCreated = (await response.json()) as FamilyCreated;
    expect(response.status).toBe(201);
    expect(body.status).toBe("active");
    expect(body.plan_id).toBeNull();
    expect(body.family_members.members[0].user_id).toBe(user.id);
    expect(body.address).toEqual({
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
    });
  });

  it("rejects a family without holder_user_id", async () => {
    // Break: 201 with empty members.
    const { POST } = await import("@/app/api/families/route");
    const response: Response = await POST(
      jsonRequest("/api/families", "POST", {
        status: "active",
      }),
    );
    expect(response.status).toBe(400);
  });

  it("rejects a Child holder_user_id", async () => {
    // Break: Child becomes family titular.
    const { queryRaw } = await import("@/internal/db/connection");
    queryRaw(
      `INSERT INTO app_user (
        id, name, nick_name, email, role, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "child-kid-1",
        "Kid",
        "Kid",
        "kid@example.com",
        "Child",
        "active",
        "2026-01-01T00:00:00Z",
        "2026-01-01T00:00:00Z",
      ],
    );
    const { POST } = await import("@/app/api/families/route");
    const response: Response = await POST(
      jsonRequest("/api/families", "POST", {
        holder_user_id: "child-kid-1",
        status: "active",
      }),
    );
    expect(response.status).toBe(400);
  });
});
