import {
  IllegalReviewTransitionError,
  ReviewState,
} from "@/app/api/missions/[id]/review-state";
import { assertStaffOrDeny, StaffDeniedError } from "@/app/api/missions/staff-policy";
import { getMockSession } from "@/internal/db/mock-session";
import { Mission, type MissionFiche } from "@/models/mission";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ReviewPostBody = {
  review_status?: string;
};

export async function POST(p_request: Request, p_context: RouteContext): Promise<Response> {
  try {
    assertStaffOrDeny(getMockSession().role);
  } catch (p_error: unknown) {
    if (p_error instanceof StaffDeniedError) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
    throw p_error;
  }
  const params: { id: string } = await p_context.params;
  const current: MissionFiche | null = Mission.instance.findById(params.id);
  if (current === null) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const body: ReviewPostBody = (await p_request.json()) as ReviewPostBody;
  if (body.review_status === undefined) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  let nextStatus: string;
  try {
    nextStatus = ReviewState.transition(current.review_status, body.review_status);
  } catch (p_error: unknown) {
    if (p_error instanceof IllegalReviewTransitionError) {
      return Response.json({ error: "conflict" }, { status: 409 });
    }
    throw p_error;
  }
  Mission.instance.updateReviewStatus(params.id, nextStatus);
  return Response.json(
    {
      id: crypto.randomUUID(),
      mission: {
        id: params.id,
        review_status: nextStatus,
      },
    },
    { status: 200 },
  );
}
