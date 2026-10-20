import {
  failResponse,
  isRecord,
  readJson,
  type JsonFail,
} from "../shell/panel-staff-facade";

export type PanelContextRow = {
  id: string;
  slug: string;
  name: string;
};

export type PanelContextsResult =
  | { ok: true; contexts: PanelContextRow[] }
  | JsonFail;

export type PanelContextResult =
  | { ok: true; context: PanelContextRow }
  | JsonFail;

function readContext(p_value: unknown): PanelContextRow | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const id: unknown = Reflect.get(p_value, "id");
  const slug: unknown = Reflect.get(p_value, "slug");
  const name: unknown = Reflect.get(p_value, "name");
  if (
    typeof id !== "string" ||
    id.length === 0 ||
    typeof slug !== "string" ||
    typeof name !== "string"
  ) {
    return null;
  }
  return { id, slug, name };
}

export class ContextsFacade {
  public constructor(
    private fetchFn: typeof fetch = globalThis.fetch.bind(globalThis),
  ) {}

  public async loadContexts(): Promise<PanelContextsResult> {
    try {
      const response: Response = await this.fetchFn(
        "/api/panel/forecast-contexts",
        { cache: "no-store" },
      );
      const body: unknown = await readJson(response);
      if (!response.ok) {
        return failResponse(response, body);
      }
      if (!isRecord(body)) {
        return { ok: false, status: response.status, error: "invalid contexts" };
      }
      const raw: unknown = Reflect.get(body, "contexts");
      if (!Array.isArray(raw)) {
        return { ok: false, status: response.status, error: "invalid contexts" };
      }
      const contexts: PanelContextRow[] = [];
      for (let i: number = 0; i < raw.length; i += 1) {
        const row: PanelContextRow | null = readContext(raw[i]);
        if (row === null) {
          return {
            ok: false,
            status: response.status,
            error: "invalid contexts",
          };
        }
        contexts.push(row);
      }
      return { ok: true, contexts };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "contexts load failed" };
    }
  }

  public async patchContextName(
    p_id: string,
    p_name: string,
  ): Promise<PanelContextResult> {
    try {
      const response: Response = await this.fetchFn(
        `/api/panel/forecast-contexts/${encodeURIComponent(p_id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ name: p_name }),
        },
      );
      const body: unknown = await readJson(response);
      if (!response.ok) {
        return failResponse(response, body);
      }
      if (!isRecord(body)) {
        return { ok: false, status: response.status, error: "invalid context" };
      }
      const context: PanelContextRow | null = readContext(
        Reflect.get(body, "context"),
      );
      if (context === null) {
        return { ok: false, status: response.status, error: "invalid context" };
      }
      return { ok: true, context };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "context patch failed" };
    }
  }
}
