import type { RhythmProposal } from "./rhythm-proposal-observer";

export type RhythmItem = {
  id: string;
  label: string;
  source_mission_id: string;
  weekday: string;
};

export type RhythmsEnvelope = {
  id: string;
  rhythms: RhythmItem[];
};

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

export function readRhythmsEnvelope(p_value: unknown): RhythmsEnvelope | null {
  if (!isRecord(p_value) || typeof p_value.id !== "string") {
    return null;
  }
  if (!Array.isArray(p_value.rhythms)) {
    return null;
  }
  const rhythms: RhythmItem[] = [];
  for (const p_item of p_value.rhythms) {
    if (!isRecord(p_item)) {
      return null;
    }
    if (typeof p_item.id !== "string") {
      return null;
    }
    if (typeof p_item.label !== "string") {
      return null;
    }
    if (typeof p_item.source_mission_id !== "string") {
      return null;
    }
    if (typeof p_item.weekday !== "string") {
      return null;
    }
    rhythms.push({
      id: p_item.id,
      label: p_item.label,
      source_mission_id: p_item.source_mission_id,
      weekday: p_item.weekday,
    });
  }
  return { id: p_value.id, rhythms };
}

export class AcceptProposalCommand {
  public constructor(
    private readonly p_familyId: string,
    private readonly p_proposal: RhythmProposal,
    private readonly p_label: string,
  ) {}

  public async execute(): Promise<RhythmsEnvelope> {
    const response: Response = await fetch(
      `/api/families/${encodeURIComponent(this.p_familyId)}/rhythms/proposal`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          source_mission_id: this.p_proposal.source_mission_id,
          label: this.p_label,
          weekday: this.p_proposal.weekday,
        }),
      },
    );
    if (!response.ok) {
      throw new Error(`accept proposal failed:${String(response.status)}`);
    }
    const body: unknown = await response.json();
    const envelope: RhythmsEnvelope | null = readRhythmsEnvelope(body);
    if (envelope === null) {
      throw new Error("rhythms envelope invalid");
    }
    return envelope;
  }

  public async undo(): Promise<void> {
    return;
  }
}

export class DismissProposalCommand {
  public constructor(private readonly p_familyId: string) {}

  public async execute(): Promise<RhythmsEnvelope> {
    const response: Response = await fetch(
      `/api/families/${encodeURIComponent(this.p_familyId)}/rhythms/proposal`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ dismissed: true }),
      },
    );
    if (!response.ok) {
      throw new Error(`dismiss proposal failed:${String(response.status)}`);
    }
    const body: unknown = await response.json();
    const envelope: RhythmsEnvelope | null = readRhythmsEnvelope(body);
    if (envelope === null) {
      throw new Error("rhythms envelope invalid");
    }
    return envelope;
  }

  public async undo(): Promise<void> {
    return;
  }
}
