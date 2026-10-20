import { Family } from "@/models/family";
import { FamilyMission } from "@/models/family_mission";
import { Mission, type MissionFiche } from "@/models/mission";

export type AcceptedFamilyMission = {
  id: string;
  mission_id: string;
  status: "Accepted";
  title: string;
  description: string | null;
  review_status: string;
};

export abstract class FamilyMissionFactory {
  public abstract getFamilyMission(
    p_familyId: string,
    p_missionId: string,
  ): AcceptedFamilyMission;

  public async create(
    p_familyId: string,
    p_missionId: string,
  ): Promise<AcceptedFamilyMission> {
    return this.getFamilyMission(p_familyId, p_missionId);
  }
}

export class UnpublishedCatalogError extends Error {
  public constructor() {
    super("unpublished catalog mission");
    this.name = "UnpublishedCatalogError";
  }
}

export class AcceptedFamilyMissionFactory extends FamilyMissionFactory {
  public getFamilyMission(p_familyId: string, p_missionId: string): AcceptedFamilyMission {
    if (Family.instance.findHolderUserId(p_familyId) === null) {
      throw new Error("family not found");
    }
    const fiche: MissionFiche | null = Mission.instance.findById(p_missionId);
    if (fiche === null || fiche.review_status !== "published" || fiche.status !== "active") {
      throw new UnpublishedCatalogError();
    }
    const row = FamilyMission.instance.insertAccepted(p_familyId, fiche.id);
    return {
      id: row.id,
      mission_id: fiche.id,
      status: "Accepted",
      title: fiche.title,
      description: fiche.description,
      review_status: fiche.review_status,
    };
  }
}
