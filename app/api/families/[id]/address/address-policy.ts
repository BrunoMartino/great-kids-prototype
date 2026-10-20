export class AddressPolicy {
  public static assertCanWrite(
    p_actorUserId: string,
    p_actorRole: string,
    p_holderUserId: string,
  ): void {
    if (p_actorRole === "Admin") {
      return;
    }
    if (p_actorRole === "Child") {
      throw new Error("child cannot write address");
    }
    if (p_actorRole !== "Parent" || p_actorUserId !== p_holderUserId) {
      throw new Error("only the titular parent may write address");
    }
  }
}
