import type { CalendarCommand } from "@/app/api/families/[id]/calendar/calendar-command";
import {
  DayComposite,
  parseSuggestionsEnvelope,
  type DayDocument,
  type SuggestionItem,
  type SuggestionsEnvelope,
} from "@/app/api/families/[id]/calendar/day-composite";
import { FamilyCalendar } from "@/models/family_calendar";

export class MissingTargetDayError extends Error {
  public constructor() {
    super("target_day required");
    this.name = "MissingTargetDayError";
  }
}

export class MoveDay implements CalendarCommand {
  private targetDocument: DayDocument | null = null;

  public constructor(
    private readonly p_familyId: string,
    private readonly p_day: string,
    private readonly p_suggestionId: string,
    private readonly p_targetDay: string,
  ) {}

  public execute(): DayDocument {
    if (this.p_targetDay.trim() === "") {
      throw new MissingTargetDayError();
    }
    const sourceRow = FamilyCalendar.instance.findByFamilyDay(this.p_familyId, this.p_day);
    if (sourceRow === null) {
      throw new Error("calendar day not found");
    }
    const source: DayDocument = DayComposite.fromStored(sourceRow).toDocument();
    let moving: SuggestionItem | null = null;
    const sourceItems: SuggestionItem[] = source.suggestions.suggestions.map(
      (p_item: SuggestionItem) => {
        if (p_item.id !== this.p_suggestionId) {
          return p_item;
        }
        moving = p_item;
        return {
          id: p_item.id,
          mission_id: p_item.mission_id,
          curated_material_id: p_item.curated_material_id,
          status: "moved",
        };
      },
    );
    if (moving === null) {
      throw new Error("suggestion not found");
    }
    const movedLeaf: SuggestionItem = moving;
    FamilyCalendar.instance.replaceSuggestions(
      sourceRow.id,
      JSON.stringify({ id: source.suggestions.id, suggestions: sourceItems }),
    );
    const targetLeaf: SuggestionItem = {
      id: crypto.randomUUID(),
      mission_id: movedLeaf.mission_id,
      curated_material_id: movedLeaf.curated_material_id,
      status: "scheduled",
    };
    const targetRow = FamilyCalendar.instance.findByFamilyDay(this.p_familyId, this.p_targetDay);
    if (targetRow === null) {
      const envelope: SuggestionsEnvelope = {
        id: crypto.randomUUID(),
        suggestions: [targetLeaf],
      };
      const inserted = FamilyCalendar.instance.insert({
        family_id: this.p_familyId,
        day: this.p_targetDay,
        previous_weather: null,
        notifications: 0,
        suggestions: JSON.stringify(envelope),
      });
      this.targetDocument = DayComposite.fromStored(inserted).toDocument();
    } else {
      const current: SuggestionsEnvelope = parseSuggestionsEnvelope(targetRow.suggestions);
      const merged: SuggestionsEnvelope = {
        id: current.id,
        suggestions: [...current.suggestions, targetLeaf],
      };
      FamilyCalendar.instance.replaceSuggestions(targetRow.id, JSON.stringify(merged));
      const stored = FamilyCalendar.instance.findByFamilyDay(this.p_familyId, this.p_targetDay);
      if (stored === null) {
        throw new Error("calendar day not found");
      }
      this.targetDocument = DayComposite.fromStored(stored).toDocument();
    }
    const updatedSource = FamilyCalendar.instance.findByFamilyDay(this.p_familyId, this.p_day);
    if (updatedSource === null) {
      throw new Error("calendar day not found");
    }
    return DayComposite.fromStored(updatedSource).toDocument();
  }

  public undo(): void {
    return;
  }

  public targetDayDocument(): DayDocument | null {
    return this.targetDocument;
  }
}
