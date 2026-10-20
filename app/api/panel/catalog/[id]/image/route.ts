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
import { Mission, type MissionFiche } from "@/models/mission";

type RouteContext = {
  params: Promise<{ id: string }>;
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

export async function POST(p_request: Request, p_context: RouteContext): Promise<Response> {
  const denied: Response | null = assertStaff();
  if (denied !== null) {
    return denied;
  }
  const params: { id: string } = await p_context.params;
  const current: MissionFiche | null = Mission.instance.findById(params.id);
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
    const updated: MissionFiche | null = Mission.instance.update(params.id, { img_path: key });
    if (updated === null) {
      return Response.json({ error: "not found" }, { status: 404 });
    }
    return Response.json({ id: crypto.randomUUID(), mission: updated }, { status: 200 });
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
