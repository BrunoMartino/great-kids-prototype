import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import { getMockSession } from "@/internal/db/mock-session";
import { MissionCategory, type MissionCategoryRecord } from "@/models/mission_category";

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
  const categories: MissionCategoryRecord[] = MissionCategory.instance.list();
  return Response.json({ id: crypto.randomUUID(), categories }, { status: 200 });
}
