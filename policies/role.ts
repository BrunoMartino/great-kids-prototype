export class ContextPolicy {
  public static assertCanChangePlan(p_role: string): void {
    if (p_role === "Child") {
      throw new Error("child cannot change plan");
    }
  }

  public static assertCanInvite(p_role: string): void {
    if (p_role === "Child") {
      throw new Error("child cannot invite");
    }
  }

  public static assertSessionPresent(p_present: boolean): void {
    if (p_present === false) {
      throw new Error("session absent");
    }
  }
}
