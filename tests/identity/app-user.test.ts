import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type AppUserRow = {
  id: string;
  name: string | null;
  nick_name: string;
  email: string | null;
  role: string;
  status: string;
  auth_user_id: string | null;
};

describe("app_user Active Record", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("inserts a Parent without password and with null auth_user_id", async () => {
    // Break: insert missing, or password column stored, or auth_user_id set.
    const { AppUser } = await import("@/models/app_user");
    const { queryRaw } = await import("@/internal/db/connection");
    const created: AppUserRow = await AppUser.instance.create({
      name: "Ana",
      nick_name: "Ana",
      email: "ana@example.com",
      role: "Parent",
      status: "active",
    });
    const rows: AppUserRow[] = queryRaw<AppUserRow>(
      "SELECT id, name, nick_name, email, role, status, auth_user_id FROM app_user WHERE id = ?",
      [created.id],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].nick_name).toBe("Ana");
    expect(rows[0].email).toBe("ana@example.com");
    expect(rows[0].role).toBe("Parent");
    expect(rows[0].auth_user_id).toBeNull();
    const starRows: Array<Record<string, unknown>> = queryRaw<Record<string, unknown>>(
      "SELECT * FROM app_user WHERE id = ?",
      [created.id],
    );
    expect(Object.keys(starRows[0]).includes("password")).toBe(false);
  });

  it("allows a Parent with null email", async () => {
    // Break: null email is rejected.
    const { AppUser } = await import("@/models/app_user");
    const created: AppUserRow = await AppUser.instance.create({
      name: "Bia",
      nick_name: "Bia",
      email: null,
      role: "Parent",
      status: "active",
    });
    expect(created.email).toBeNull();
    expect(created.nick_name).toBe("Bia");
  });

  it("rejects a second Parent with the same email", async () => {
    // Break: duplicate email is stored.
    const { AppUser } = await import("@/models/app_user");
    await AppUser.instance.create({
      name: "Ana",
      nick_name: "Ana",
      email: "ana@example.com",
      role: "Parent",
      status: "active",
    });
    await expect(
      AppUser.instance.create({
        name: "Other",
        nick_name: "Other",
        email: "ana@example.com",
        role: "Parent",
        status: "active",
      }),
    ).rejects.toThrow();
  });

  it("stores an injection-shaped email as data", async () => {
    // Break: param concatenated into SQL so app_user is dropped.
    const { AppUser } = await import("@/models/app_user");
    const { queryRaw } = await import("@/internal/db/connection");
    const injectedEmail: string = "'; DROP TABLE app_user; --";
    const created: AppUserRow = await AppUser.instance.create({
      name: "Inj",
      nick_name: "Inj",
      email: injectedEmail,
      role: "Parent",
      status: "active",
    });
    expect(created.email).toBe(injectedEmail);
    const tables: Array<{ name: string }> = queryRaw<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      ["app_user"],
    );
    expect(tables).toEqual([{ name: "app_user" }]);
  });
});
