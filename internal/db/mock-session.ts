import { DEMO_FAMILY_ID, DemoSeedFactory } from "@/models/demo-seed-factory";

export type MockRole = "Admin" | "Operator" | "Parent" | "Child";

export type MockSession = {
  role: MockRole;
  familyId: string;
};

type MockSessionStore = {
  session: MockSession;
};

type GlobalWithMockSession = typeof globalThis & {
  __greatKidsMockSessionStore?: MockSessionStore;
};

const moduleStore: MockSessionStore = {
  session: { role: "Parent", familyId: DEMO_FAMILY_ID },
};

function defaultSession(): MockSession {
  return { role: "Parent", familyId: DEMO_FAMILY_ID };
}

function processStore(): MockSessionStore {
  if (process.env.VITEST !== undefined && process.env.VITEST !== "") {
    if (moduleStore.session.familyId === undefined || moduleStore.session.familyId === "") {
      moduleStore.session.familyId = DEMO_FAMILY_ID;
    }
    return moduleStore;
  }
  const g: GlobalWithMockSession = globalThis;
  if (g.__greatKidsMockSessionStore === undefined) {
    g.__greatKidsMockSessionStore = { session: defaultSession() };
  }
  if (
    g.__greatKidsMockSessionStore.session.familyId === undefined ||
    g.__greatKidsMockSessionStore.session.familyId === ""
  ) {
    g.__greatKidsMockSessionStore.session.familyId = DEMO_FAMILY_ID;
  }
  return g.__greatKidsMockSessionStore;
}

export function getMockSession(): MockSession {
  const store: MockSessionStore = processStore();
  if (process.env.VITEST === undefined || process.env.VITEST === "") {
    DemoSeedFactory.instance.applyIfMissing();
  }
  return store.session;
}
