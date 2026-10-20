import type { DayDocument } from "../calendar/day-composite";

export interface ForecastCommand {
  execute(): Promise<DayDocument>;
  undo(): Promise<void>;
}
