import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

const SEEDED_SLUGS: string[] = [
  "celebrate",
  "cook",
  "faith",
  "go",
  "grow",
  "listen",
  "make",
  "play",
  "read",
  "serve",
  "talk",
  "watch",
];

type CategoryItem = {
  id: string;
  slug: string;
  name: string;
};

type CategoriesEnvelope = {
  id: string;
  categories: CategoryItem[];
};

type CategoryCreated = {
  id: string;
  category: CategoryItem;
};

function jsonRequest(p_path: string, p_method: string, p_body: unknown): Request {
  return new Request(`http://localhost${p_path}`, {
    method: p_method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(p_body),
  });
}

describe("mission categories", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("exposes the twelve seeded slugs", async () => {
    // Break: seed missing or slug drift.
    await import("@/models/mission_category");
    const { getConnection, queryRaw } = await import("@/internal/db/connection");
    getConnection();
    const rows: Array<{ slug: string }> = queryRaw<{ slug: string }>(
      "SELECT slug FROM mission_category ORDER BY slug",
      [],
    );
    expect(rows.map((row: { slug: string }) => row.slug)).toEqual(SEEDED_SLUGS);
  });

  it("returns a staff envelope with twelve categories", async () => {
    // Break: bare array or count ≠ 12.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { GET } = await import("@/app/api/mission-categories/route");
    const response: Response = await GET();
    const body: CategoriesEnvelope = (await response.json()) as CategoriesEnvelope;
    expect(response.status).toBe(200);
    expect(typeof body.id).toBe("string");
    expect(body.categories).toHaveLength(12);
    const watch: CategoryItem | undefined = body.categories.find(
      (item: CategoryItem) => item.slug === "watch",
    );
    expect(watch?.name).toBe("Watch");
    expect(typeof watch?.id).toBe("string");
  });

  it("rejects a duplicate watch slug with 409", async () => {
    // Break: duplicate slug inserted.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { POST } = await import("@/app/api/mission-categories/route");
    const response: Response = await POST(
      jsonRequest("/api/mission-categories", "POST", {
        slug: "watch",
        name: "Watch2",
      }),
    );
    expect(response.status).toBe(409);
  });

  it("treats an injection-shaped slug as data", async () => {
    // Break: SQL injection drops table.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { POST } = await import("@/app/api/mission-categories/route");
    const { queryRaw } = await import("@/internal/db/connection");
    await POST(
      jsonRequest("/api/mission-categories", "POST", {
        slug: "'; DROP TABLE mission_category; --",
        name: "Inject",
      }),
    );
    const tables: Array<{ name: string }> = queryRaw<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
      ["mission_category"],
    );
    expect(tables).toEqual([{ name: "mission_category" }]);
    const rows: Array<{ slug: string }> = queryRaw<{ slug: string }>(
      "SELECT slug FROM mission_category WHERE slug IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ORDER BY slug",
      SEEDED_SLUGS,
    );
    expect(rows).toHaveLength(12);
  });

  it("creates an extra category for Admin", async () => {
    // Break: POST missing or 403 for Admin.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { POST } = await import("@/app/api/mission-categories/route");
    const response: Response = await POST(
      jsonRequest("/api/mission-categories", "POST", {
        slug: "extra-cat",
        name: "Extra",
      }),
    );
    const body: CategoryCreated = (await response.json()) as CategoryCreated;
    expect(response.status).toBe(201);
    expect(body.category.slug).toBe("extra-cat");
    expect(body.category.name).toBe("Extra");
    expect(typeof body.id).toBe("string");
  });
});
