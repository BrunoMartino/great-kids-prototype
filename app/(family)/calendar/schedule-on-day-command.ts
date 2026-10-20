import type { CalendarCommand } from "./calendar-command";
import type { DayDocument, SuggestionStatus } from "./day-composite";

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

function isStatus(p_status: string): p_status is SuggestionStatus {
  return p_status === "scheduled" || p_status === "done" || p_status === "moved";
}

export function readDayDocument(p_value: unknown): DayDocument | null {
  if (!isRecord(p_value) || typeof p_value.id !== "string") {
    return null;
  }
  if (typeof p_value.family_id !== "string" || typeof p_value.day !== "string") {
    return null;
  }
  if (Array.isArray(p_value.suggestions)) {
    return null;
  }
  if (!isRecord(p_value.suggestions) || typeof p_value.suggestions.id !== "string") {
    return null;
  }
  if (!Array.isArray(p_value.suggestions.suggestions)) {
    return null;
  }
  const suggestions: DayDocument["suggestions"]["suggestions"] = [];
  for (const p_item of p_value.suggestions.suggestions) {
    if (!isRecord(p_item)) {
      return null;
    }
    if (typeof p_item.id !== "string" || typeof p_item.mission_id !== "string") {
      return null;
    }
    if (typeof p_item.status !== "string" || !isStatus(p_item.status)) {
      return null;
    }
    suggestions.push({
      id: p_item.id,
      mission_id: p_item.mission_id,
      curated_material_id:
        typeof p_item.curated_material_id === "string"
          ? p_item.curated_material_id
          : null,
      status: p_item.status,
    });
  }
  const previousWeather: string | null =
    typeof p_value.previous_weather === "string" ? p_value.previous_weather : null;
  return {
    id: p_value.id,
    family_id: p_value.family_id,
    day: p_value.day,
    previous_weather: previousWeather,
    notifications: p_value.notifications === true,
    suggestions: { id: p_value.suggestions.id, suggestions },
  };
}

export class DayConflictError extends Error {
  public constructor() {
    super("conflict");
    this.name = "DayConflictError";
  }
}

export class UnpublishedScheduleError extends Error {
  public constructor() {
    super("unpublished");
    this.name = "UnpublishedScheduleError";
  }
}

export class ScheduleOnDayCommand implements CalendarCommand {
  public constructor(
    private readonly p_familyId: string,
    private readonly p_day: string,
    private readonly p_missionId: string,
    private readonly p_status: SuggestionStatus,
  ) {}

  public async execute(): Promise<DayDocument> {
    const envelopeId: string = crypto.randomUUID();
    const suggestionId: string = crypto.randomUUID();
    const response: Response = await fetch(
      `/api/families/${encodeURIComponent(this.p_familyId)}/calendar/${encodeURIComponent(this.p_day)}`,
      {
        method: "PUT",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          suggestions: {
            id: envelopeId,
            suggestions: [
              {
                id: suggestionId,
                mission_id: this.p_missionId,
                curated_material_id: null,
                status: this.p_status,
              },
            ],
          },
        }),
      },
    );
    if (response.status === 409) {
      throw new DayConflictError();
    }
    if (response.status === 422) {
      throw new UnpublishedScheduleError();
    }
    if (!response.ok) {
      throw new Error(`schedule failed:${String(response.status)}`);
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
