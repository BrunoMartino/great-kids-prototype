import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

describe("SQLite connection pragmas", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("applies WAL, busy_timeout, synchronous NORMAL, and foreign_keys", async () => {
    const { getConnection } = await import("@/internal/db/connection");
    const database = getConnection();
    expect(String(database.pragma("journal_mode", { simple: true }))).toMatch(
      /wal/i,
    );
    expect(Number(database.pragma("busy_timeout", { simple: true }))).toBe(
      5000,
    );
    expect(
      String(database.pragma("synchronous", { simple: true })),
    ).toMatch(/normal|1/i);
    expect(Number(database.pragma("foreign_keys", { simple: true }))).toBe(1);
  });

  it("getConnection is idempotent for the same module load", async () => {
    const { getConnection } = await import("@/internal/db/connection");
    const first = getConnection();
    const second = getConnection();
    expect(second).toBe(first);
  });
});
