import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

describe("InvitePolicy", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("allows the titular Parent to invite", async () => {
    // Break: titular Parent assertCanInvite throws.
    const { InvitePolicy } = await import("@/app/api/families/[id]/invites/invite-policy");
    const holderId: string = "holder-ana-1";
    expect(() => {
      InvitePolicy.assertCanInvite(holderId, "Parent", holderId);
    }).not.toThrow();
  });

  it("rejects a non-titular Parent invite", async () => {
    // Break: invited Parent (id ≠ holder) is allowed to invite.
    const { InvitePolicy } = await import("@/app/api/families/[id]/invites/invite-policy");
    expect(() => {
      InvitePolicy.assertCanInvite("invited-bia-2", "Parent", "holder-ana-1");
    }).toThrow();
  });

  it("rejects a Child role invite", async () => {
    // Break: Child context can invite (INV-002).
    const { InvitePolicy } = await import("@/app/api/families/[id]/invites/invite-policy");
    const holderId: string = "holder-ana-1";
    expect(() => {
      InvitePolicy.assertCanInvite(holderId, "Child", holderId);
    }).toThrow();
  });

  it("lets only the titular Parent change plan", async () => {
    // Break: invited Parent can change plan, or titular Parent cannot.
    const { InvitePolicy } = await import("@/app/api/families/[id]/invites/invite-policy");
    const holderId: string = "holder-ana-1";
    expect(() => {
      InvitePolicy.assertCanChangePlan("invited-bia-2", holderId, "Parent");
    }).toThrow();
    expect(() => {
      InvitePolicy.assertCanChangePlan(holderId, holderId, "Parent");
    }).not.toThrow();
  });
});
