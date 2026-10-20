import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import { getMockSession } from "@/internal/db/mock-session";
import { Mission, type MissionListItem } from "@/models/mission";

export async function GET(p_request: Request): Promise<Response> {
  void p_request;
  const facade: SurfaceFacade = new SurfaceFacade();
  try {
    facade.assertPanel(getMockSession().role);
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const missions: MissionListItem[] = Mission.instance.list();
  return Response.json(
    {
      id: crypto.randomUUID(),
      missions,
    },
    { status: 200 },
  );
}
