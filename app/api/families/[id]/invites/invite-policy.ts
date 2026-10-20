export class InvitePolicy {
  public static assertCanInvite(
    p_actorUserId: string,
    p_actorRole: string,
    p_holderUserId: string,
  ): void {
    if (p_actorRole === "Child") {
      throw new Error("child cannot invite");
    }
    if (p_actorRole !== "Parent" || p_actorUserId !== p_holderUserId) {
      throw new Error("only the titular parent may invite");
    }
  }

  public static assertCanChangePlan(
    p_actorUserId: string,
    p_holderUserId: string,
    p_actorRole: string,
  ): void {
    if (p_actorRole !== "Parent" || p_actorUserId !== p_holderUserId) {
      throw new Error("only the titular parent may change plan");
    }
  }
}
