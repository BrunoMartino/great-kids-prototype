export type MockRole = "Admin" | "Operator" | "Parent" | "Child";

export type MockSession = {
  role: MockRole;
};

type MockSessionStore = {
  session: MockSession;
};

type GlobalWithMockSession = typeof globalThis & {
  __greatKidsMockSessionStore?: MockSessionStore;
};

const moduleStore: MockSessionStore = {
  session: { role: "Parent" },
};

function processStore(): MockSessionStore {
  if (process.env.VITEST !== undefined && process.env.VITEST !== "") {
    return moduleStore;
  }
  const g: GlobalWithMockSession = globalThis;
  if (g.__greatKidsMockSessionStore === undefined) {
    g.__greatKidsMockSessionStore = { session: { role: "Parent" } };
  }
  return g.__greatKidsMockSessionStore;
}

export function getMockSession(): MockSession {
  return processStore().session;
}
