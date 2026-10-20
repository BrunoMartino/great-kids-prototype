export type RhythmProposal = {
  source_mission_id: string;
  weekday: string;
};

export interface ProposalListener {
  update(p_proposal: RhythmProposal | null): void;
}

export class RepeatCountObservable {
  public constructor(private readonly p_listeners: ProposalListener[] = []) {}

  public subscribe(p_listener: ProposalListener): void {
    this.p_listeners.push(p_listener);
  }

  public notify(p_proposal: RhythmProposal | null): void {
    for (const listener of this.p_listeners) {
      listener.update(p_proposal);
    }
  }
}

export class RhythmProposalObserver implements ProposalListener {
  public proposal: RhythmProposal | null = null;

  public update(p_proposal: RhythmProposal | null): void {
    this.proposal = p_proposal;
  }
}

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

export function readRhythmProposal(p_value: unknown): RhythmProposal | null {
  if (!isRecord(p_value)) {
    return null;
  }
  if (typeof p_value.source_mission_id !== "string") {
    return null;
  }
  if (typeof p_value.weekday !== "string") {
    return null;
  }
  return {
    source_mission_id: p_value.source_mission_id,
    weekday: p_value.weekday,
  };
}
