import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "./helpers/sqlite-path";

type HealthBody = {
  ok: boolean;
  foreignKeys: boolean;
  sessionRole: string;
};

describe("GET /api/health", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns 200 with ok and foreignKeys when the database is up", async () => {
    // Break: health handler is missing, or it reports ok without checking FK pragma.
    const { GET } = await import("@/app/api/health/route");
    const response: Response = await GET();
    const body: HealthBody = (await response.json()) as HealthBody;
    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.foreignKeys).toBe(true);
  });

  it("includes the mock session Parent role", async () => {
    // Break: health does not load the in-memory session store (default Parent).
    const { GET } = await import("@/app/api/health/route");
    const response: Response = await GET();
    const body: HealthBody = (await response.json()) as HealthBody;
    expect(body.sessionRole).toBe("Parent");
  });

  it("does not leak SQLITE_PATH or secret-looking keys", async () => {
    // Break: health JSON includes the sqlite file path or password/token/secret fields.
    const sqlitePath: string = arrangeTestSqlitePath();
    vi.resetModules();
    const { GET } = await import("@/app/api/health/route");
    const response: Response = await GET();
    const text: string = await response.text();
    const body: HealthBody = JSON.parse(text) as HealthBody;
    expect(text.includes(sqlitePath)).toBe(false);
    expect(Object.keys(body).some((key: string) => /password|token|secret/i.test(key))).toBe(
      false,
    );
  });
});
