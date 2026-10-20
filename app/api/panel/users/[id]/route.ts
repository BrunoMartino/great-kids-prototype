import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import {
  UserWriteDeniedError,
  UserWritePolicy,
} from "@/app/api/panel/users/user-write-policy";
import { getMockSession } from "@/internal/db/mock-session";
import {
  AppUser,
  HardDeleteForbiddenError,
  type AppUserRecord,
  type AppUserUpdateInput,
} from "@/models/app_user";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UserPatchBody = {
  status?: string;
  name?: string | null;
  nick_name?: string;
  email?: string | null;
  deleted?: unknown;
};

type UserJson = {
  id: string;
  name: string | null;
  nick_name: string;
  email: string | null;
  role: string;
  status: string;
};

function toUserJson(p_row: AppUserRecord): UserJson {
  return {
    id: p_row.id,
    name: p_row.name,
    nick_name: p_row.nick_name,
    email: p_row.email,
    role: p_row.role,
    status: p_row.status,
  };
}

function assertStaff(): Response | null {
  const facade: SurfaceFacade = new SurfaceFacade();
  try {
    facade.assertPanel(getMockSession().role);
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}

export async function PATCH(p_request: Request, p_context: RouteContext): Promise<Response> {
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  try {
    UserWritePolicy.assertCanWrite(getMockSession().role);
  } catch (p_error: unknown) {
    if (p_error instanceof UserWriteDeniedError) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
    throw p_error;
  }
  const params: { id: string } = await p_context.params;
  const body: UserPatchBody = (await p_request.json()) as UserPatchBody;
  if (Object.prototype.hasOwnProperty.call(body, "deleted")) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  const input: AppUserUpdateInput = {};
  if (body.status !== undefined) {
    input.status = body.status;
  }
  if (body.name !== undefined) {
    input.name = body.name;
  }
  if (body.nick_name !== undefined) {
    input.nick_name = body.nick_name;
  }
  if (body.email !== undefined) {
    input.email = body.email;
  }
  try {
    const updated: AppUserRecord | null = AppUser.instance.update(params.id, input);
    if (updated === null) {
      return Response.json({ error: "not found" }, { status: 404 });
    }
    return Response.json({ id: crypto.randomUUID(), user: toUserJson(updated) }, { status: 200 });
  } catch (p_error: unknown) {
    if (p_error instanceof HardDeleteForbiddenError) {
      return Response.json({ error: "bad request" }, { status: 400 });
    }
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
