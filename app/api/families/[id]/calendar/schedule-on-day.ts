import type { CalendarCommand } from "@/app/api/families/[id]/calendar/calendar-command";
import {
  DayComposite,
  type DayDocument,
  type SuggestionItem,
  type SuggestionsEnvelope,
} from "@/app/api/families/[id]/calendar/day-composite";
import { FamilyCalendar, UniqueDayError } from "@/models/family_calendar";
import { Mission, type MissionListItem } from "@/models/mission";

export class UnpublishedMissionError extends Error {
  public constructor() {
    super("unpublished mission");
    this.name = "UnpublishedMissionError";
  }
}

export class ScheduleOnDay implements CalendarCommand {
  private insertedId: string | null = null;

  public constructor(
    private readonly p_familyId: string,
    private readonly p_day: string,
    private readonly p_envelope: SuggestionsEnvelope,
    private readonly p_previousWeather: string | null,
    private readonly p_notifications: boolean,
  ) {}

  public execute(): DayDocument {
    const day: DayComposite = DayComposite.fromEnvelope(
      this.p_familyId,
      this.p_day,
      this.p_envelope,
      this.p_previousWeather,
      this.p_notifications,
    );
    const document: DayDocument = day.toDocument();
    const published: MissionListItem[] = Mission.instance.listPublished();
    const publishedIds: string[] = published.map((p_row: MissionListItem) => p_row.id);
    for (const p_item of document.suggestions.suggestions) {
      this.assertPublished(p_item, publishedIds);
    }
    const row = FamilyCalendar.instance.insert({
      family_id: this.p_familyId,
      day: this.p_day,
      previous_weather: this.p_previousWeather,
      notifications: this.p_notifications ? 1 : 0,
      suggestions: JSON.stringify(document.suggestions),
    });
    this.insertedId = row.id;
    return DayComposite.fromStored(row).toDocument();
  }

  public undo(): void {
    void this.insertedId;
  }

  private assertPublished(p_item: SuggestionItem, p_publishedIds: string[]): void {
    if (!p_publishedIds.includes(p_item.mission_id)) {
      throw new UnpublishedMissionError();
    }
  }
}

export { UniqueDayError };
