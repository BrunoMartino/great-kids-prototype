export class UserWriteDeniedError extends Error {
  public constructor() {
    super("admin only");
    this.name = "UserWriteDeniedError";
  }
}

export class UserWritePolicy {
  public static assertCanWrite(p_role: string): void {
    if (p_role !== "Admin") {
      throw new UserWriteDeniedError();
    }
  }
}
