import { DraftMissionFactory } from "@/app/api/missions/mission-factory";
import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import { getMockSession } from "@/internal/db/mock-session";
import { Mission, type MissionListItem } from "@/models/mission";

type MissionPostBody = {
  category_id?: string;
  title?: string;
};

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
  const missions: MissionListItem[] = Mission.instance.list();
  return Response.json(
    {
      id: crypto.randomUUID(),
      missions,
    },
    { status: 200 },
  );
}

export async function POST(p_request: Request): Promise<Response> {
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const body: MissionPostBody = (await p_request.json()) as MissionPostBody;
  try {
    const factory: DraftMissionFactory = new DraftMissionFactory();
    const created: MissionListItem = await factory.create({
      category_id: body.category_id,
      title: body.title,
    });
    return Response.json(
      {
        id: crypto.randomUUID(),
        mission: {
          id: created.id,
          category_id: created.category_id,
          review_status: created.review_status,
        },
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
