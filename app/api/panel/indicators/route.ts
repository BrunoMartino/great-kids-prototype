import { IndicatorsFacade, type IndicatorsRead } from "@/app/api/panel/indicators/indicators-facade";
import { SurfaceFacade } from "@/app/api/panel/surface-facade";
import { getMockSession } from "@/internal/db/mock-session";

export async function GET(p_request: Request): Promise<Response> {
  void p_request;
  const facade: SurfaceFacade = new SurfaceFacade();
  try {
    facade.assertPanel(getMockSession().role);
  } catch {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  const indicators: IndicatorsRead = new IndicatorsFacade().read();
  return Response.json(indicators, { status: 200 });
}
