import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type AppUserCreated = {
  id: string;
  name: string;
  nick_name: string;
  email: string;
  role: string;
  status: string;
  auth_user_id: string | null;
};

type AppUsersEnvelope = {
  id: string;
  users: Array<{
    id: string;
    nick_name: string;
    role: string;
    email: string;
  }>;
};

function jsonRequest(p_path: string, p_method: string, p_body: unknown): Request {
  return new Request(`http://localhost${p_path}`, {
    method: p_method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(p_body),
  });
}

describe("POST/GET /api/app-users", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("creates a Parent titular without password", async () => {
    // Break: not 201 or password leaked or auth_user_id set.
    const { POST } = await import("@/app/api/app-users/route");
    const response: Response = await POST(
      jsonRequest("/api/app-users", "POST", {
        name: "Ana",
        nick_name: "Ana",
        email: "ana@example.com",
        role: "Parent",
        status: "active",
      }),
    );
    const body: AppUserCreated = (await response.json()) as AppUserCreated;
    expect(response.status).toBe(201);
    expect(typeof body.id).toBe("string");
    expect(body.name).toBe("Ana");
    expect(body.nick_name).toBe("Ana");
    expect(body.email).toBe("ana@example.com");
    expect(body.role).toBe("Parent");
    expect(body.status).toBe("active");
    expect(body.auth_user_id).toBeNull();
    expect(Object.keys(body).includes("password")).toBe(false);
  });

  it("lists created users in an envelope", async () => {
    // Break: bare array or missing envelope id.
    const { POST, GET } = await import("@/app/api/app-users/route");
    await POST(
      jsonRequest("/api/app-users", "POST", {
        name: "Ana",
        nick_name: "Ana",
        email: "ana@example.com",
        role: "Parent",
        status: "active",
      }),
    );
    const response: Response = await GET();
    const body: AppUsersEnvelope = (await response.json()) as AppUsersEnvelope;
    expect(response.status).toBe(200);
    expect(typeof body.id).toBe("string");
    expect(body.users).toHaveLength(1);
    expect(body.users[0].nick_name).toBe("Ana");
    expect(body.users[0].role).toBe("Parent");
    expect(body.users[0].email).toBe("ana@example.com");
  });

  it("returns an empty users envelope when none exist", async () => {
    // Break: returns bare [] or 404.
    const { GET } = await import("@/app/api/app-users/route");
    const response: Response = await GET();
    const body: AppUsersEnvelope = (await response.json()) as AppUsersEnvelope;
    expect(response.status).toBe(200);
    expect(typeof body.id).toBe("string");
    expect(body.users).toEqual([]);
  });

  it("rejects Child as titular with 400", async () => {
    // Break: Child titular created (201).
    const { POST } = await import("@/app/api/app-users/route");
    const response: Response = await POST(
      jsonRequest("/api/app-users", "POST", {
        name: "Kid",
        nick_name: "Kid",
        email: "kid@example.com",
        role: "Child",
        status: "active",
      }),
    );
    expect(response.status).toBe(400);
  });

  it("rejects a duplicate email with 409", async () => {
    // Break: second 201.
    const { POST } = await import("@/app/api/app-users/route");
    const first: Response = await POST(
      jsonRequest("/api/app-users", "POST", {
        name: "Ana",
        nick_name: "Ana",
        email: "ana@example.com",
        role: "Parent",
        status: "active",
      }),
    );
    expect(first.status).toBe(201);
    const second: Response = await POST(
      jsonRequest("/api/app-users", "POST", {
        name: "Ana2",
        nick_name: "Ana2",
        email: "ana@example.com",
        role: "Parent",
        status: "active",
      }),
    );
    expect(second.status).toBe(409);
  });
});
