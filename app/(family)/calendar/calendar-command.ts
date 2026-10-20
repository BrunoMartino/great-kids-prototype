import type { DayDocument } from "./day-composite";

export interface CalendarCommand {
  execute(): Promise<DayDocument>;
  undo(): Promise<void>;
}
