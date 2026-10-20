import {
  failResponse,
  isRecord,
  readJson,
  type JsonFail,
} from "../shell/panel-staff-facade";

export type PanelUserRow = {
  id: string;
  name: string | null;
  nick_name: string;
  email: string | null;
  role: string;
  status: string;
};

export type PanelUsersResult = { ok: true; users: PanelUserRow[] } | JsonFail;
export type PanelUserResult = { ok: true; user: PanelUserRow } | JsonFail;

function readUser(p_value: unknown): PanelUserRow | null {
  if (!isRecord(p_value)) {
    return null;
  }
  const id: unknown = Reflect.get(p_value, "id");
  const name: unknown = Reflect.get(p_value, "name");
  const nickName: unknown = Reflect.get(p_value, "nick_name");
  const email: unknown = Reflect.get(p_value, "email");
  const role: unknown = Reflect.get(p_value, "role");
  const status: unknown = Reflect.get(p_value, "status");
  if (typeof id !== "string" || id.length === 0) {
    return null;
  }
  if (name !== null && typeof name !== "string") {
    return null;
  }
  if (typeof nickName !== "string") {
    return null;
  }
  if (email !== null && typeof email !== "string") {
    return null;
  }
  if (typeof role !== "string" || typeof status !== "string") {
    return null;
  }
  return {
    id,
    name,
    nick_name: nickName,
    email,
    role,
    status,
  };
}

export class UsersFacade {
  public constructor(
    private fetchFn: typeof fetch = globalThis.fetch.bind(globalThis),
  ) {}

  public async loadUsers(): Promise<PanelUsersResult> {
    try {
      const response: Response = await this.fetchFn("/api/panel/users", {
        cache: "no-store",
      });
      const body: unknown = await readJson(response);
      if (!response.ok) {
        return failResponse(response, body);
      }
      if (!isRecord(body)) {
        return { ok: false, status: response.status, error: "invalid users" };
      }
      const usersRaw: unknown = Reflect.get(body, "users");
      if (!Array.isArray(usersRaw)) {
        return { ok: false, status: response.status, error: "invalid users" };
      }
      const users: PanelUserRow[] = [];
      for (let i: number = 0; i < usersRaw.length; i += 1) {
        const row: PanelUserRow | null = readUser(usersRaw[i]);
        if (row === null) {
          return { ok: false, status: response.status, error: "invalid users" };
        }
        users.push(row);
      }
      return { ok: true, users };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "users load failed" };
    }
  }

  public async patchUser(
    p_id: string,
    p_patch: { status?: string; name?: string | null; nick_name?: string; email?: string | null },
  ): Promise<PanelUserResult> {
    try {
      const response: Response = await this.fetchFn(
        `/api/panel/users/${encodeURIComponent(p_id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify(p_patch),
        },
      );
      const body: unknown = await readJson(response);
      if (!response.ok) {
        return failResponse(response, body);
      }
      if (!isRecord(body)) {
        return { ok: false, status: response.status, error: "invalid user" };
      }
      const user: PanelUserRow | null = readUser(Reflect.get(body, "user"));
      if (user === null) {
        return { ok: false, status: response.status, error: "invalid user" };
      }
      return { ok: true, user };
    } catch (p_error: unknown) {
      void p_error;
      return { ok: false, status: 0, error: "user patch failed" };
    }
  }
}
