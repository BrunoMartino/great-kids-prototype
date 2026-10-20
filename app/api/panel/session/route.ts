import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import { getMockSession, type MockRole } from "@/internal/db/mock-session";

type SessionPostBody = {
  role?: string;
};

function isMockRole(p_role: string): p_role is MockRole {
  return (
    p_role === "Admin" ||
    p_role === "Operator" ||
    p_role === "Parent" ||
    p_role === "Child"
  );
}

export async function GET(p_request: Request): Promise<Response> {
  void p_request;
  const facade: SurfaceFacade = new SurfaceFacade();
  try {
    facade.assertPanel(getMockSession().role);
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  return Response.json({ role: getMockSession().role }, { status: 200 });
}

export async function POST(p_request: Request): Promise<Response> {
  try {
    const body: SessionPostBody = (await p_request.json()) as SessionPostBody;
    const role: string = body.role ?? "";
    if (!isMockRole(role)) {
      return Response.json({ error: "bad request" }, { status: 400 });
    }
    getMockSession().role = role;
    return Response.json({ role: getMockSession().role }, { status: 200 });
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
