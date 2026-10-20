import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type Presentation = {
  role: string;
  presentation: string;
};

type CountRow = {
  n: number;
};

describe("Parent vs Child presentation strategy", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("defaults to Parent presentation", async () => {
    // Break: default Child
    const { getPresentation } = await import("@/app/api/session/presentation-strategy");
    const shown: Presentation = getPresentation();
    expect(shown.role).toBe("Parent");
    expect(shown.presentation).toBe("parent");
  });

  it("switch to Child then back to Parent", async () => {
    // Break: switch sticks on Child
    const { applyRole, getPresentation } = await import(
      "@/app/api/session/presentation-strategy"
    );
    applyRole("Child");
    const childShown: Presentation = getPresentation();
    expect(childShown.role).toBe("Child");
    expect(childShown.presentation).toBe("child");
    applyRole("Parent");
    const parentShown: Presentation = getPresentation();
    expect(parentShown.role).toBe("Parent");
    expect(parentShown.presentation).toBe("parent");
  });

  it("rejects unknown role", async () => {
    // Break: garbage role stored
    const { applyRole } = await import("@/app/api/session/presentation-strategy");
    expect(() => {
      applyRole("Admin");
    }).toThrow();
  });

  it("Child switch does not insert app_user", async () => {
    // Break: switch creates Child login
    const { applyRole } = await import("@/app/api/session/presentation-strategy");
    const { getConnection, queryRaw } = await import("@/internal/db/connection");
    getConnection();
    applyRole("Child");
    const rows: CountRow[] = queryRaw<CountRow>("SELECT count(*) AS n FROM app_user", []);
    expect(rows[0].n).toBe(0);
  });
});
