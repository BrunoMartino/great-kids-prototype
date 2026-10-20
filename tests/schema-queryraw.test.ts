import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "./helpers/sqlite-path";

type PlanNameRow = {
  name: string;
};

type TableNameRow = {
  name: string;
};

describe("schema apply and queryRaw", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("creates hub tables when the connection boots", async () => {
    // Break: getConnection skips applying db/migrations/000000_schema.sql.
    const { getConnection, queryRaw } = await import("@/internal/db/connection");
    getConnection();
    const rows: TableNameRow[] = queryRaw<TableNameRow>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (?, ?, ?, ?, ?) ORDER BY name",
      ["app_user", "family", "family_mission", "mission", "plan"],
    );
    expect(rows.map((row: TableNameRow) => row.name)).toEqual([
      "app_user",
      "family",
      "family_mission",
      "mission",
      "plan",
    ]);
  });

  it("loads the Free plan seed", async () => {
    // Break: schema file is applied without the seed INSERT for plan Free.
    const { getConnection, queryRaw } = await import("@/internal/db/connection");
    getConnection();
    const rows: PlanNameRow[] = queryRaw<PlanNameRow>(
      "SELECT name FROM plan WHERE id = ?",
      ["24bcd40e-7ae3-581c-b8b9-65b1f11b0ac1"],
    );
    expect(rows[0].name).toBe("Free");
  });

  it("does not throw when getConnection is called twice on the same file", async () => {
    // Break: schema is re-executed (CREATE TABLE / INSERT) on every getConnection.
    const { getConnection } = await import("@/internal/db/connection");
    getConnection();
    expect(() => {
      getConnection();
    }).not.toThrow();
  });

  it("rejects an orphan family row when foreign keys are on", async () => {
    // Break: FK pragma is off or family FKs are missing, so a fake profile id is stored.
    const { getConnection, queryRaw } = await import("@/internal/db/connection");
    getConnection();
    expect(() => {
      queryRaw(
        `INSERT INTO family (
          id, fam_profile_id, fam_diary_id, status, family_members, address, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "fam-orphan-1",
          "missing-profile",
          "missing-diary",
          "active",
          '{"id":"fam-orphan-1","members":[]}',
          "{}",
          "2026-01-01T00:00:00Z",
          "2026-01-01T00:00:00Z",
        ],
      );
    }).toThrow();
  });

  it("returns the bound plan name through queryRaw", async () => {
    // Break: queryRaw concatenates SQL or ignores p_params, so the Free row is not returned.
    const { getConnection, queryRaw } = await import("@/internal/db/connection");
    getConnection();
    const rows: PlanNameRow[] = queryRaw<PlanNameRow>(
      "SELECT name FROM plan WHERE id = ?",
      ["24bcd40e-7ae3-581c-b8b9-65b1f11b0ac1"],
    );
    expect(rows).toEqual([{ name: "Free" }]);
  });

  it("returns an empty array when queryRaw matches no row", async () => {
    // Break: queryRaw returns undefined or throws on an empty SELECT.
    const { getConnection, queryRaw } = await import("@/internal/db/connection");
    getConnection();
    const rows: PlanNameRow[] = queryRaw<PlanNameRow>(
      "SELECT name FROM plan WHERE id = ?",
      ["00000000-0000-0000-0000-000000000000"],
    );
    expect(rows).toEqual([]);
  });

  it("throws when queryRaw is given invalid SQL", async () => {
    // Break: queryRaw swallows prepare/exec errors and returns success.
    const { getConnection, queryRaw } = await import("@/internal/db/connection");
    getConnection();
    expect(() => {
      queryRaw("SELECT not_a_column FROM plan", []);
    }).toThrow();
  });

  it("treats an injection-shaped parameter as data", async () => {
    // Break: queryRaw interpolates p_params into SQL, so DROP TABLE plan runs.
    const { getConnection, queryRaw } = await import("@/internal/db/connection");
    getConnection();
    const injected: PlanNameRow[] = queryRaw<PlanNameRow>(
      "SELECT name FROM plan WHERE name = ?",
      ["'; DROP TABLE plan; --"],
    );
    expect(injected).toEqual([]);
    const stillThere: PlanNameRow[] = queryRaw<PlanNameRow>(
      "SELECT name FROM plan WHERE name = ?",
      ["Free"],
    );
    expect(stillThere).toEqual([{ name: "Free" }]);
  });
});
