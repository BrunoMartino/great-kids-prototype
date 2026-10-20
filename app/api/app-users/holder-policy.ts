export class HolderPolicy {
  public static assertCanBeTitular(p_role: string): void {
    if (p_role !== "Parent") {
      throw new Error("titular must be Parent");
    }
  }

  public static assertCanChangePlan(
    p_actorUserId: string,
    p_holderUserId: string,
    p_actorRole: string,
  ): void {
    if (p_actorRole !== "Parent" || p_actorUserId !== p_holderUserId) {
      throw new Error("only the holder may change plan");
    }
  }
}
