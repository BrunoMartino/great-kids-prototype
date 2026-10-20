import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

const DEMO_FAMILY_ID: string = "c10a0003-3333-4333-8333-000000000010";
const DEMO_PARENT_ID: string = "c10a0001-1111-4111-8111-000000000003";

type FamilySeedRow = {
  id: string;
  plan_id: string | null;
  family_members: string;
  status: string;
};

type PlanRow = {
  id: string;
  name: string;
  status: string;
};

type UserRow = {
  id: string;
  role: string;
  status: string;
};

type MembersEnvelope = {
  id: string;
  members: Array<{
    user_id: string | null;
    user_nickname: string;
    user_role: string;
  }>;
};

type CountRow = {
  n: number;
};

describe("demo seed 100100", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("creates the demo family with members envelope and Plus plan", async () => {
    // Break: demo family row missing, members not an envelope, or plan_id not Plus.
    const { DemoSeedFactory } = await import("@/models/demo-seed-factory");
    const { queryRaw } = await import("@/internal/db/connection");
    DemoSeedFactory.instance.applyIfMissing();
    const families: FamilySeedRow[] = queryRaw<FamilySeedRow>(
      "SELECT id, plan_id, family_members, status FROM family WHERE id = ?",
      [DEMO_FAMILY_ID],
    );
    expect(families).toHaveLength(1);
    expect(families[0]?.status).toBe("active");
    const members: MembersEnvelope = JSON.parse(
      families[0]?.family_members ?? "null",
    ) as MembersEnvelope;
    expect(typeof members.id).toBe("string");
    expect(Array.isArray(members.members)).toBe(true);
    expect(members.members.some((p_m) => p_m.user_id === DEMO_PARENT_ID)).toBe(true);
    expect(members.members.some((p_m) => p_m.user_role === "Child" && p_m.user_id === null)).toBe(
      true,
    );
    const plans: PlanRow[] = queryRaw<PlanRow>(
      "SELECT id, name, status FROM plan WHERE id = ?",
      [families[0]?.plan_id ?? ""],
    );
    expect(plans[0]?.name).toBe("Plus");
    expect(plans[0]?.status).toBe("active");
  });

  it("does not create a Child app_user login", async () => {
    // Break: Child is inserted into app_user (INV-002).
    const { DemoSeedFactory } = await import("@/models/demo-seed-factory");
    const { queryRaw } = await import("@/internal/db/connection");
    DemoSeedFactory.instance.applyIfMissing();
    const rows: CountRow[] = queryRaw<CountRow>(
      "SELECT count(*) AS n FROM app_user WHERE role = 'Child'",
      [],
    );
    expect(rows[0]?.n).toBe(0);
    const staff: UserRow[] = queryRaw<UserRow>(
      "SELECT id, role, status FROM app_user WHERE role IN ('Admin', 'Operator', 'Parent')",
      [],
    );
    expect(staff.some((p_u) => p_u.role === "Admin" && p_u.status === "active")).toBe(true);
    expect(staff.some((p_u) => p_u.role === "Operator" && p_u.status === "active")).toBe(true);
    expect(staff.some((p_u) => p_u.id === DEMO_PARENT_ID && p_u.role === "Parent")).toBe(true);
  });

  it("is idempotent on a second apply", async () => {
    // Break: second apply duplicates family or throws.
    const { DemoSeedFactory } = await import("@/models/demo-seed-factory");
    const { queryRaw } = await import("@/internal/db/connection");
    DemoSeedFactory.instance.applyIfMissing();
    DemoSeedFactory.instance.applyIfMissing();
    const families: CountRow[] = queryRaw<CountRow>(
      "SELECT count(*) AS n FROM family WHERE id = ?",
      [DEMO_FAMILY_ID],
    );
    expect(families[0]?.n).toBe(1);
    const missions: CountRow[] = queryRaw<CountRow>(
      "SELECT count(*) AS n FROM mission WHERE id LIKE 'c10a0004-%'",
      [],
    );
    expect(missions[0]?.n).toBeGreaterThanOrEqual(6);
    expect(missions[0]?.n).toBeLessThanOrEqual(8);
  });
});
