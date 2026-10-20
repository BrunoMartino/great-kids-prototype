import { createTitular, DuplicateEmailError } from "@/app/api/app-users/titular-service";
import { AppUser, type AppUserCreateInput, type AppUserRole, type AppUserStatus } from "@/models/app_user";

type AppUserPostBody = {
  name?: string;
  nick_name?: string;
  email?: string | null;
  role?: string;
  status?: string;
};

function isAppUserRole(p_role: string): p_role is AppUserRole {
  return p_role === "Admin" || p_role === "Operator" || p_role === "Parent" || p_role === "Child";
}

function isAppUserStatus(p_status: string): p_status is AppUserStatus {
  return (
    p_status === "active" ||
    p_status === "inactive" ||
    p_status === "suspended" ||
    p_status === "blocked"
  );
}

export async function POST(p_request: Request): Promise<Response> {
  const body: AppUserPostBody = (await p_request.json()) as AppUserPostBody;
  if (body.nick_name === undefined || body.role === undefined || body.status === undefined) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  if (!isAppUserRole(body.role) || !isAppUserStatus(body.status)) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  const input: AppUserCreateInput = {
    name: body.name ?? null,
    nick_name: body.nick_name,
    email: body.email ?? null,
    role: body.role,
    status: body.status,
  };
  try {
    const created = await createTitular(input);
    return Response.json(
      {
        id: created.id,
        name: created.name,
        nick_name: created.nick_name,
        email: created.email,
        role: created.role,
        status: created.status,
        auth_user_id: created.auth_user_id,
      },
      { status: 201 },
    );
  } catch (p_error: unknown) {
    if (p_error instanceof DuplicateEmailError) {
      return Response.json({ error: "conflict" }, { status: 409 });
    }
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}

export async function GET(): Promise<Response> {
  const users = AppUser.instance.list();
  return Response.json(
    {
      id: crypto.randomUUID(),
      users: users.map((p_user) => ({
        id: p_user.id,
        nick_name: p_user.nick_name,
        role: p_user.role,
        email: p_user.email,
      })),
    },
    { status: 200 },
  );
}
