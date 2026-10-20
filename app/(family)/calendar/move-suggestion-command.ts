import type { CalendarCommand } from "./calendar-command";
import type { DayDocument } from "./day-composite";
import { ScheduleOnDayCommand } from "./schedule-on-day-command";

export class MoveSuggestionCommand implements CalendarCommand {
  public constructor(
    private readonly p_familyId: string,
    private readonly p_targetDay: string,
    private readonly p_missionId: string,
  ) {}

  public async execute(): Promise<DayDocument> {
    const command: ScheduleOnDayCommand = new ScheduleOnDayCommand(
      this.p_familyId,
      this.p_targetDay,
      this.p_missionId,
      "moved",
    );
    return command.execute();
  }

  public async undo(): Promise<void> {
    return;
  }
}
