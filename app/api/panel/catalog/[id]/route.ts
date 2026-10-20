import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import { getMockSession } from "@/internal/db/mock-session";
import { Mission, type MissionFiche, type MissionUpdateInput } from "@/models/mission";
import { MissionCategory } from "@/models/mission_category";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CatalogPatchBody = {
  title?: string;
  category_id?: string;
  description?: string;
  img_path?: string;
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

function notFound(): Response {
  return Response.json({ error: "not found" }, { status: 404 });
}

export async function PATCH(p_request: Request, p_context: RouteContext): Promise<Response> {
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const params: { id: string } = await p_context.params;
  const body: CatalogPatchBody = (await p_request.json()) as CatalogPatchBody;
  if (body.category_id !== undefined) {
    const category = MissionCategory.instance.findById(body.category_id);
    if (category === null) {
      return Response.json({ error: "bad request" }, { status: 400 });
    }
  }
  const input: MissionUpdateInput = {};
  if (body.title !== undefined) {
    input.title = body.title;
  }
  if (body.category_id !== undefined) {
    input.category_id = body.category_id;
  }
  if (body.description !== undefined) {
    input.description = body.description;
  }
  if (body.img_path !== undefined) {
    input.img_path = body.img_path;
  }
  const updated: MissionFiche | null = Mission.instance.update(params.id, input);
  if (updated === null) {
    return notFound();
  }
  return Response.json({ id: crypto.randomUUID(), mission: updated }, { status: 200 });
}

export async function DELETE(p_request: Request, p_context: RouteContext): Promise<Response> {
  void p_request;
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const params: { id: string } = await p_context.params;
  const deleted: boolean = Mission.instance.softDelete(params.id);
  if (!deleted) {
    return notFound();
  }
  return Response.json({ id: crypto.randomUUID(), mission: { deleted: true } }, { status: 200 });
}
