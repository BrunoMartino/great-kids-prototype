export type PickCandidate = {
  id: string;
  title?: string;
  age_min?: number | null;
  age_max?: number | null;
  repeatable?: number;
  values?: string[];
};

export type PickFilterInput = {
  familyId: string;
  contextId?: string;
  ages?: number[];
};

export class PickStrategy {
  public filter(p_input: PickFilterInput): PickCandidate[] {
    void p_input;
    return [];
  }
}
