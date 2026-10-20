export class GpsPolicy {
  public static assertCanAnswer(p_role: string): void {
    if (p_role !== "Parent" && p_role !== "Child") {
      throw new Error("family answer forbidden");
    }
  }

  public static assertCanEdit(p_role: string): void {
    if (p_role !== "Parent") {
      throw new Error("family gps edit forbidden");
    }
  }
}
