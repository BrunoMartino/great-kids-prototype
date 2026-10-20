import { DropOnDay, MissingDayError } from "@/app/api/families/[id]/forecast/drop-on-day";
import {
  WeekListStrategy,
  type WeekSuggestion,
} from "@/app/api/families/[id]/forecast/week-list-strategy";
import { UnpublishedMissionError } from "@/app/api/families/[id]/calendar/schedule-on-day";
import { GpsPolicy } from "@/app/api/families/[id]/profile/gps-policy";
import { getMockSession } from "@/internal/db/mock-session";
import { Family } from "@/models/family";

type FamilyRouteContext = {
  params: Promise<{ id: string }>;
};

function deny(): Response {
  return Response.json({ error: "forbidden" }, { status: 403 });
}

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

export async function GET(
  p_request: Request,
  p_context: FamilyRouteContext,
): Promise<Response> {
  void p_request;
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  try {
    GpsPolicy.assertCanEdit(getMockSession().role);
  } catch {
    return deny();
  }
  if (Family.instance.findHolderUserId(familyId) === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const suggestions: WeekSuggestion[] = new WeekListStrategy().list({ familyId });
  return Response.json({ id: crypto.randomUUID(), suggestions }, { status: 200 });
}

export async function POST(
  p_request: Request,
  p_context: FamilyRouteContext,
): Promise<Response> {
  const params: { id: string } = await p_context.params;
  const familyId: string = params.id;
  try {
    GpsPolicy.assertCanEdit(getMockSession().role);
  } catch {
    return deny();
  }
  if (Family.instance.findHolderUserId(familyId) === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  let day: string = "";
  let missionId: string = "";
  try {
    const parsed: unknown = await p_request.json();
    if (isRecord(parsed) && typeof parsed.day === "string") {
      day = parsed.day;
    }
    if (isRecord(parsed) && typeof parsed.mission_id === "string") {
      missionId = parsed.mission_id;
    }
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  try {
    const stored = new DropOnDay(familyId, day, missionId).execute();
    return Response.json(stored, { status: 200 });
  } catch (p_error: unknown) {
    if (p_error instanceof MissingDayError || p_error instanceof UnpublishedMissionError) {
      return Response.json({ error: "unprocessable" }, { status: 422 });
    }
    throw p_error;
  }
}
