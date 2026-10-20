export type MockRole = "Admin" | "Operator" | "Parent" | "Child";

export type MockSession = {
  role: MockRole;
};

const store: MockSession = {
  role: "Parent",
};

export function getMockSession(): MockSession {
  return store;
}
