import {
  parseSuggestionsEnvelope,
  DayComposite,
  type DayDocument,
  type SuggestionsEnvelope,
} from "@/app/api/families/[id]/calendar/day-composite";
import {
  ScheduleOnDay,
  UniqueDayError,
  UnpublishedMissionError,
} from "@/app/api/families/[id]/calendar/schedule-on-day";
import { GpsPolicy } from "@/app/api/families/[id]/profile/gps-policy";
import { getMockSession } from "@/internal/db/mock-session";
import { Family } from "@/models/family";
import { FamilyCalendar } from "@/models/family_calendar";

type CalendarRouteContext = {
  params: Promise<{ id: string; day: string }>;
};

type CalendarPutBody = {
  suggestions?: unknown;
  previous_weather?: string | null;
  notifications?: boolean;
};

function deny(): Response {
  return Response.json({ error: "forbidden" }, { status: 403 });
}

function badRequest(): Response {
  return Response.json({ error: "bad request" }, { status: 400 });
}

export async function GET(
  p_request: Request,
  p_context: CalendarRouteContext,
): Promise<Response> {
  void p_request;
  const params: { id: string; day: string } = await p_context.params;
  const familyId: string = params.id;
  const day: string = params.day;
  try {
    GpsPolicy.assertCanEdit(getMockSession().role);
  } catch {
    return deny();
  }
  if (Family.instance.findHolderUserId(familyId) === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const row = FamilyCalendar.instance.findByFamilyDay(familyId, day);
  if (row === null) {
    const empty: DayDocument = DayComposite.empty(familyId, day).toDocument();
    return Response.json(empty, { status: 200 });
  }
  return Response.json(DayComposite.fromStored(row).toDocument(), { status: 200 });
}

export async function PUT(
  p_request: Request,
  p_context: CalendarRouteContext,
): Promise<Response> {
  const params: { id: string; day: string } = await p_context.params;
  const familyId: string = params.id;
  const day: string = params.day;
  try {
    GpsPolicy.assertCanEdit(getMockSession().role);
  } catch {
    return deny();
  }
  if (Family.instance.findHolderUserId(familyId) === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  let body: CalendarPutBody;
  try {
    body = (await p_request.json()) as CalendarPutBody;
  } catch {
    return badRequest();
  }
  let envelope: SuggestionsEnvelope;
  try {
    envelope = parseSuggestionsEnvelope(body.suggestions);
  } catch {
    return badRequest();
  }
  const previousWeather: string | null =
    typeof body.previous_weather === "string" ? body.previous_weather : null;
  const notifications: boolean = body.notifications === true;
  try {
    const command: ScheduleOnDay = new ScheduleOnDay(
      familyId,
      day,
      envelope,
      previousWeather,
      notifications,
    );
    const stored: DayDocument = command.execute();
    return Response.json(stored, { status: 200 });
  } catch (p_error: unknown) {
    if (p_error instanceof UniqueDayError) {
      return Response.json({ error: "conflict" }, { status: 409 });
    }
    if (p_error instanceof UnpublishedMissionError) {
      return Response.json({ error: "unpublished" }, { status: 422 });
    }
    return badRequest();
  }
}
