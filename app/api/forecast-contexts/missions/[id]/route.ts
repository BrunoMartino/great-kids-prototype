import { assertStaffOrDeny, StaffDeniedError } from "@/app/api/missions/staff-policy";
import { getMockSession } from "@/internal/db/mock-session";
import {
  DuplicateContextPairError,
  MissionForecastContext,
  UnknownContextError,
} from "@/models/mission_forecast_context";

type MissionRouteContext = {
  params: Promise<{ id: string }>;
};

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

export async function PUT(
  p_request: Request,
  p_context: MissionRouteContext,
): Promise<Response> {
  try {
    assertStaffOrDeny(getMockSession().role);
  } catch (p_error: unknown) {
    if (p_error instanceof StaffDeniedError) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
    throw p_error;
  }
  const params: { id: string } = await p_context.params;
  const missionId: string = params.id;
  const body: unknown = await p_request.json();
  if (!isRecord(body) || !Array.isArray(body.context_ids)) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  const contextIds: string[] = [];
  for (const item of body.context_ids) {
    if (typeof item !== "string") {
      return Response.json({ error: "bad request" }, { status: 400 });
    }
    contextIds.push(item);
  }
  try {
    MissionForecastContext.instance.replaceSet(missionId, contextIds);
    return Response.json(
      {
        id: missionId,
        context_ids: MissionForecastContext.instance.listContextIds(missionId),
      },
      { status: 200 },
    );
  } catch (p_error: unknown) {
    if (p_error instanceof DuplicateContextPairError) {
      return Response.json({ error: "conflict" }, { status: 409 });
    }
    if (p_error instanceof UnknownContextError) {
      return Response.json({ error: "bad request" }, { status: 400 });
    }
    return Response.json({ error: "bad request" }, { status: 400 });
  }
}
