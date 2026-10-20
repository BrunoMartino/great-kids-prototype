import { Mission, type MissionListItem } from "@/models/mission";
import { MissionCategory } from "@/models/mission_category";

export type MissionCreateInput = {
  category_id?: string;
  title?: string;
};

export abstract class MissionFactory {
  public abstract getMission(p_input: MissionCreateInput): Promise<MissionListItem>;

  public async create(p_input: MissionCreateInput): Promise<MissionListItem> {
    return this.getMission(p_input);
  }
}

export class DraftMissionFactory extends MissionFactory {
  public async getMission(p_input: MissionCreateInput): Promise<MissionListItem> {
    if (p_input.category_id === undefined || p_input.category_id === "") {
      throw new Error("category_id required");
    }
    if (p_input.title === undefined || p_input.title === "") {
      throw new Error("title required");
    }
    const category = MissionCategory.instance.findById(p_input.category_id);
    if (category === null) {
      throw new Error("unknown category");
    }
    const valuesId: string = crypto.randomUUID();
    return Mission.instance.insert({
      title: p_input.title,
      category_id: p_input.category_id,
      review_status: "draft",
      status: "active",
      type: "Activity",
      format: "Quick-Win",
      values: JSON.stringify({ id: valuesId, values: [] }),
    });
  }
}
