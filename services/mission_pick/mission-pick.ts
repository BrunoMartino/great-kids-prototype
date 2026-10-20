import { Mission, type MissionFiche } from "@/models/mission";
import { CatalogPickStrategy } from "@/services/mission_pick/catalog-pick-strategy";
import {
  PickStrategy,
  type PickCandidate,
  type PickFilterInput,
} from "@/services/mission_pick/pick-strategy";
import {
  RankerAdapter,
  RankerDiscardError,
  type RankerProtocol,
} from "@/services/mission_pick/ranker-adapter";

export class NoCandidateError extends Error {
  public constructor() {
    super("no candidate");
    this.name = "NoCandidateError";
  }
}

export type PickResult = {
  id: string;
  mission_id: string;
};

export class MissionPick {
  public constructor(
    private readonly p_strategy: PickStrategy = new CatalogPickStrategy(),
    private readonly p_ranker: RankerProtocol = new RankerAdapter(),
  ) {}

  public pick(p_input: PickFilterInput): PickResult {
    const candidates: PickCandidate[] = this.p_strategy.filter(p_input);
    if (candidates.length === 0) {
      throw new NoCandidateError();
    }
    const rankedId: string = this.p_ranker.rank(
      candidates.map((p_row: { id: string }) => p_row.id),
    );
    const fiche: MissionFiche | null = Mission.instance.findById(rankedId);
    if (fiche === null || fiche.review_status !== "published" || fiche.status !== "active") {
      throw new RankerDiscardError();
    }
    return {
      id: crypto.randomUUID(),
      mission_id: fiche.id,
    };
  }
}
