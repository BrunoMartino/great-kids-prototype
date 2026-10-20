import { DraftMissionFactory } from "@/app/api/missions/mission-factory";
import { assertStaffOrDeny, StaffDeniedError } from "@/app/api/missions/staff-policy";
import { getMockSession } from "@/internal/db/mock-session";
import { Mission } from "@/models/mission";

type MissionPostBody = {
  category_id?: string;
  title?: string;
};

export async function GET(p_request: Request): Promise<Response> {
  try {
    assertStaffOrDeny(getMockSession().role);
  } catch (p_error: unknown) {
    if (p_error instanceof StaffDeniedError) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
    throw p_error;
  }
  const url: URL = new URL(p_request.url);
  const categoryId: string | null = url.searchParams.get("category_id");
  const missions = Mission.instance.list(categoryId ?? undefined);
  return Response.json(
    {
      id: crypto.randomUUID(),
      missions,
    },
    { status: 200 },
  );
}

export async function POST(p_request: Request): Promise<Response> {
  try {
    assertStaffOrDeny(getMockSession().role);
  } catch (p_error: unknown) {
    if (p_error instanceof StaffDeniedError) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
    throw p_error;
  }
  const body: MissionPostBody = (await p_request.json()) as MissionPostBody;
  try {
    const factory: DraftMissionFactory = new DraftMissionFactory();
    const created = await factory.create({
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
  } catch (p_error: unknown) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
