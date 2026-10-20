import { DEMO_FAMILY_ID, DemoSeedFactory } from "@/models/demo-seed-factory";

export type StaffRole = "Admin" | "Operator";
export type FamilyRole = "Parent" | "Child";
export type MockRole = StaffRole | FamilyRole;

export type MockSession = {
  role: MockRole;
  staffRole: StaffRole | null;
  familyRole: FamilyRole;
  familyId: string;
};

type MockSessionData = {
  staffRole: StaffRole | null;
  familyRole: FamilyRole;
  familyId: string;
};

type MockSessionStore = {
  session: MockSession;
};

type GlobalWithMockSession = typeof globalThis & {
  __greatKidsMockSessionStore?: MockSessionStore;
};

function wrapSession(p_data: MockSessionData): MockSession {
  return new Proxy(p_data, {
    get(p_target: MockSessionData, p_prop: string | symbol): unknown {
      if (p_prop === "role") {
        return p_target.staffRole ?? p_target.familyRole;
      }
      return Reflect.get(p_target, p_prop);
    },
    set(
      p_target: MockSessionData,
      p_prop: string | symbol,
      p_value: unknown,
    ): boolean {
      if (p_prop === "role") {
        if (p_value === "Admin" || p_value === "Operator") {
          p_target.staffRole = p_value;
          return true;
        }
        if (p_value === "Parent" || p_value === "Child") {
          p_target.familyRole = p_value;
          return true;
        }
        return false;
      }
      return Reflect.set(p_target, p_prop, p_value);
    },
  }) as MockSession;
}

function defaultData(): MockSessionData {
  return {
    staffRole: null,
    familyRole: "Parent",
    familyId: DEMO_FAMILY_ID,
  };
}

const moduleStore: MockSessionStore = {
  session: wrapSession(defaultData()),
};

function ensureFamilyId(p_data: MockSessionData): void {
  if (p_data.familyId === undefined || p_data.familyId === "") {
    p_data.familyId = DEMO_FAMILY_ID;
  }
  if (p_data.familyRole !== "Parent" && p_data.familyRole !== "Child") {
    p_data.familyRole = "Parent";
  }
  if (
    p_data.staffRole !== null &&
    p_data.staffRole !== "Admin" &&
    p_data.staffRole !== "Operator"
  ) {
    p_data.staffRole = null;
  }
}

function processStore(): MockSessionStore {
  if (process.env.VITEST !== undefined && process.env.VITEST !== "") {
    const raw: MockSessionData = moduleStore.session as unknown as MockSessionData;
    ensureFamilyId(raw);
    return moduleStore;
  }
  const g: GlobalWithMockSession = globalThis;
  if (g.__greatKidsMockSessionStore === undefined) {
    g.__greatKidsMockSessionStore = { session: wrapSession(defaultData()) };
  }
  const raw: MockSessionData = g.__greatKidsMockSessionStore
    .session as unknown as MockSessionData;
  ensureFamilyId(raw);
  return g.__greatKidsMockSessionStore;
}

export function getMockSession(): MockSession {
  const store: MockSessionStore = processStore();
  if (process.env.VITEST === undefined || process.env.VITEST === "") {
    DemoSeedFactory.instance.applyIfMissing();
  }
  return store.session;
}

export function getFamilyRole(): FamilyRole {
  return getMockSession().familyRole;
}

export function getStaffRole(): StaffRole | null {
  return getMockSession().staffRole;
}

export function setStaffRole(p_role: StaffRole): void {
  getMockSession().staffRole = p_role;
}

export function setFamilyRole(p_role: FamilyRole): void {
  getMockSession().familyRole = p_role;
}

export function clearStaffRole(): void {
  getMockSession().staffRole = null;
}
