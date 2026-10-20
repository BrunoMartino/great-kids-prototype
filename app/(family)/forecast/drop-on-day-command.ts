import type { DayDocument } from "../calendar/day-composite";
import { readDayDocument } from "../calendar/schedule-on-day-command";
import type { ForecastCommand } from "./forecast-command";

export class MissingDayDropError extends Error {
  public constructor() {
    super("missing day");
    this.name = "MissingDayDropError";
  }
}

export class UnpublishedDropError extends Error {
  public constructor() {
    super("unpublished");
    this.name = "UnpublishedDropError";
  }
}

export class DropOnDayCommand implements ForecastCommand {
  public constructor(
    private readonly p_familyId: string,
    private readonly p_day: string,
    private readonly p_missionId: string,
  ) {}

  public async execute(): Promise<DayDocument> {
    const day: string = this.p_day.trim();
    if (day.length === 0) {
      throw new MissingDayDropError();
    }
    const response: Response = await fetch(
      `/api/families/${encodeURIComponent(this.p_familyId)}/forecast/week`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ day, mission_id: this.p_missionId }),
      },
    );
    if (response.status === 422) {
      throw new UnpublishedDropError();
    }
    if (!response.ok) {
      throw new Error(`drop failed:${String(response.status)}`);
    }
    const body: unknown = await response.json();
    const document: DayDocument | null = readDayDocument(body);
    if (document === null) {
      throw new Error("day envelope invalid");
    }
    return document;
  }

  public async undo(): Promise<void> {
    return;
  }
}
