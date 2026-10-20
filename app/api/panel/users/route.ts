import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import { getMockSession } from "@/internal/db/mock-session";
import { AppUser, type AppUserRecord } from "@/models/app_user";

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

export async function GET(p_request: Request): Promise<Response> {
  void p_request;
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const users: AppUserRecord[] = AppUser.instance.list();
  return Response.json(
    {
      id: crypto.randomUUID(),
      users: users.map((p_row: AppUserRecord) => toUserJson(p_row)),
    },
    { status: 200 },
  );
}
