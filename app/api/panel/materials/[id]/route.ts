import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import { getMockSession } from "@/internal/db/mock-session";
import {
  CuratedMaterial,
  type CuratedMaterialRecord,
  type CuratedMaterialUpdateInput,
} from "@/models/curated_material";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type MaterialPatchBody = {
  type?: string;
  title?: string;
  description?: string | null;
  status?: string;
};

type MaterialJson = {
  id: string;
  type: string;
  title: string;
  status: string;
  description: string | null;
  feat_img_path: string | null;
  file_path: string | null;
  deleted: boolean;
};

function toMaterialJson(p_row: CuratedMaterialRecord): MaterialJson {
  return {
    id: p_row.id,
    type: p_row.type,
    title: p_row.title,
    status: p_row.status,
    description: p_row.description,
    feat_img_path: p_row.feat_img_path,
    file_path: p_row.file_path,
    deleted: p_row.deleted === 1,
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

function notFound(): Response {
  return Response.json({ error: "not found" }, { status: 404 });
}

export async function GET(p_request: Request, p_context: RouteContext): Promise<Response> {
  void p_request;
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const params: { id: string } = await p_context.params;
  const row: CuratedMaterialRecord | null = CuratedMaterial.instance.findById(params.id);
  if (row === null) {
    return notFound();
  }
  return Response.json({ id: crypto.randomUUID(), material: toMaterialJson(row) }, { status: 200 });
}

export async function PATCH(p_request: Request, p_context: RouteContext): Promise<Response> {
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const params: { id: string } = await p_context.params;
  const body: MaterialPatchBody = (await p_request.json()) as MaterialPatchBody;
  const input: CuratedMaterialUpdateInput = {};
  if (body.type !== undefined) {
    input.type = body.type;
  }
  if (body.title !== undefined) {
    input.title = body.title;
  }
  if (body.description !== undefined) {
    input.description = body.description;
  }
  if (body.status !== undefined) {
    input.status = body.status;
  }
  try {
    const updated: CuratedMaterialRecord | null = CuratedMaterial.instance.update(params.id, input);
    if (updated === null) {
      return notFound();
    }
    return Response.json(
      { id: crypto.randomUUID(), material: toMaterialJson(updated) },
      { status: 200 },
    );
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}

export async function DELETE(p_request: Request, p_context: RouteContext): Promise<Response> {
  void p_request;
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const params: { id: string } = await p_context.params;
  const deleted: CuratedMaterialRecord | null = CuratedMaterial.instance.softDelete(params.id);
  if (deleted === null) {
    return notFound();
  }
  return Response.json(
    { id: crypto.randomUUID(), material: toMaterialJson(deleted) },
    { status: 200 },
  );
}
