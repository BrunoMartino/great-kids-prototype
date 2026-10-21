import { GpsPolicy } from "@/app/api/families/[id]/profile/gps-policy";
import { getConnection, queryRaw } from "@/internal/db/connection";
import { getFamilyRole } from "@/internal/db/mock-session";
import { Family } from "@/models/family";
import { FamilyProfile, type GpsDocument, type RhythmsEnvelope } from "@/models/family_profile";

type FamilyRouteContext = {
  params: Promise<{ id: string }>;
};

type RhythmItem = {
  id: string;
  label: string;
  source_mission_id: string;
  weekday: string;
};

function deny(): Response {
  return Response.json({ error: "forbidden" }, { status: 403 });
}

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

function persistRhythms(p_profileId: string, p_envelope: RhythmsEnvelope): void {
  getConnection();
  const now: string = new Date().toISOString();
  queryRaw(`UPDATE family_profile SET rhythms = ?, updated_at = ? WHERE id = ?`, [
    JSON.stringify(p_envelope),
    now,
    p_profileId,
  ]);
}

export async function POST(
  p_request: Request,
  p_context: FamilyRouteContext,
): Promise<Response> {
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  try {
    GpsPolicy.assertCanEdit(getFamilyRole());
  } catch {
    return deny();
  }
  if (Family.instance.findHolderUserId(familyId) === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const current: GpsDocument | null = FamilyProfile.instance.findByFamilyId(familyId);
  if (current === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  let parsed: unknown;
  try {
    parsed = await p_request.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  if (!isRecord(parsed)) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  if (parsed.dismissed === true) {
    return Response.json(current.rhythms, { status: 200 });
  }
  if (
    typeof parsed.source_mission_id !== "string" ||
    typeof parsed.label !== "string" ||
    typeof parsed.weekday !== "string"
  ) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  const item: RhythmItem = {
    id: crypto.randomUUID(),
    label: parsed.label,
    source_mission_id: parsed.source_mission_id,
    weekday: parsed.weekday,
  };
  const next: RhythmsEnvelope = {
    id: current.rhythms.id,
    rhythms: [...current.rhythms.rhythms, item],
  };
  persistRhythms(current.id, next);
  return Response.json(next, { status: 200 });
}
