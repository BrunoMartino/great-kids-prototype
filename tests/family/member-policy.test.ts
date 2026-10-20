import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

type MemberEnvelope = {
  id: string;
  members: Array<Record<string, unknown>>;
};

describe("MemberPolicy", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("allows a child member envelope without a photo key", async () => {
    // Break: valid Child envelope without app account is rejected.
    const { MemberPolicy } = await import("@/app/api/families/[id]/members/member-policy");
    const envelope: MemberEnvelope = {
      id: "members-env-1",
      members: [{ user_id: null, user_nickname: "Leo", user_role: "Child" }],
    };
    expect(() => {
      MemberPolicy.assertWrite(envelope);
    }).not.toThrow();
  });

  it("rejects a member with photo, img, or image keys", async () => {
    // Break: photo/img/image keys are accepted (INV-002).
    const { MemberPolicy } = await import("@/app/api/families/[id]/members/member-policy");
    expect(() => {
      MemberPolicy.assertWrite({
        id: "members-env-2",
        members: [{ user_id: null, user_nickname: "Leo", user_role: "Child", photo: "x" }],
      });
    }).toThrow();
    expect(() => {
      MemberPolicy.assertWrite({
        id: "members-env-3",
        members: [{ user_id: null, user_nickname: "Leo", user_role: "Child", img: "x" }],
      });
    }).toThrow();
    expect(() => {
      MemberPolicy.assertWrite({
        id: "members-env-4",
        members: [{ user_id: null, user_nickname: "Leo", user_role: "Child", image: "x" }],
      });
    }).toThrow();
  });

  it("rejects a Child member with a real login", async () => {
    // Break: Child + user_id + auth_user_id login is stored (INV-002).
    const { MemberPolicy } = await import("@/app/api/families/[id]/members/member-policy");
    expect(() => {
      MemberPolicy.assertWrite({
        id: "members-env-5",
        members: [
          {
            user_id: "child-user-1",
            user_nickname: "Leo",
            user_role: "Child",
            auth_user_id: "auth-real-1",
          },
        ],
      });
    }).toThrow();
  });

  it("rejects a bare array body", async () => {
    // Break: bare [] is accepted as family_members (INV-004).
    const { MemberPolicy } = await import("@/app/api/families/[id]/members/member-policy");
    const bare: unknown = [];
    expect(() => {
      MemberPolicy.assertWrite(bare);
    }).toThrow();
  });
});
