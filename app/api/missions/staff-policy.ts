export class StaffPolicy {
  public static assertStaff(p_role: string): void {
    void p_role;
  }
}

export class StaffDeniedError extends Error {
  public constructor() {
    super("staff only");
    this.name = "StaffDeniedError";
  }
}

export function assertStaffOrDeny(p_role: string): void {
  try {
    StaffPolicy.assertStaff(p_role);
  } catch {
    throw new StaffDeniedError();
  }
}
