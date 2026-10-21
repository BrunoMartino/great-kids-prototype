import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import {
  getStaffRole,
  setStaffRole,
  type StaffRole,
} from "@/internal/db/mock-session";

type SessionPostBody = {
  role?: string;
};

function isStaffRole(p_role: string): p_role is StaffRole {
  return p_role === "Admin" || p_role === "Operator";
}

export async function GET(p_request: Request): Promise<Response> {
  void p_request;
  const staffRole: StaffRole | null = getStaffRole();
  if (staffRole === null) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const facade: SurfaceFacade = new SurfaceFacade();
  try {
    facade.assertPanel(staffRole);
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  return Response.json({ role: staffRole }, { status: 200 });
}

export async function POST(p_request: Request): Promise<Response> {
  try {
    const body: SessionPostBody = (await p_request.json()) as SessionPostBody;
    const role: string = body.role ?? "";
    if (!isStaffRole(role)) {
      return Response.json({ error: "bad request" }, { status: 400 });
    }
    setStaffRole(role);
    return Response.json({ role }, { status: 200 });
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
