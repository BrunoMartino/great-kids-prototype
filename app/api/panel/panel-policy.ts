export class PanelPolicy {
  public static assertStaff(p_role: string): void {
    if (p_role !== "Admin" && p_role !== "Operator") {
      throw new Error("panel staff only");
    }
  }
}
