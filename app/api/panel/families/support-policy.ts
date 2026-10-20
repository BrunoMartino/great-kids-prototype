export class SupportPolicy {
  public static assertPanel(p_actorRole: string): void {
    if (p_actorRole !== "Operator" && p_actorRole !== "Admin") {
      throw new Error("panel staff only");
    }
  }

  public static assertCanChangeFamilyPlan(
    p_actorUserId: string,
    p_holderUserId: string,
    p_actorRole: string,
  ): void {
    if (p_actorRole !== "Parent" || p_actorUserId !== p_holderUserId) {
      throw new Error("only the titular parent may change family plan");
    }
  }
}
