import type { CalendarCommand } from "@/app/api/families/[id]/calendar/calendar-command";
import {
  DayComposite,
  parseSuggestionsEnvelope,
  type DayDocument,
  type SuggestionItem,
  type SuggestionsEnvelope,
} from "@/app/api/families/[id]/calendar/day-composite";
import { UnpublishedMissionError } from "@/app/api/families/[id]/calendar/schedule-on-day";
import { FamilyCalendar } from "@/models/family_calendar";
import { Mission, type MissionFiche } from "@/models/mission";

export class MissingDayError extends Error {
  public constructor() {
    super("day required");
    this.name = "MissingDayError";
  }
}

export class DropOnDay implements CalendarCommand {
  public constructor(
    private readonly p_familyId: string,
    private readonly p_day: string,
    private readonly p_missionId: string,
  ) {}

  public execute(): DayDocument {
    if (this.p_day.trim() === "") {
      throw new MissingDayError();
    }
    this.assertPublished();
    const existing = FamilyCalendar.instance.findByFamilyDay(this.p_familyId, this.p_day);
    const leaf: SuggestionItem = {
      id: crypto.randomUUID(),
      mission_id: this.p_missionId,
      curated_material_id: null,
      status: "scheduled",
    };
    if (existing === null) {
      const envelope: SuggestionsEnvelope = {
        id: crypto.randomUUID(),
        suggestions: [leaf],
      };
      const row = FamilyCalendar.instance.insert({
        family_id: this.p_familyId,
        day: this.p_day,
        previous_weather: null,
        notifications: 0,
        suggestions: JSON.stringify(envelope),
      });
      return DayComposite.fromStored(row).toDocument();
    }
    const current: SuggestionsEnvelope = parseSuggestionsEnvelope(existing.suggestions);
    const merged: SuggestionsEnvelope = {
      id: current.id,
      suggestions: [...current.suggestions, leaf],
    };
    FamilyCalendar.instance.replaceSuggestions(existing.id, JSON.stringify(merged));
    const stored = FamilyCalendar.instance.findByFamilyDay(this.p_familyId, this.p_day);
    if (stored === null) {
      throw new Error("calendar day not found");
    }
    return DayComposite.fromStored(stored).toDocument();
  }

  public undo(): void {
    return;
  }

  private assertPublished(): void {
    const fiche: MissionFiche | null = Mission.instance.findById(this.p_missionId);
    if (fiche === null || fiche.review_status !== "published" || fiche.status !== "active") {
      throw new UnpublishedMissionError();
    }
  }
}
