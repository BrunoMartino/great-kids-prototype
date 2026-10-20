import type { DayDocument } from "../calendar/day-composite";
import { readDayDocument } from "../calendar/schedule-on-day-command";
import {
  readRhythmProposal,
  type RhythmProposal,
} from "./rhythm-proposal-observer";

export type PatchSuggestionResult = {
  days: DayDocument[];
  proposal: RhythmProposal | null;
};

export class MissingTargetDayError extends Error {
  public constructor() {
    super("missing target day");
    this.name = "MissingTargetDayError";
  }
}

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

export function readPatchResult(p_value: unknown): PatchSuggestionResult | null {
  if (!isRecord(p_value) || !Array.isArray(p_value.days)) {
    return null;
  }
  const days: DayDocument[] = [];
  for (const p_item of p_value.days) {
    const document: DayDocument | null = readDayDocument(p_item);
    if (document === null) {
      return null;
    }
    days.push(document);
  }
  const proposal: RhythmProposal | null =
    p_value.proposal === null ? null : readRhythmProposal(p_value.proposal);
  if (p_value.proposal !== null && p_value.proposal !== undefined && proposal === null) {
    return null;
  }
  return { days, proposal };
}

export class MarkDoneCommand {
  public constructor(
    private readonly p_familyId: string,
    private readonly p_day: string,
    private readonly p_suggestionId: string,
  ) {}

  public async execute(): Promise<PatchSuggestionResult> {
    const response: Response = await fetch(
      `/api/families/${encodeURIComponent(this.p_familyId)}/calendar/${encodeURIComponent(this.p_day)}/suggestions/${encodeURIComponent(this.p_suggestionId)}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ status: "done" }),
      },
    );
    if (!response.ok) {
      throw new Error(`mark done failed:${String(response.status)}`);
    }
    const body: unknown = await response.json();
    const result: PatchSuggestionResult | null = readPatchResult(body);
    if (result === null) {
      throw new Error("patch envelope invalid");
    }
    return result;
  }

  public async undo(): Promise<void> {
    return;
  }
}

export class MoveDayCommand {
  public constructor(
    private readonly p_familyId: string,
    private readonly p_day: string,
    private readonly p_suggestionId: string,
    private readonly p_targetDay: string,
  ) {}

  public async execute(): Promise<PatchSuggestionResult> {
    const targetDay: string = this.p_targetDay.trim();
    if (targetDay.length === 0) {
      throw new MissingTargetDayError();
    }
    const response: Response = await fetch(
      `/api/families/${encodeURIComponent(this.p_familyId)}/calendar/${encodeURIComponent(this.p_day)}/suggestions/${encodeURIComponent(this.p_suggestionId)}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ status: "moved", target_day: targetDay }),
      },
    );
    if (response.status === 422) {
      throw new MissingTargetDayError();
    }
    if (!response.ok) {
      throw new Error(`move day failed:${String(response.status)}`);
    }
    const body: unknown = await response.json();
    const result: PatchSuggestionResult | null = readPatchResult(body);
    if (result === null) {
      throw new Error("patch envelope invalid");
    }
    return result;
  }

  public async undo(): Promise<void> {
    return;
  }
}
