import type { MissionFiche } from "@/models/mission";

export class ReviewPolicy {
  public static isStaff(p_role: string): boolean {
    return p_role === "Admin" || p_role === "Operator";
  }

  public static canReadFiche(p_role: string, p_fiche: MissionFiche): boolean {
    if (ReviewPolicy.isStaff(p_role)) {
      return true;
    }
    if (p_role !== "Parent" && p_role !== "Child") {
      return false;
    }
    return p_fiche.review_status === "published" && p_fiche.status === "active";
  }
}
