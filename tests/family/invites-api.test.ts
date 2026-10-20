import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  arrangeFamilyViaApi,
  arrangeSecondParent,
  familyRouteParams,
  jsonRequest,
} from "./helpers";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type InviteCreated = {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  token?: string;
};

type InvitePatched = {
  status: string;
};

type FamilyMembersRow = {
  family_members: string;
};

type MembersEnvelope = {
  id: string;
  members: Array<{ user_id: string | null; user_nickname: string; user_role: string }>;
};

describe("POST/PATCH /api/families/[id]/invites", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("creates a Pending invite for the titular Parent", async () => {
    // Break: not 201, status not Pending, or raw token leaked in the body.
    const arranged = await arrangeFamilyViaApi();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
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
    const body: InviteCreated = (await response.json()) as InviteCreated;
    expect(response.status).toBe(201);
    expect(body.email).toBe("pai@example.com");
    expect(body.role).toBe("Parent");
    expect(body.status).toBe("Pending");
    expect(typeof body.id).toBe("string");
    expect(typeof body.expires_at).toBe("string");
    expect(Object.prototype.hasOwnProperty.call(body, "token")).toBe(false);
  });

  it("accepts an unexpired invite and revokes another", async () => {
    // Break: accept is not 200 Accepted, members stay length 1, or revoke is not Revoked.
    const arranged = await arrangeFamilyViaApi();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
    const { POST, PATCH } = await import("@/app/api/families/[id]/invites/route");
    const { queryRaw } = await import("@/internal/db/connection");
    const createdResponse: Response = await POST(
      jsonRequest(
        `/api/families/${arranged.familyId}/invites`,
        "POST",
        { email: "pai@example.com", role: "Parent" },
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    const created: InviteCreated = (await createdResponse.json()) as InviteCreated;
    const acceptResponse: Response = await PATCH(
      jsonRequest(
        `/api/families/${arranged.familyId}/invites`,
        "PATCH",
        { id: created.id, action: "accept" },
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    const accepted: InvitePatched = (await acceptResponse.json()) as InvitePatched;
    expect(acceptResponse.status).toBe(200);
    expect(accepted.status).toBe("Accepted");
    const memberRows: FamilyMembersRow[] = queryRaw<FamilyMembersRow>(
      "SELECT family_members FROM family WHERE id = ?",
      [arranged.familyId],
    );
    const envelope: MembersEnvelope = JSON.parse(
      memberRows[0].family_members,
    ) as MembersEnvelope;
    expect(envelope.members.length).toBeGreaterThanOrEqual(2);
    const parentMember = envelope.members.find((p_member) => p_member.user_role === "Parent");
    expect(parentMember).toBeDefined();
    const revokeCreatedResponse: Response = await POST(
      jsonRequest(
        `/api/families/${arranged.familyId}/invites`,
        "POST",
        { email: "tia@example.com", role: "Parent" },
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    const toRevoke: InviteCreated = (await revokeCreatedResponse.json()) as InviteCreated;
    const revokeResponse: Response = await PATCH(
      jsonRequest(
        `/api/families/${arranged.familyId}/invites`,
        "PATCH",
        { id: toRevoke.id, action: "revoke" },
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    const revoked: InvitePatched = (await revokeResponse.json()) as InvitePatched;
    expect(revokeResponse.status).toBe(200);
    expect(revoked.status).toBe("Revoked");
  });

  it("rejects a non-titular POST with 403", async () => {
    // Break: a Parent who is not in the family can invite (201).
    const arranged = await arrangeFamilyViaApi();
    const outsider = await arrangeSecondParent();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
    const { POST } = await import("@/app/api/families/[id]/invites/route");
    const response: Response = await POST(
      jsonRequest(
        `/api/families/${arranged.familyId}/invites`,
        "POST",
        { email: "intruso@example.com", role: "Parent" },
        outsider.id,
      ),
      familyRouteParams(arranged.familyId),
    );
    expect(response.status).toBe(403);
  });

  it("returns 409 Expired on accept after expiry and does not add members", async () => {
    // Break: expired accept joins (200) or members length becomes 2.
    const arranged = await arrangeFamilyViaApi();
    const { getMockSession } = await import("@/internal/db/mock-session");
    getMockSession().role = "Parent";
    const { POST, PATCH } = await import("@/app/api/families/[id]/invites/route");
    const { queryRaw } = await import("@/internal/db/connection");
    const createdResponse: Response = await POST(
      jsonRequest(
        `/api/families/${arranged.familyId}/invites`,
        "POST",
        { email: "pai@example.com", role: "Parent" },
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    const created: InviteCreated = (await createdResponse.json()) as InviteCreated;
    queryRaw("UPDATE family_invite SET expires_at = ? WHERE id = ?", [
      "2020-01-01T00:00:00.000Z",
      created.id,
    ]);
    const acceptResponse: Response = await PATCH(
      jsonRequest(
        `/api/families/${arranged.familyId}/invites`,
        "PATCH",
        { id: created.id, action: "accept" },
        arranged.holderId,
      ),
      familyRouteParams(arranged.familyId),
    );
    const body: InvitePatched = (await acceptResponse.json()) as InvitePatched;
    expect(acceptResponse.status).toBe(409);
    expect(body.status).toBe("Expired");
    const memberRows: FamilyMembersRow[] = queryRaw<FamilyMembersRow>(
      "SELECT family_members FROM family WHERE id = ?",
      [arranged.familyId],
    );
    const envelope: MembersEnvelope = JSON.parse(
      memberRows[0].family_members,
    ) as MembersEnvelope;
    expect(envelope.members).toHaveLength(1);
  });
});
