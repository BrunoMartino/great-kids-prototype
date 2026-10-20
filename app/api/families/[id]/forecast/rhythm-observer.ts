import { parseSuggestionsEnvelope } from "@/app/api/families/[id]/calendar/day-composite";
import { FamilyCalendar, type FamilyCalendarRow } from "@/models/family_calendar";

export type RhythmProposal = {
  source_mission_id: string;
  weekday: string;
};

interface Observable {
  subscribe(...p_observers: Observer[]): void;
  unsubscribe(p_observer: Observer): void;
  notify(): void;
}

interface Observer {
  update(...p_args: unknown[]): void;
}

const WEEKDAYS: string[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function weekdayFromDay(p_day: string): string {
  const parsed: Date = new Date(`${p_day}T12:00:00.000Z`);
  const index: number = parsed.getUTCDay();
  const name: string | undefined = WEEKDAYS[index];
  return name ?? "Sunday";
}

export class RepeatCountObservable implements Observable {
  private observers: Observer[] = [];

  public constructor(
    public readonly p_familyId: string,
    public readonly p_missionId: string,
    public readonly p_day: string,
  ) {}

  public subscribe(...p_observers: Observer[]): void {
    p_observers.forEach((p_observer: Observer) => {
      if (!this.observers.includes(p_observer)) {
        this.observers.push(p_observer);
      }
    });
  }

  public unsubscribe(p_observer: Observer): void {
    const observerIndex: number = this.observers.indexOf(p_observer);
    if (observerIndex !== -1) {
      this.observers.splice(observerIndex, 1);
    }
  }

  public notify(): void {
    this.observers.forEach((p_observer: Observer) => {
      p_observer.update(this);
    });
  }

  public countRepeats(): number {
    const rows: FamilyCalendarRow[] = FamilyCalendar.instance.listByFamily(this.p_familyId);
    let total: number = 0;
    for (const p_row of rows) {
      const envelope = parseSuggestionsEnvelope(p_row.suggestions);
      for (const p_item of envelope.suggestions) {
        if (
          p_item.mission_id === this.p_missionId &&
          (p_item.status === "done" || p_item.status === "moved")
        ) {
          total += 1;
        }
      }
    }
    return total;
  }
}

export class RhythmProposalObserver implements Observer {
  public proposal: RhythmProposal | null = null;

  public update(...p_args: unknown[]): void {
    const first: unknown = p_args[0];
    if (!(first instanceof RepeatCountObservable)) {
      return;
    }
    if (first.countRepeats() < 4) {
      this.proposal = null;
      return;
    }
    this.proposal = {
      source_mission_id: first.p_missionId,
      weekday: weekdayFromDay(first.p_day),
    };
  }
}
