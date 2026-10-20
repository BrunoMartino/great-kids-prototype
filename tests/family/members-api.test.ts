import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  arrangeFamilyViaApi,
  arrangeSecondParent,
  familyRouteParams,
  jsonRequest,
} from "./helpers";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type MembersEnvelope = {
  id: string;
  members: Array<{
    user_id: string | null;
    user_nickname: string;
    user_role: string;
    photo?: string;
  }>;
};

describe("PUT /api/families/[id]/members", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns the members envelope for the titular", async () => {
    // Break: not 200 or envelope shape drifts from { id, members: [Leo Child] }.
    const arranged = await arrangeFamilyViaApi();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
    const { PUT } = await import("@/app/api/families/[id]/members/route");
    const payload: MembersEnvelope = {
      id: "members-env-leo",
      members: [{ user_id: null, user_nickname: "Leo", user_role: "Child" }],
    };
    const response: Response = await PUT(
      jsonRequest(
        `/api/families/${arranged.familyId}/members`,
        "PUT",
        payload,
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    const body: MembersEnvelope = (await response.json()) as MembersEnvelope;
    expect(response.status).toBe(200);
    expect(body.id).toBe("members-env-leo");
    expect(body.members).toEqual([
      { user_id: null, user_nickname: "Leo", user_role: "Child" },
    ]);
  });

  it("rejects a photo field with 400", async () => {
    // Break: photo field is accepted (201/200) (INV-002).
    const arranged = await arrangeFamilyViaApi();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
    const { PUT } = await import("@/app/api/families/[id]/members/route");
    const response: Response = await PUT(
      jsonRequest(
        `/api/families/${arranged.familyId}/members`,
        "PUT",
        {
          id: "members-env-photo",
          members: [
            { user_id: null, user_nickname: "Leo", user_role: "Child", photo: "x" },
          ],
        },
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(400);
  });

  it("rejects a non-titular PUT with 403", async () => {
    // Break: non-titular Parent rewrites members (200).
    const arranged = await arrangeFamilyViaApi();
    const outsider = await arrangeSecondParent();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
    const { PUT } = await import("@/app/api/families/[id]/members/route");
    const response: Response = await PUT(
      jsonRequest(
        `/api/families/${arranged.familyId}/members`,
        "PUT",
        {
          id: "members-env-leo",
          members: [{ user_id: null, user_nickname: "Leo", user_role: "Child" }],
        },
        outsider.id,
      ),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(403);
  });

  it("rejects a bare array body with 400", async () => {
    // Break: bare [] is stored (INV-004).
    const arranged = await arrangeFamilyViaApi();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
    const { PUT } = await import("@/app/api/families/[id]/members/route");
    const response: Response = await PUT(
      jsonRequest(
        `/api/families/${arranged.familyId}/members`,
        "PUT",
        [],
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(400);
  });
});
