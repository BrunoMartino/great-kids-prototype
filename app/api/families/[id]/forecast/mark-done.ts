import type { CalendarCommand } from "@/app/api/families/[id]/calendar/calendar-command";
import {
  DayComposite,
  type DayDocument,
  type SuggestionItem,
  type SuggestionsEnvelope,
} from "@/app/api/families/[id]/calendar/day-composite";
import { FamilyCalendar } from "@/models/family_calendar";

export class SuggestionNotFoundError extends Error {
  public constructor() {
    super("suggestion not found");
    this.name = "SuggestionNotFoundError";
  }
}

export class MarkDone implements CalendarCommand {
  public constructor(
    private readonly p_familyId: string,
    private readonly p_day: string,
    private readonly p_suggestionId: string,
  ) {}

  public execute(): DayDocument {
    const row = FamilyCalendar.instance.findByFamilyDay(this.p_familyId, this.p_day);
    if (row === null) {
      throw new SuggestionNotFoundError();
    }
    const current: DayDocument = DayComposite.fromStored(row).toDocument();
    let found: boolean = false;
    const nextItems: SuggestionItem[] = current.suggestions.suggestions.map(
      (p_item: SuggestionItem) => {
        if (p_item.id !== this.p_suggestionId) {
          return p_item;
        }
        found = true;
        return {
          id: p_item.id,
          mission_id: p_item.mission_id,
          curated_material_id: p_item.curated_material_id,
          status: "done",
        };
      },
    );
    if (!found) {
      throw new SuggestionNotFoundError();
    }
    const envelope: SuggestionsEnvelope = {
      id: current.suggestions.id,
      suggestions: nextItems,
    };
    FamilyCalendar.instance.replaceSuggestions(row.id, JSON.stringify(envelope));
    const stored = FamilyCalendar.instance.findByFamilyDay(this.p_familyId, this.p_day);
    if (stored === null) {
      throw new SuggestionNotFoundError();
    }
    return DayComposite.fromStored(stored).toDocument();
  }

  public undo(): void {
    return;
  }
}
