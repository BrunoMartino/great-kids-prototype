import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  arrangeFamilyViaApi,
  familyRouteParams,
  FREE_PLAN_ID,
  jsonRequest,
} from "./helpers";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type SessionBody = {
  role: string;
  presentation: string;
};

type FamilyPlanRow = {
  plan_id: string | null;
};

type InviteCountRow = {
  n: number;
};

async function switchPresentation(p_role: "Parent" | "Child"): Promise<void> {
  const { POST } = await import("@/app/api/session/context/route");
  await POST(jsonRequest("/api/session/context", "POST", { role: p_role }));
}

describe("family writes honor presentation ContextPolicy", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("lets Parent presentation change the plan to Free", async () => {
    // Break: titular Parent presentation cannot PATCH plan (not 200 / not Free).
    const arranged = await arrangeFamilyViaApi();
    await switchPresentation("Parent");
    const { PATCH } = await import("@/app/api/families/[id]/plan/route");
    const response: Response = await PATCH(
      jsonRequest(
        `/api/families/${arranged.familyId}/plan`,
        "PATCH",
        { plan_id: FREE_PLAN_ID },
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(200);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: FamilyPlanRow[] = queryRaw<FamilyPlanRow>(
      "SELECT plan_id FROM family WHERE id = ?",
      [arranged.familyId],
    );
    expect(rows[0].plan_id).toBe(FREE_PLAN_ID);
  });

  it("returns 403 on invite POST when presentation is Child and keeps Child", async () => {
    // Break: Child presentation creates an invite (201) or leaves Parent.
    const arranged = await arrangeFamilyViaApi();
    await switchPresentation("Child");
    const { POST } = await import("@/app/api/families/[id]/invites/route");
    const response: Response = await POST(
      jsonRequest(
        `/api/families/${arranged.familyId}/invites`,
        "POST",
        { email: "pai@example.com", role: "Parent" },
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(403);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: InviteCountRow[] = queryRaw<InviteCountRow>(
      "SELECT count(*) AS n FROM family_invite WHERE family_id = ?",
      [arranged.familyId],
    );
    expect(rows[0].n).toBe(0);
    const { GET } = await import("@/app/api/session/route");
    const sessionResponse: Response = await GET(
      new Request("http://localhost/api/session"),
    );
    const session: SessionBody = (await sessionResponse.json()) as SessionBody;
    expect(sessionResponse.status).toBe(200);
    expect(session.role).toBe("Child");
    expect(session.presentation).toBe("child");
  });

  it("returns 401 on plan PATCH when the presentation session is cleared", async () => {
    // Break: missing presentation still writes plan as Parent (200).
    const arranged = await arrangeFamilyViaApi();
    const { DELETE } = await import("@/app/api/session/route");
    await DELETE(new Request("http://localhost/api/session", { method: "DELETE" }));
    const { PATCH } = await import("@/app/api/families/[id]/plan/route");
    const response: Response = await PATCH(
      jsonRequest(
        `/api/families/${arranged.familyId}/plan`,
        "PATCH",
        { plan_id: FREE_PLAN_ID },
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(401);
  });

  it("returns 403 on Child plan and members writes without persisting", async () => {
    // Break: Child presentation PATCHes plan or PUTs members (200) (INV-002).
    const arranged = await arrangeFamilyViaApi();
    await switchPresentation("Child");
    const { PATCH } = await import("@/app/api/families/[id]/plan/route");
    const planResponse: Response = await PATCH(
      jsonRequest(
        `/api/families/${arranged.familyId}/plan`,
        "PATCH",
        { plan_id: FREE_PLAN_ID },
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    expect(planResponse.status).toBe(403);
    const { queryRaw } = await import("@/internal/db/connection");
    const rows: FamilyPlanRow[] = queryRaw<FamilyPlanRow>(
      "SELECT plan_id FROM family WHERE id = ?",
      [arranged.familyId],
    );
    expect(rows[0].plan_id).toBeNull();
    const { PUT } = await import("@/app/api/families/[id]/members/route");
    const membersResponse: Response = await PUT(
      jsonRequest(
        `/api/families/${arranged.familyId}/members`,
        "PUT",
        {
          id: "members-env-leo",
          members: [{ user_id: null, user_nickname: "Leo", user_role: "Child" }],
        },
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    expect(membersResponse.status).toBe(403);
  });
});
