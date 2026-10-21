"use client";

import type { ChangeEvent, ReactElement } from "react";
import {
  ArrowsClockwiseIcon,
  CalendarCheckIcon,
  CheckIcon,
  CloudSunIcon,
  LockIcon,
  SunIcon,
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
import { SuggestionLeaf } from "../calendar/day-composite";
import { useFamilySession } from "../context-switch/family-session-context";
import {
  ForecastSessionProvider,
  useForecastSession,
} from "./forecast-session-context";
import type { WeekSuggestionItem } from "./week-suggestion";

const SCREEN_STYLES: string = `
[data-forecast-placed] {
  gap: 14px;
}
[data-forecast-placed-head] {
  display: flex;
  align-items: center;
  gap: 14px;
}
[data-forecast-placed-head] > div {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
}
[data-forecast-placed-head] strong {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}
[data-forecast-move] {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 10px;
}
`;

function ForecastScreenBody(): ReactElement {
  const forecast: ReturnType<typeof useForecastSession> = useForecastSession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const presentation = forecast.presentation;
  const isModalOpen: boolean = forecast.proposal !== null;
  const hasDay: boolean = forecast.day.trim().length > 0;

  return (
    <div data-forecast-screen>
      <style href="forecast-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-gk-screen-frame inert={isModalOpen}>
        <FamilyThumbShell
          sub={weekLabel(forecast.day)}
          title="Week forecast"
          content={
            <>
              <WeekStrip
                day={forecast.day}
                onSelect={forecast.setDay}
                markedDays={
                  presentation.kind === "ready" && presentation.day.getChildren().length > 0
                    ? [presentation.day.p_day]
                    : []
                }
              />
              {presentation.kind === "loading" || session.isLoading ? (
                <LoadingCard label="Loading the forecast" />
              ) : null}
              {presentation.kind === "need-family" && !session.isLoading ? (
                <StateCard icon={CloudSunIcon} title="Week forecast">
                  <p>Opening the family forecast.</p>
                </StateCard>
              ) : null}
              {presentation.kind === "denied" ? (
                <StateCard icon={LockIcon} title="Forecast is Parent only" role="alert">
                  <p>Child view does not put suggestions on the calendar.</p>
                </StateCard>
              ) : null}
              {presentation.kind === "missing" ? (
                <StateCard icon={WarningIcon} title="Family not found">
                  <p>That id does not open the forecast.</p>
                </StateCard>
              ) : null}
              {presentation.kind === "error" ? (
                <StateCard icon={WarningIcon} title="Week forecast" role="alert">
                  <p>{presentation.message}</p>
                </StateCard>
              ) : null}
              {presentation.kind === "ready" ? (
                <>
                  <section data-gk-stack data-gk-enter aria-labelledby="forecast-ideas">
                    <h2 data-gk-sec id="forecast-ideas">Ideas for this week</h2>
                    {presentation.suggestions.length === 0 ? (
                      <StateCard icon={CloudSunIcon} title="No ideas yet">
                        <p>No published suggestions.</p>
                      </StateCard>
                    ) : (
                      <div data-gk-list>
                        {presentation.suggestions.map((p_item: WeekSuggestionItem) => (
                          <div data-gk-row key={p_item.mission_id}>
                            <Well icon={SunIcon} size="sm" />
                            <span data-gk-row-text>
                              <strong>{p_item.title}</strong>
                              <span>Published mission</span>
                            </span>
                            <button
                              type="button"
                              data-gk-btn="secondary"
                              data-size="sm"
                              aria-label={`Place ${p_item.title} on ${dayLabel(forecast.day)}`}
                              disabled={forecast.isSaving || !hasDay}
                              onClick={(): void => {
                                void forecast.drop(p_item.mission_id);
                              }}
                            >
                              Place
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p data-gk-caption>
                      Finite list. Published missions only. Without a day, it does not go on the calendar.
                    </p>
                  </section>
                  <section data-gk-stack data-gk-enter aria-labelledby="forecast-day">
                    <h2 data-gk-sec id="forecast-day">
                      {dayLabel(presentation.day.p_day)}
                    </h2>
                    {presentation.day.getChildren().length === 0 ? (
                      <StateCard icon={CalendarCheckIcon} title="Nothing placed">
                        <p>No suggestions on this day.</p>
                      </StateCard>
                    ) : null}
                    {presentation.day.getChildren().map((p_child, p_index) => {
                      if (!(p_child instanceof SuggestionLeaf)) {
                        return null;
                      }
                      const isScheduled: boolean = p_child.p_item.status === "scheduled";
                      return (
                        <div
                          data-gk-card
                          data-forecast-placed
                          key={`${p_child.p_item.id}-${String(p_index)}`}
                        >
                          <div data-forecast-placed-head>
                            <Well icon={CalendarCheckIcon} size="sm" />
                            <div>
                              <strong>{missionTitleOf(p_child.p_item.mission_id)}</strong>
                            </div>
                            <StatusBadge status={p_child.statusLabel()} />
                          </div>
                          {isScheduled ? (
                            <>
                              <button
                                type="button"
                                data-gk-btn="secondary"
                                data-size="sm"
                                disabled={forecast.isSaving}
                                onClick={(): void => {
                                  void forecast.markDone(p_child.p_item);
                                }}
                              >
                                <CheckIcon size={16} weight="bold" aria-hidden="true" />
                                Mark done
                              </button>
                              <div data-forecast-move>
                                <label data-gk-field>
                                  Move to day
                                  <input
                                    data-gk-input
                                    type="date"
                                    name="target-day"
                                    value={forecast.targetDay}
                                    onChange={(p_event: ChangeEvent<HTMLInputElement>): void => {
                                      forecast.setTargetDay(p_event.currentTarget.value);
                                    }}
                                  />
                                </label>
                                <button
                                  type="button"
                                  data-gk-btn="ghost"
                                  disabled={forecast.isSaving}
                                  onClick={(): void => {
                                    void forecast.moveDay(p_child.p_item);
                                  }}
                                >
                                  <ArrowsClockwiseIcon size={16} weight="bold" aria-hidden="true" />
                                  Move
                                </button>
                              </div>
                            </>
                          ) : null}
                        </div>
                      );
                    })}
                  </section>
                  {forecast.formError !== null && !isModalOpen ? (
                    <p data-gk-alert="danger" role="alert">
                      <WarningIcon size={20} aria-hidden="true" />
                      {forecast.formError}
                    </p>
                  ) : null}
                </>
              ) : null}
            </>
          }
        />
      </div>
      <div
        data-gk-sheet-backdrop
        data-open={isModalOpen ? "true" : "false"}
        role="presentation"
        aria-hidden={!isModalOpen}
        inert={!isModalOpen}
      >
        <div data-gk-sheet role="dialog" aria-modal="true" aria-labelledby="rhythm-proposal-title">
          <span data-gk-grab aria-hidden="true" />
          <h2 id="rhythm-proposal-title">Turn into a rhythm?</h2>
          <p>This mission repeated. Accept saves the rhythm. Dismiss writes nothing.</p>
          {forecast.proposal !== null ? (
            <span data-gk-badge="info">
              <ArrowsClockwiseIcon size={14} weight="bold" aria-hidden="true" />
              {forecast.proposal.weekday}
            </span>
          ) : null}
          {forecast.formError !== null && isModalOpen ? (
            <p data-gk-alert="danger" role="alert">
              <WarningIcon size={20} aria-hidden="true" />
              {forecast.formError}
            </p>
          ) : null}
          <button
            type="button"
            data-gk-btn="secondary"
            disabled={forecast.isSaving}
            onClick={(): void => {
              void forecast.dismissProposal();
            }}
          >
            Dismiss
          </button>
          <button
            type="button"
            data-gk-btn="primary"
            disabled={forecast.isSaving}
            onClick={(): void => {
              void forecast.acceptProposal();
            }}
          >
            Accept rhythm
          </button>
        </div>
      </div>
    </div>
  );
}

export function ForecastScreen(): ReactElement {
  return (
    <ForecastSessionProvider>
      <ForecastScreenBody />
    </ForecastSessionProvider>
  );
}
