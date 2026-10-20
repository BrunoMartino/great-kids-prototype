function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

export class MemberPolicy {
  public static assertWrite(p_envelope: unknown): void {
    if (Array.isArray(p_envelope)) {
      throw new Error("family_members must be an envelope");
    }
    if (!isRecord(p_envelope) || !Array.isArray(p_envelope.members)) {
      throw new Error("family_members must be an envelope");
    }
    for (const p_member of p_envelope.members) {
      if (!isRecord(p_member)) {
        throw new Error("invalid member");
      }
      if ("photo" in p_member || "img" in p_member || "image" in p_member) {
        throw new Error("photo keys forbidden");
      }
      if (
        p_member.user_role === "Child" &&
        p_member.auth_user_id !== undefined &&
        p_member.auth_user_id !== null
      ) {
        throw new Error("child cannot have login");
      }
    }
  }
}
