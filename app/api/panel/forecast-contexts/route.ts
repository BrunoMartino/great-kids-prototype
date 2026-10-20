import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import { getMockSession } from "@/internal/db/mock-session";
import { ForecastContext, type ForecastContextRecord } from "@/models/forecast_context";

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
  const contexts: ForecastContextRecord[] = ForecastContext.instance.list();
  return Response.json({ id: crypto.randomUUID(), contexts }, { status: 200 });
}
