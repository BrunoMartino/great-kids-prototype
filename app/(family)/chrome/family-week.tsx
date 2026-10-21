"use client";

import { useEffect, useState, type ReactElement } from "react";
import {
  CalendarBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckIcon,
  ArrowsClockwiseIcon,
} from "@/app/design-system/icons";
import { SEEDED_PUBLISHED_MISSIONS } from "./seeded-family";

type WeekDay = {
  stamp: string;
  weekday: string;
  dayOfMonth: string;
};

function parseStamp(p_stamp: string): Date {
  const parsed: Date = new Date(`${p_stamp}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toStamp(p_date: Date): string {
  const year: string = String(p_date.getFullYear());
  const month: string = String(p_date.getMonth() + 1).padStart(2, "0");
  const day: string = String(p_date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(p_date: Date, p_days: number): Date {
  const next: Date = new Date(p_date.getTime());
  next.setDate(next.getDate() + p_days);
  return next;
}

/** Monday-first week that contains the given `YYYY-MM-DD` day. */
function weekOf(p_stamp: string): WeekDay[] {
  const anchor: Date = parseStamp(p_stamp);
  const offset: number = (anchor.getDay() + 6) % 7;
  const monday: Date = addDays(anchor, -offset);
  return Array.from({ length: 7 }, (_p_unused: unknown, p_index: number): WeekDay => {
    const date: Date = addDays(monday, p_index);
    return {
      stamp: toStamp(date),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayOfMonth: String(date.getDate()),
    };
  });
}

/** "Week of Oct 20" for the week that contains the day. */
export function weekLabel(p_stamp: string): string {
  const first: WeekDay | undefined = weekOf(p_stamp)[0];
  const monday: Date = parseStamp(first?.stamp ?? p_stamp);
  return `Week of ${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

/** "Tuesday, Oct 21". */
export function dayLabel(p_stamp: string): string {
  return parseStamp(p_stamp).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/** Seeded published catalog titles; unknown ids keep a neutral label. */
export function missionTitleOf(p_missionId: string): string {
  const match: { id: string; title: string } | undefined = SEEDED_PUBLISHED_MISSIONS.find(
    (p_mission: { id: string; title: string }): boolean => p_mission.id === p_missionId,
  );
  return match?.title ?? "Published mission";
}

type StatusBadgeProps = {
  status: string;
};

/** Status is icon + label, never color alone (MASTER §4.3). */
export function StatusBadge(p_props: StatusBadgeProps): ReactElement {
  if (p_props.status === "done") {
    return (
      <span data-gk-badge="success">
        <CheckIcon size={14} weight="bold" aria-hidden="true" />
        Done
      </span>
    );
  }
  if (p_props.status === "moved") {
    return (
      <span data-gk-badge="neutral">
        <ArrowsClockwiseIcon size={14} weight="bold" aria-hidden="true" />
        Moved
      </span>
    );
  }
  return (
    <span data-gk-badge="info">
      <CalendarBlankIcon size={14} weight="bold" aria-hidden="true" />
      Planned
    </span>
  );
}

type WeekStripProps = {
  day: string;
  onSelect: (p_day: string) => void;
  /** Days known to hold missions (dot indicator). */
  markedDays?: readonly string[];
};

/** Seven-day strip of the preview Calendar phone, with week paging. */
export function WeekStrip(p_props: WeekStripProps): ReactElement {
  const days: WeekDay[] = weekOf(p_props.day);
  const [today, setToday] = useState<string>("");
  useEffect(() => {
    setToday(toStamp(new Date()));
  }, []);
  const shift = (p_days: number): void => {
    p_props.onSelect(toStamp(addDays(parseStamp(p_props.day), p_days)));
  };

  return (
    <div data-gk-stack>
      <div data-gk-week-head>
        <button
          type="button"
          data-gk-icon-btn
          aria-label="Previous week"
          onClick={(): void => {
            shift(-7);
          }}
        >
          <CaretLeftIcon size={20} aria-hidden="true" />
        </button>
        <p data-gk-caption>
          {parseStamp(p_props.day).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          data-gk-icon-btn
          aria-label="Next week"
          onClick={(): void => {
            shift(7);
          }}
        >
          <CaretRightIcon size={20} aria-hidden="true" />
        </button>
      </div>
      <fieldset data-gk-week aria-label="Days">
        {days.map((p_day: WeekDay) => (
          <button
            key={p_day.stamp}
            type="button"
            data-gk-day
            data-today={p_day.stamp === today ? "true" : "false"}
            data-marked={(p_props.markedDays ?? []).includes(p_day.stamp) ? "true" : "false"}
            aria-pressed={p_day.stamp === p_props.day}
            aria-label={dayLabel(p_day.stamp)}
            onClick={(): void => {
              p_props.onSelect(p_day.stamp);
            }}
          >
            {p_day.weekday}
            <b>{p_day.dayOfMonth}</b>
            <i aria-hidden="true" />
          </button>
        ))}
      </fieldset>
    </div>
  );
}
