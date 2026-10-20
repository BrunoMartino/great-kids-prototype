import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

const WATCH_ID: string = "f43929c0-ec67-51da-aeb9-9e461f57f364";
const RAIN_ID: string = "26533182-4f8b-58e3-83ef-3e551d134baf";

type CategoriesEnvelope = {
  id: string;
  categories: Array<{ id: string; slug: string; name: string }>;
};

type CategoryEnvelope = {
  id: string;
  category: { id: string; slug: string; name: string };
};

type ContextsEnvelope = {
  id: string;
  contexts: Array<{ id: string; slug: string; name: string }>;
};

type ContextEnvelope = {
  id: string;
  context: { id: string; slug: string; name: string };
};

function jsonRequest(p_path: string, p_method: string, p_body?: unknown): Request {
  const init: RequestInit = { method: p_method, headers: {} };
  if (p_body !== undefined) {
    (init.headers as Record<string, string>)["content-type"] = "application/json";
    init.body = JSON.stringify(p_body);
  }
  return new Request(`http://localhost${p_path}`, init);
}

describe("GET/PATCH /api/panel/categories and forecast-contexts", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("lists Watch and patches its display name", async () => {
    // Break: GET missing or PATCH does not persist name.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Admin";
    const { GET } = await import("@/app/api/panel/categories/route");
    const listResponse: Response = await GET(jsonRequest("/api/panel/categories", "GET"));
    const listBody: CategoriesEnvelope = (await listResponse.json()) as CategoriesEnvelope;
    expect(listResponse.status).toBe(200);
    expect(listBody.categories.some((p_c) => p_c.id === WATCH_ID && p_c.slug === "watch")).toBe(
      true,
    );
    const { PATCH } = await import("@/app/api/panel/categories/[id]/route");
    const patchedResponse: Response = await PATCH(
      jsonRequest(`/api/panel/categories/${WATCH_ID}`, "PATCH", { name: "Watch together" }),
      { params: Promise.resolve({ id: WATCH_ID }) },
    );
    const patched: CategoryEnvelope = (await patchedResponse.json()) as CategoryEnvelope;
    expect(patchedResponse.status).toBe(200);
    expect(patched.category.name).toBe("Watch together");
    expect(patched.category.slug).toBe("watch");
  });

  it("lists Rain and patches its display name", async () => {
    // Break: GET missing or PATCH does not persist name.
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Operator";
    const { GET } = await import("@/app/api/panel/forecast-contexts/route");
    const listResponse: Response = await GET(jsonRequest("/api/panel/forecast-contexts", "GET"));
    const listBody: ContextsEnvelope = (await listResponse.json()) as ContextsEnvelope;
    expect(listResponse.status).toBe(200);
    expect(listBody.contexts.some((p_c) => p_c.id === RAIN_ID && p_c.slug === "rain")).toBe(true);
    const { PATCH } = await import("@/app/api/panel/forecast-contexts/[id]/route");
    const patchedResponse: Response = await PATCH(
      jsonRequest(`/api/panel/forecast-contexts/${RAIN_ID}`, "PATCH", { name: "Rainy day" }),
      { params: Promise.resolve({ id: RAIN_ID }) },
    );
    const patched: ContextEnvelope = (await patchedResponse.json()) as ContextEnvelope;
    expect(patchedResponse.status).toBe(200);
    expect(patched.context.name).toBe("Rainy day");
  });
});
