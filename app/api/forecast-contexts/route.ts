import { assertStaffOrDeny, StaffDeniedError } from "@/app/api/missions/staff-policy";
import { getMockSession } from "@/internal/db/mock-session";
import { ForecastContext, type ForecastContextRecord } from "@/models/forecast_context";

export async function GET(p_request: Request): Promise<Response> {
  void p_request;
  try {
    assertStaffOrDeny(getMockSession().role);
  } catch (p_error: unknown) {
    if (p_error instanceof StaffDeniedError) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
    throw p_error;
  }
  const contexts: ForecastContextRecord[] = ForecastContext.instance.list();
  return Response.json(
    {
      id: crypto.randomUUID(),
      contexts,
    },
    { status: 200 },
  );
}
