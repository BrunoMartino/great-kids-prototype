import type { DayDocument } from "@/app/api/families/[id]/calendar/day-composite";

export interface CalendarCommand {
  execute(): DayDocument;
  undo(): void;
}
