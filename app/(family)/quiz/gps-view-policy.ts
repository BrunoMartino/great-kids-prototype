export class GpsViewPolicy {
  public static canAnswer(p_role: string): boolean {
    return p_role === "Parent" || p_role === "Child";
  }

  public static canEdit(p_role: string): boolean {
    return p_role === "Parent";
  }

  public static canSchedule(p_role: string): boolean {
    return p_role === "Parent";
  }
}
