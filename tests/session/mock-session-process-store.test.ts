import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type GlobalWithMockSession = typeof globalThis & {
  __greatKidsMockSessionStore?: { session: { role: string } };
};

describe("mock session process store", () => {
  const previousVitest: string | undefined = process.env.VITEST;

  beforeEach(() => {
    vi.resetModules();
    const g: GlobalWithMockSession = globalThis;
    delete g.__greatKidsMockSessionStore;
  });

  afterEach(() => {
    if (previousVitest === undefined) {
      delete process.env.VITEST;
    } else {
      process.env.VITEST = previousVitest;
    }
    vi.resetModules();
    const g: GlobalWithMockSession = globalThis;
    delete g.__greatKidsMockSessionStore;
  });

  it("shares the same session object across dynamic re-imports outside Vitest", async () => {
    delete process.env.VITEST;
    const first = await import("@/internal/db/mock-session");
    first.getMockSession().role = "Admin";
    vi.resetModules();
    const second = await import("@/internal/db/mock-session");
    expect(second.getMockSession().role).toBe("Admin");
  });
});
