import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import { getMockSession } from "@/internal/db/mock-session";
import { MissionCategory, type MissionCategoryRecord } from "@/models/mission_category";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CategoryPatchBody = {
  name?: string;
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

export async function PATCH(p_request: Request, p_context: RouteContext): Promise<Response> {
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const params: { id: string } = await p_context.params;
  const body: CategoryPatchBody = (await p_request.json()) as CategoryPatchBody;
  try {
    const updated: MissionCategoryRecord | null = MissionCategory.instance.updateName(
      params.id,
      body.name ?? "",
    );
    if (updated === null) {
      return Response.json({ error: "not found" }, { status: 404 });
    }
    return Response.json({ id: crypto.randomUUID(), category: updated }, { status: 200 });
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
