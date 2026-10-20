import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import { getMockSession } from "@/internal/db/mock-session";
import {
  EmptyUploadError,
  ForbiddenObjectKeyError,
  parseUploadFile,
  RejectedUploadTypeError,
  type ParsedUpload,
} from "@/internal/storage/object-store";
import { ObjectStoreFactory } from "@/internal/storage/object-store-factory";
import {
  CuratedMaterial,
  type CuratedMaterialRecord,
} from "@/models/curated_material";

type RouteContext = {
  params: Promise<{ id: string }>;
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

export async function POST(p_request: Request, p_context: RouteContext): Promise<Response> {
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const params: { id: string } = await p_context.params;
  const current: CuratedMaterialRecord | null = CuratedMaterial.instance.findById(params.id);
  if (current === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  try {
    const upload: ParsedUpload = await parseUploadFile(p_request);
    const key: string = await ObjectStoreFactory.create().put(
      upload.fileName,
      upload.bytes,
      upload.contentType,
    );
    const field: "feat_img_path" | "file_path" = upload.contentType.startsWith("image/")
      ? "feat_img_path"
      : "file_path";
    const updated: CuratedMaterialRecord | null = CuratedMaterial.instance.update(params.id, {
      [field]: key,
    });
    if (updated === null) {
      return Response.json({ error: "not found" }, { status: 404 });
    }
    return Response.json(
      { id: crypto.randomUUID(), material: toMaterialJson(updated) },
      { status: 200 },
    );
  } catch (p_error: unknown) {
    if (
      p_error instanceof EmptyUploadError ||
      p_error instanceof RejectedUploadTypeError ||
      p_error instanceof ForbiddenObjectKeyError
    ) {
      return Response.json({ error: "bad request" }, { status: 400 });
    }
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
