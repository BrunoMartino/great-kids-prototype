import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  arrangeFamilyViaApi,
  arrangeSecondParent,
  familyRouteParams,
  FREE_PLAN_ID,
  jsonRequest,
} from "./helpers";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type PanelFamily = {
  id: string;
  status: string;
  plan: { id: string; name: string | null; status: string } | null;
  invites: Array<{ id: string; email: string; status: string }>;
};

type PanelEnvelope = {
  id: string;
  families: PanelFamily[];
};

type PlanPatchBody = {
  id: string;
  plan_id: string;
};

describe("panel families and family plan routes", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("lists families for Operator and shows Free after a plan PATCH", async () => {
    // Break: GET is not the { id, families } envelope, or plan/invites stay empty after writes.
    const arranged = await arrangeFamilyViaApi();
    const { FamilyInvite } = await import("@/models/family_invite");
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Operator";
    const { GET } = await import("@/app/api/panel/families/route");
    const firstResponse: Response = await GET(jsonRequest("/api/panel/families", "GET"));
    const firstBody: PanelEnvelope = (await firstResponse.json()) as PanelEnvelope;
    expect(firstResponse.status).toBe(200);
    expect(typeof firstBody.id).toBe("string");
    expect(firstBody.families).toHaveLength(1);
    expect(firstBody.families[0].id).toBe(arranged.familyId);
    expect(firstBody.families[0].status).toBe("active");
    expect(firstBody.families[0].invites).toEqual([]);
    expect(
      firstBody.families[0].plan === null || firstBody.families[0].plan.name === null,
    ).toBe(true);
    FamilyInvite.instance.create({
      family_id: arranged.familyId,
      email: "pai@example.com",
      role: "Parent",
      token_hash: "hash-panel-1",
      expires_at: "2099-01-01T00:00:00.000Z",
    });
    const { PATCH } = await import("@/app/api/panel/families/[id]/plan/route");
    const patchResponse: Response = await PATCH(
      jsonRequest(
        `/api/panel/families/${arranged.familyId}/plan`,
        "PATCH",
        { plan_id: FREE_PLAN_ID },
      ),
      familyRouteParams(arranged.familyId),
    );
    expect(patchResponse.status).toBe(200);
    const secondResponse: Response = await GET(jsonRequest("/api/panel/families", "GET"));
    const secondBody: PanelEnvelope = (await secondResponse.json()) as PanelEnvelope;
    expect(secondBody.families[0].plan?.name).toBe("Free");
    expect(secondBody.families[0].plan?.id).toBe(FREE_PLAN_ID);
    expect(secondBody.families[0].invites).toHaveLength(1);
    expect(secondBody.families[0].invites[0].status).toBe("Pending");
  });

  it("rejects Parent GET and PATCH on the panel with 403", async () => {
    // Break: Parent reads or patches panel families (200).
    const arranged = await arrangeFamilyViaApi();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
    const { GET } = await import("@/app/api/panel/families/route");
    const getResponse: Response = await GET(jsonRequest("/api/panel/families", "GET"));
    expect(getResponse.status).toBe(403);
    const { PATCH } = await import("@/app/api/panel/families/[id]/plan/route");
    const patchResponse: Response = await PATCH(
      jsonRequest(
        `/api/panel/families/${arranged.familyId}/plan`,
        "PATCH",
        { plan_id: FREE_PLAN_ID },
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    expect(patchResponse.status).toBe(403);
  });

  it("rejects an invited Parent PATCH on the family plan with 403", async () => {
    // Break: invited Parent changes the family plan (200).
    const arranged = await arrangeFamilyViaApi();
    const invited = await arrangeSecondParent();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
    const { PATCH } = await import("@/app/api/families/[id]/plan/route");
    const response: Response = await PATCH(
      jsonRequest(
        `/api/families/${arranged.familyId}/plan`,
        "PATCH",
        { plan_id: FREE_PLAN_ID },
        invited.id,
      ),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(403);
  });

  it("returns 404 for an unknown panel plan_id and 200 when the titular sets Free", async () => {
    // Break: unknown plan_id is stored, or titular Parent cannot PATCH family plan to Free.
    const arranged = await arrangeFamilyViaApi();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Operator";
    const { PATCH: patchPanel } = await import("@/app/api/panel/families/[id]/plan/route");
    const unknownResponse: Response = await patchPanel(
      jsonRequest(
        `/api/panel/families/${arranged.familyId}/plan`,
        "PATCH",
        { plan_id: "00000000-0000-4000-8000-000000000099" },
      ),
      familyRouteParams(arranged.familyId),
    );
    expect(unknownResponse.status).toBe(404);
    getMockSession().role = "Parent";
    const { PATCH: patchFamily } = await import("@/app/api/families/[id]/plan/route");
    const titularResponse: Response = await patchFamily(
      jsonRequest(
        `/api/families/${arranged.familyId}/plan`,
        "PATCH",
        { plan_id: FREE_PLAN_ID },
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    const body: PlanPatchBody = (await titularResponse.json()) as PlanPatchBody;
    expect(titularResponse.status).toBe(200);
    expect(body.id).toBe(arranged.familyId);
    expect(body.plan_id).toBe(FREE_PLAN_ID);
  });
});
