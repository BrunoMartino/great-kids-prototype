import { CompleteMissionCommand, MissingClosingError } from "@/app/api/family-missions/complete-mission-command";
import {
  FamilyMissionCycle,
  IllegalCycleTransitionError,
} from "@/app/api/family-missions/mission-cycle";
import {
  CycleNotFoundError,
  NonRepeatableCycleError,
  StartDoingCommand,
} from "@/app/api/family-missions/start-doing-command";
import { GpsPolicy } from "@/app/api/families/[id]/profile/gps-policy";
import { getFamilyRole } from "@/internal/db/mock-session";
import { FamilyMission, type FamilyMissionClosing, type FamilyMissionRow } from "@/models/family_mission";

type CycleRouteContext = {
  params: Promise<{ id: string }>;
};

function deny(): Response {
  return Response.json({ error: "forbidden" }, { status: 403 });
}

function unprocessable(): Response {
  return Response.json({ error: "unprocessable" }, { status: 422 });
}

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

function parseStoredClosing(p_closing: string | null): FamilyMissionClosing | null {
  if (p_closing === null) {
    return null;
  }
  const parsed: unknown = JSON.parse(p_closing);
  if (
    !isRecord(parsed) ||
    typeof parsed.do_again !== "boolean" ||
    typeof parsed.save_memory !== "boolean"
  ) {
    return null;
  }
  return { do_again: parsed.do_again, save_memory: parsed.save_memory };
}

function toPayload(p_row: FamilyMissionRow): {
  id: string;
  fam_id: string;
  mission_id: string;
  status: string;
  closing: FamilyMissionClosing | null;
} {
  return {
    id: p_row.id,
    fam_id: p_row.fam_id,
    mission_id: p_row.mission_id,
    status: p_row.status,
    closing: parseStoredClosing(p_row.closing),
  };
}

export async function PATCH(
  p_request: Request,
  p_context: CycleRouteContext,
): Promise<Response> {
  const params: { id: string } = await p_context.params;
  const cycleId: string = params.id;
  try {
    GpsPolicy.assertCanEdit(getFamilyRole());
  } catch {
    return deny();
  }
  let status: string = "";
  let closing: unknown = undefined;
  try {
    const parsed: unknown = await p_request.json();
    if (isRecord(parsed) && typeof parsed.status === "string") {
      status = parsed.status;
    }
    if (isRecord(parsed) && "closing" in parsed) {
      closing = parsed.closing;
    }
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  try {
    if (status === "Doing") {
      const stored: FamilyMissionRow = new StartDoingCommand(cycleId).execute();
      return Response.json(toPayload(stored), { status: 200 });
    }
    if (status === "Completed") {
      const stored: FamilyMissionRow = new CompleteMissionCommand(cycleId, closing).execute();
      return Response.json(toPayload(stored), { status: 200 });
    }
    if (status === "Accepted") {
      const row: FamilyMissionRow | null = FamilyMission.instance.findById(cycleId);
      if (row === null) {
        throw new CycleNotFoundError();
      }
      new FamilyMissionCycle(row.status).accept();
    }
    return unprocessable();
  } catch (p_error: unknown) {
    if (p_error instanceof CycleNotFoundError) {
      return Response.json({ error: "not found" }, { status: 404 });
    }
    if (
      p_error instanceof IllegalCycleTransitionError ||
      p_error instanceof NonRepeatableCycleError ||
      p_error instanceof MissingClosingError
    ) {
      return unprocessable();
    }
    throw p_error;
  }
}
