"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  type ReactElement,
} from "react";
import {
  CalendarBlankIcon,
  CalendarCheckIcon,
  CheckIcon,
  LockIcon,
  PlusIcon,
  WarningIcon,
} from "@/app/design-system/icons";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import { LoadingCard, StateCard, Well } from "../chrome/family-ui";
import {
  StatusBadge,
  WeekStrip,
  dayLabel,
  missionTitleOf,
  weekLabel,
} from "../chrome/family-week";
import { useFamilySession } from "../context-switch/family-session-context";
import { SuggestionLeaf } from "./day-composite";
import { SEEDED_PUBLISHED_MISSIONS } from "../chrome/seeded-family";
import {
  CalendarSessionProvider,
  useCalendarSession,
} from "./calendar-session-context";

function CalendarScreenBody(): ReactElement {
  const calendar: ReturnType<typeof useCalendarSession> = useCalendarSession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const presentation = calendar.presentation;
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const isReady: boolean = presentation.kind === "ready";

  const onPreview = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    void calendar.previewMission();
  };

  const closeSheet = (): void => {
    setIsSheetOpen(false);
  };

  return (
    <div data-calendar-screen>
      <div data-gk-screen-frame inert={isSheetOpen}>
        <FamilyThumbShell
          sub={weekLabel(calendar.day)}
          title="Calendar"
          content={
            <>
              <WeekStrip
                day={calendar.day}
                onSelect={calendar.setDay}
                markedDays={
                  presentation.kind === "ready" && presentation.day.getChildren().length > 0
                    ? [presentation.day.p_day]
                    : []
                }
              />
              {presentation.kind === "loading" || session.isLoading ? (
                <LoadingCard label="Loading the calendar" />
              ) : null}
              {presentation.kind === "need-family" && !session.isLoading ? (
                <StateCard icon={CalendarBlankIcon} title="Family calendar">
                  <p>Opening the family calendar.</p>
                </StateCard>
              ) : null}
              {presentation.kind === "denied" ? (
                <StateCard icon={LockIcon} title="Calendar is Parent only" role="alert">
                  <p>Child view does not schedule missions.</p>
                </StateCard>
              ) : null}
              {presentation.kind === "missing" ? (
                <StateCard icon={WarningIcon} title="Family not found">
                  <p>That id does not open the calendar.</p>
                </StateCard>
              ) : null}
              {presentation.kind === "error" ? (
                <StateCard icon={WarningIcon} title="Family calendar" role="alert">
                  <p>{presentation.message}</p>
                </StateCard>
              ) : null}
              {presentation.kind === "ready" ? (
                <section data-gk-stack data-gk-enter aria-labelledby="calendar-day-title">
                  <h2 data-gk-sec id="calendar-day-title">
                    {dayLabel(presentation.day.p_day)}
                  </h2>
                  {presentation.day.getChildren().length === 0 ? (
                    <StateCard icon={CalendarBlankIcon} title="Nothing planned">
                      <p>No missions on this day. Add a published mission below.</p>
                    </StateCard>
                  ) : (
                    <div data-gk-list>
                      {presentation.day.getChildren().map((p_child, p_index) => {
                        if (!(p_child instanceof SuggestionLeaf)) {
                          return null;
                        }
                        const isDone: boolean = p_child.p_item.status === "done";
                        return (
                          <div data-gk-row key={`${p_child.p_item.id}-${String(p_index)}`}>
                            <Well
                              icon={isDone ? CheckIcon : CalendarCheckIcon}
                              tone={isDone ? "warm" : "sea"}
                              size="sm"
                            />
                            <span data-gk-row-text>
                              <strong>{missionTitleOf(p_child.p_item.mission_id)}</strong>
                              <span>Published mission</span>
                            </span>
                            <StatusBadge status={p_child.statusLabel()} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              ) : null}
              {calendar.formError !== null && !isSheetOpen ? (
                <p data-gk-alert="danger" role="alert">
                  <WarningIcon size={20} aria-hidden="true" />
                  {calendar.formError}
                </p>
              ) : null}
            </>
          }
          actions={
            isReady ? (
              <div data-gk-action-row>
                <button
                  type="button"
                  data-gk-btn="primary"
                  onClick={(): void => {
                    setIsSheetOpen(true);
                  }}
                >
                  <PlusIcon size={18} weight="bold" aria-hidden="true" />
                  Add a mission
                </button>
              </div>
            ) : undefined
          }
        />
      </div>
      <div
        data-gk-sheet-backdrop
        data-open={isSheetOpen ? "true" : "false"}
        aria-hidden={!isSheetOpen}
        inert={!isSheetOpen}
        onClick={(p_event: MouseEvent<HTMLDivElement>): void => {
          if (p_event.target === p_event.currentTarget) {
            closeSheet();
          }
        }}
      >
        <form
          data-gk-sheet
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-sheet-title"
          onSubmit={onPreview}
        >
          <span data-gk-grab aria-hidden="true" />
          <h2 id="calendar-sheet-title">Schedule a published mission</h2>
          <p>{dayLabel(calendar.day)}</p>
          <label data-gk-field>
            Published mission
            <select
              data-gk-input
              name="mission-id"
              value={calendar.missionDraft}
              onChange={(p_event: ChangeEvent<HTMLSelectElement>): void => {
                calendar.setMissionDraft(p_event.currentTarget.value);
              }}
            >
              {SEEDED_PUBLISHED_MISSIONS.map((p_mission) => (
                <option key={p_mission.id} value={p_mission.id}>
                  {p_mission.title}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" data-gk-btn="secondary">
            Check publication
          </button>
          {calendar.unpublishedTried ? (
            <p data-gk-alert="danger" role="alert">
              <WarningIcon size={20} aria-hidden="true" />
              Unpublished mission. It does not appear and cannot be scheduled.
            </p>
          ) : null}
          {calendar.published !== null ? (
            <p data-gk-alert="success" role="status">
              <CheckIcon size={20} aria-hidden="true" />
              {calendar.published.getTitle()}
            </p>
          ) : null}
          <button
            type="button"
            data-gk-btn="primary"
            disabled={calendar.isSaving || calendar.published === null}
            onClick={(): void => {
              void calendar.schedule();
            }}
          >
            Schedule on this day
          </button>
          <label data-gk-field>
            Move to day
            <input
              data-gk-input
              type="date"
              name="target-day"
              value={calendar.targetDay}
              onChange={(p_event: ChangeEvent<HTMLInputElement>): void => {
                calendar.setTargetDay(p_event.currentTarget.value);
              }}
            />
          </label>
          <button
            type="button"
            data-gk-btn="secondary"
            disabled={calendar.isSaving || calendar.published === null}
            onClick={(): void => {
              void calendar.move();
            }}
          >
            Move
          </button>
          {calendar.formError !== null ? (
            <p data-gk-alert="danger" role="alert">
              <WarningIcon size={20} aria-hidden="true" />
              {calendar.formError}
            </p>
          ) : null}
          <button type="button" data-gk-btn="ghost" onClick={closeSheet}>
            Close
          </button>
        </form>
      </div>
    </div>
  );
}

export function CalendarScreen(): ReactElement {
  return (
    <CalendarSessionProvider>
      <CalendarScreenBody />
    </CalendarSessionProvider>
  );
}
