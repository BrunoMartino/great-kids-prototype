import { GpsPolicy } from "@/app/api/families/[id]/profile/gps-policy";
import { getFamilyRole } from "@/internal/db/mock-session";
import { Family } from "@/models/family";
import { FamilyMission, type FamilyMissionClosing, type FamilyMissionRow } from "@/models/family_mission";

type FamilyRouteContext = {
  params: Promise<{ id: string }>;
};

type HistoryItem = {
  id: string;
  mission_id: string;
  status: "Completed";
  title: string;
  completed_at: string | null;
  closing: FamilyMissionClosing | null;
};

function deny(): Response {
  return Response.json({ error: "forbidden" }, { status: 403 });
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

function toHistoryItem(p_row: FamilyMissionRow): HistoryItem {
  return {
    id: p_row.id,
    mission_id: p_row.mission_id,
    status: "Completed",
    title: p_row.title ?? "",
    completed_at: p_row.completed_at,
    closing: parseStoredClosing(p_row.closing),
  };
}

export async function GET(
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
  const status: string | null = new URL(p_request.url).searchParams.get("status");
  if (status !== "Completed") {
    return Response.json({ error: "unprocessable" }, { status: 422 });
  }
  if (Family.instance.findHolderUserId(familyId) === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const rows: FamilyMissionRow[] = FamilyMission.instance.listCompleted(familyId);
  return Response.json(
    {
      id: familyId,
      missions: rows.map(toHistoryItem),
    },
    { status: 200 },
  );
}
