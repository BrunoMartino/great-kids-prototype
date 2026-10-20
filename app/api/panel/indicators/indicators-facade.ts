import {
  parseSuggestionsEnvelope,
  type SuggestionsEnvelope,
} from "@/app/api/families/[id]/calendar/day-composite";
import { Family, type FamilyListRow } from "@/models/family";
import { FamilyCalendar, type FamilyCalendarRow } from "@/models/family_calendar";
import { FamilyMission, type FamilyMissionRow } from "@/models/family_mission";

export type IndicatorsRead = {
  id: string;
  scheduled: number;
  completed: number;
  repeated: number;
};

export class IndicatorsFacade {
  public read(): IndicatorsRead {
    const families: FamilyListRow[] = Family.instance.list();
    let scheduled: number = 0;
    let completed: number = 0;
    let repeated: number = 0;
    for (const p_family of families) {
      scheduled += this.countScheduled(p_family.id);
      const rows: FamilyMissionRow[] = FamilyMission.instance.listCompleted(p_family.id);
      completed += rows.length;
      repeated += this.countRepeated(rows);
    }
    return {
      id: crypto.randomUUID(),
      scheduled,
      completed,
      repeated,
    };
  }

  private countScheduled(p_familyId: string): number {
    const days: FamilyCalendarRow[] = FamilyCalendar.instance.listByFamily(p_familyId);
    let total: number = 0;
    for (const p_day of days) {
      const envelope: SuggestionsEnvelope = parseSuggestionsEnvelope(p_day.suggestions);
      for (const p_item of envelope.suggestions) {
        if (p_item.status === "scheduled") {
          total += 1;
        }
      }
    }
    return total;
  }

  private countRepeated(p_rows: FamilyMissionRow[]): number {
    const counts: Map<string, number> = new Map();
    for (const p_row of p_rows) {
      const current: number = counts.get(p_row.mission_id) ?? 0;
      counts.set(p_row.mission_id, current + 1);
    }
    let total: number = 0;
    for (const p_count of counts.values()) {
      if (p_count >= 2) {
        total += 1;
      }
    }
    return total;
  }
}
