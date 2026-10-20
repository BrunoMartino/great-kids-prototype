import {
  CatalogPickStrategy,
} from "@/services/mission_pick/catalog-pick-strategy";
import {
  PickStrategy,
  type PickCandidate,
  type PickFilterInput,
} from "@/services/mission_pick/pick-strategy";

export class SurpriseSelectionStrategy extends PickStrategy {
  public constructor(private readonly p_inner: PickStrategy = new CatalogPickStrategy()) {
    super();
  }

  public filter(p_input: PickFilterInput): PickCandidate[] {
    return this.p_inner.filter(p_input);
  }

  public choose(p_input: PickFilterInput): string | null {
    const first: PickCandidate | undefined = this.filter(p_input)[0];
    if (first === undefined) {
      return null;
    }
    return first.id;
  }
}
