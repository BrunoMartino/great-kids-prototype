import { MarkDone, SuggestionNotFoundError } from "@/app/api/families/[id]/forecast/mark-done";
import { MissingTargetDayError, MoveDay } from "@/app/api/families/[id]/forecast/move-day";
import {
  RepeatCountObservable,
  RhythmProposalObserver,
  type RhythmProposal,
} from "@/app/api/families/[id]/forecast/rhythm-observer";
import { GpsPolicy } from "@/app/api/families/[id]/profile/gps-policy";
import { getFamilyRole } from "@/internal/db/mock-session";
import { Family } from "@/models/family";
import type { DayDocument } from "@/app/api/families/[id]/calendar/day-composite";

type SuggestionRouteContext = {
  params: Promise<{ id: string; day: string; sid: string }>;
};

function deny(): Response {
  return Response.json({ error: "forbidden" }, { status: 403 });
}

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

function propose(
  p_familyId: string,
  p_missionId: string,
  p_day: string,
): RhythmProposal | null {
  const observable: RepeatCountObservable = new RepeatCountObservable(
    p_familyId,
    p_missionId,
    p_day,
  );
  const observer: RhythmProposalObserver = new RhythmProposalObserver();
  observable.subscribe(observer);
  observable.notify();
  return observer.proposal;
}

export async function PATCH(
  p_request: Request,
  p_context: SuggestionRouteContext,
): Promise<Response> {
  const params: { id: string; day: string; sid: string } = await p_context.params;
  const familyId: string = params.id;
  const day: string = params.day;
  const sid: string = params.sid;
  try {
    GpsPolicy.assertCanEdit(getFamilyRole());
  } catch {
    return deny();
  }
  if (Family.instance.findHolderUserId(familyId) === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  let status: string = "";
  let targetDay: string = "";
  try {
    const parsed: unknown = await p_request.json();
    if (isRecord(parsed) && typeof parsed.status === "string") {
      status = parsed.status;
    }
    if (isRecord(parsed) && typeof parsed.target_day === "string") {
      targetDay = parsed.target_day;
    }
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  try {
    if (status === "done") {
      const source: DayDocument = new MarkDone(familyId, day, sid).execute();
      const missionId: string | undefined = source.suggestions.suggestions.find(
        (p_item: { id: string; mission_id: string }) => p_item.id === sid,
      )?.mission_id;
      const proposal: RhythmProposal | null =
        missionId === undefined ? null : propose(familyId, missionId, day);
      return Response.json({ days: [source], proposal }, { status: 200 });
    }
    if (status === "moved") {
      const command: MoveDay = new MoveDay(familyId, day, sid, targetDay);
      const source: DayDocument = command.execute();
      const days: DayDocument[] = [source];
      const target: DayDocument | null = command.targetDayDocument();
      if (target !== null) {
        days.push(target);
      }
      const missionId: string | undefined = source.suggestions.suggestions.find(
        (p_item: { id: string; mission_id: string }) => p_item.id === sid,
      )?.mission_id;
      const proposal: RhythmProposal | null =
        missionId === undefined ? null : propose(familyId, missionId, day);
      return Response.json({ days, proposal }, { status: 200 });
    }
    return Response.json({ error: "bad request" }, { status: 400 });
  } catch (p_error: unknown) {
    if (p_error instanceof MissingTargetDayError) {
      return Response.json({ error: "unprocessable" }, { status: 422 });
    }
    if (p_error instanceof SuggestionNotFoundError) {
      return Response.json({ error: "not found" }, { status: 404 });
    }
    throw p_error;
  }
}
