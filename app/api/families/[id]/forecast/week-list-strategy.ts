import {
  CatalogPickStrategy,
} from "@/services/mission_pick/catalog-pick-strategy";
import {
  PickStrategy,
  type PickCandidate,
  type PickFilterInput,
} from "@/services/mission_pick/pick-strategy";

export const WEEK_LIST_CAP: number = 5;

export type WeekSuggestion = {
  mission_id: string;
  title: string;
};

export class WeekListStrategy extends PickStrategy {
  public constructor(private readonly p_inner: PickStrategy = new CatalogPickStrategy()) {
    super();
  }

  public filter(p_input: PickFilterInput): PickCandidate[] {
    return this.p_inner.filter(p_input).slice(0, WEEK_LIST_CAP);
  }

  public list(p_input: PickFilterInput): WeekSuggestion[] {
    return this.filter(p_input).map((p_row: PickCandidate) => ({
      mission_id: p_row.id,
      title: p_row.title ?? "",
    }));
  }
}
