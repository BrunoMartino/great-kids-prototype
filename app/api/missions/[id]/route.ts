import { FicheBuildError, FicheBuilder, type FicheBuilt } from "@/app/api/missions/[id]/fiche-builder";
import { ReviewPolicy } from "@/app/api/missions/[id]/review-policy";
import { assertStaffOrDeny, StaffDeniedError } from "@/app/api/missions/staff-policy";
import { getMockSession } from "@/internal/db/mock-session";
import { Mission, type MissionFiche, type MissionUpdateInput } from "@/models/mission";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type FichePatchBody = {
  description?: string;
  img_path?: string;
  format?: string;
  type?: string;
  duration_minutes?: number;
  age_min?: number;
  age_max?: number;
  setting?: string;
  values?: { id: string; values: string[] } | string[];
};

const MISSION_TYPES: readonly string[] = [
  "Activity",
  "Quality-time",
  "Conversation",
  "Workout",
  "Faith-Time",
  "Money-Time",
];

const MISSION_FORMATS: readonly string[] = ["Quick-Win", "Signature", "Mission", "Say-What"];

const MISSION_SETTINGS: readonly string[] = ["Indoor", "Outdoor", "Either"];

function ficheEnvelope(p_fiche: MissionFiche): Response {
  return Response.json(
    {
      id: crypto.randomUUID(),
      mission: p_fiche,
    },
    { status: 200 },
  );
}

function notFound(): Response {
  return Response.json({ error: "not found" }, { status: 404 });
}

export async function GET(p_request: Request, p_context: RouteContext): Promise<Response> {
  void p_request;
  const params: { id: string } = await p_context.params;
  const fiche: MissionFiche | null = Mission.instance.findById(params.id);
  if (fiche === null) {
    return notFound();
  }
  if (!ReviewPolicy.canReadFiche(getMockSession().role, fiche)) {
    return notFound();
  }
  return ficheEnvelope(fiche);
}

export async function PATCH(p_request: Request, p_context: RouteContext): Promise<Response> {
  try {
    assertStaffOrDeny(getMockSession().role);
  } catch (p_error: unknown) {
    if (p_error instanceof StaffDeniedError) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
    throw p_error;
  }
  const params: { id: string } = await p_context.params;
  const current: MissionFiche | null = Mission.instance.findById(params.id);
  if (current === null) {
    return notFound();
  }
  const body: FichePatchBody = (await p_request.json()) as FichePatchBody;
  if (body.type !== undefined && !MISSION_TYPES.includes(body.type)) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  if (body.format !== undefined && !MISSION_FORMATS.includes(body.format)) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  if (body.setting !== undefined && !MISSION_SETTINGS.includes(body.setting)) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  let built: FicheBuilt;
  try {
    built = FicheBuilder.build({
      description: body.description,
      img_path: body.img_path,
      duration_minutes: body.duration_minutes,
      age_min: body.age_min,
      age_max: body.age_max,
      setting: body.setting,
      values: body.values,
    });
  } catch (p_error: unknown) {
    if (p_error instanceof FicheBuildError) {
      return Response.json({ error: "bad request" }, { status: 400 });
    }
    throw p_error;
  }
  const updateInput: MissionUpdateInput = {};
  if (built.description !== undefined) {
    updateInput.description = built.description;
  }
  if (built.img_path !== undefined) {
    updateInput.img_path = built.img_path;
  }
  if (built.duration_minutes !== undefined) {
    updateInput.duration_minutes = built.duration_minutes;
  }
  if (built.age_min !== undefined) {
    updateInput.age_min = built.age_min;
  }
  if (built.age_max !== undefined) {
    updateInput.age_max = built.age_max;
  }
  if (built.setting !== undefined) {
    updateInput.setting = built.setting;
  }
  if (built.values !== undefined && built.values !== null) {
    updateInput.values = built.values;
  }
  if (body.type !== undefined) {
    updateInput.type = body.type;
  }
  if (body.format !== undefined) {
    updateInput.format = body.format;
  }
  const updated: MissionFiche | null = Mission.instance.update(params.id, updateInput);
  if (updated === null) {
    return notFound();
  }
  return ficheEnvelope(updated);
}
