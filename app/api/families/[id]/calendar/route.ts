import { DayComposite, type DayDocument } from "@/app/api/families/[id]/calendar/day-composite";
import { GpsPolicy } from "@/app/api/families/[id]/profile/gps-policy";
import { getFamilyRole } from "@/internal/db/mock-session";
import { Family } from "@/models/family";
import { FamilyCalendar, type FamilyCalendarRow } from "@/models/family_calendar";

type CalendarListRouteContext = {
  params: Promise<{ id: string }>;
};

export type CalendarAgendaPayload = {
  id: string;
  days: DayDocument[];
};

function deny(): Response {
  return Response.json({ error: "forbidden" }, { status: 403 });
}

export async function GET(
  p_request: Request,
  p_context: CalendarListRouteContext,
): Promise<Response> {
  void p_request;
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
  const rows: FamilyCalendarRow[] = FamilyCalendar.instance.listByFamily(familyId);
  const days: DayDocument[] = rows
    .map((p_row: FamilyCalendarRow): DayDocument => {
      return DayComposite.fromStored(p_row).toDocument();
    })
    .sort((p_a: DayDocument, p_b: DayDocument): number => {
      return p_a.day.localeCompare(p_b.day);
    });
  const payload: CalendarAgendaPayload = { id: familyId, days };
  return Response.json(payload, { status: 200 });
}
