import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "./helpers/sqlite-path";

describe("connection singleton", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("turns foreign keys on for the connection", async () => {
    // Break: getConnection opens SQLite without PRAGMA foreign_keys = ON.
    const { getConnection, queryRaw } = await import("@/internal/db/connection");
    getConnection();
    const rows: Array<{ foreign_keys: number }> = queryRaw<{
      foreign_keys: number;
    }>("PRAGMA foreign_keys", []);
    expect(rows[0].foreign_keys).toBe(1);
  });

  it("returns the same connection instance on a second call", async () => {
    // Break: getConnection constructs a new Database on every call.
    const { getConnection } = await import("@/internal/db/connection");
    const first = getConnection();
    const second = getConnection();
    expect(first).toBe(second);
  });
});
