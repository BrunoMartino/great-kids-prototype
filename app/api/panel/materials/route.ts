import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import { getMockSession } from "@/internal/db/mock-session";
import {
  CuratedMaterial,
  type CuratedMaterialRecord,
} from "@/models/curated_material";

type MaterialPostBody = {
  type?: string;
  title?: string;
  description?: string;
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

export async function GET(p_request: Request): Promise<Response> {
  void p_request;
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const rows: CuratedMaterialRecord[] = CuratedMaterial.instance.list();
  return Response.json(
    {
      id: crypto.randomUUID(),
      materials: rows.map((p_row: CuratedMaterialRecord) => toMaterialJson(p_row)),
    },
    { status: 200 },
  );
}

export async function POST(p_request: Request): Promise<Response> {
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const body: MaterialPostBody = (await p_request.json()) as MaterialPostBody;
  try {
    const created: CuratedMaterialRecord = CuratedMaterial.instance.create({
      type: body.type ?? "",
      title: body.title ?? "",
      description: body.description ?? null,
      status: body.status,
    });
    return Response.json(
      { id: crypto.randomUUID(), material: toMaterialJson(created) },
      { status: 201 },
    );
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
