"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import { FamilyNav } from "../chrome/family-nav";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import { useFamilySession } from "../context-switch/family-session-context";
import { SuggestionLeaf } from "./day-composite";
import { SEEDED_PUBLISHED_MISSIONS } from "../chrome/seeded-family";
import {
  CalendarSessionProvider,
  useCalendarSession,
} from "./calendar-session-context";

const SCREEN_STYLES: string = `
[data-calendar-screen] {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
[data-calendar-scroll] {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 16px;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overflow-anchor: none;
  padding: 8px 4px 16px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--color-ink) 22%, transparent) transparent;
}
[data-calendar-scroll]::-webkit-scrollbar { width: 4px; }
[data-calendar-scroll]::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-ink) 22%, transparent);
  border-radius: 999px;
}
[data-calendar-screen] h1 { margin: 0; font-size: 1.35rem; line-height: 1.25; }
[data-calendar-screen] h2 { margin: 0; font-size: 1.05rem; }
[data-calendar-screen] p { margin: 0; color: var(--color-muted); line-height: 1.45; }
[data-calendar-badge] {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-primary) 14%, var(--color-paper));
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-calendar-badge][data-role="Child"] {
  background: color-mix(in srgb, var(--color-child) 14%, var(--color-paper));
  color: var(--color-child);
}
[data-calendar-enter] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: calendar-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes calendar-enter {
  from { opacity: 0; transform: translate3d(0, 8px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
[data-calendar-loading-bar] {
  height: 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  transform-origin: left center;
  animation: calendar-load 900ms ease-in-out infinite;
}
@keyframes calendar-load {
  0% { opacity: 0.45; transform: scaleX(0.55); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.45; transform: scaleX(0.55); }
}
[data-calendar-card],
[data-calendar-tools] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--color-tertiary) 22%, var(--color-paper));
}
[data-calendar-screen] label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--color-muted);
  font-size: 0.85rem;
}
[data-calendar-screen] input,
[data-calendar-screen] select {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  padding: 0 14px;
  border: 1px solid color-mix(in srgb, var(--color-ink) 14%, var(--color-tertiary));
  border-radius: 14px;
  background: var(--color-paper);
  color: var(--color-ink);
  font: inherit;
  font-size: 16px;
  -webkit-appearance: none;
  appearance: none;
}
[data-calendar-screen] input:focus,
[data-calendar-screen] button:focus { outline: 2px solid var(--color-ink); outline-offset: 2px; }
[data-calendar-screen] input:focus:not(:focus-visible),
[data-calendar-screen] button:focus:not(:focus-visible) { outline: none; }
[data-calendar-screen] input:focus-visible,
[data-calendar-screen] button:focus-visible { outline: 2px solid var(--color-ink); outline-offset: 2px; }
[data-calendar-screen] button {
  min-height: 44px;
  margin: 0;
  padding: 0 16px;
  border: 0;
  border-radius: 14px;
  background: var(--color-primary);
  color: var(--color-paper);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
[data-calendar-screen] button[data-kind="ghost"] {
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  color: var(--color-ink);
}
[data-calendar-screen] button:active { opacity: 0.88; }
[data-calendar-screen] button:disabled { opacity: 0.55; cursor: not-allowed; }
[data-calendar-error] { color: var(--color-danger); font-weight: 600; }
[data-calendar-success] { color: var(--color-success); font-weight: 600; }
@media (hover: hover) and (pointer: fine) {
  [data-calendar-screen] button:hover:not(:disabled) { opacity: 0.92; }
}
@media (prefers-reduced-motion: reduce) {
  [data-calendar-screen] *,
  [data-calendar-screen] *::before,
  [data-calendar-screen] *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

function CalendarScreenBody(): ReactElement {
  const calendar: ReturnType<typeof useCalendarSession> = useCalendarSession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const role: string = session.snapshot?.role ?? "none";
  const presentation = calendar.presentation;

  const onApply = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    calendar.applyId();
  };

  const onPreview = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    void calendar.previewMission();
  };

  return (
    <div data-calendar-screen>
      <style href="calendar-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-calendar-scroll>
        <FamilyThumbShell
          content={
            <>
        <FamilyNav familyId={calendar.familyId} active="calendar" />
        <span data-calendar-badge data-role={role}>
          View {role === "none" ? "session" : role}
        </span>
        {presentation.kind === "loading" || session.isLoading ? (
          <div data-calendar-enter aria-live="polite" aria-busy="true">
            <h1>Loading the calendar</h1>
            <div data-calendar-loading-bar />
          </div>
        ) : null}
        {presentation.kind === "need-family" && !session.isLoading ? (
          <div data-calendar-enter>
            <h1>Family calendar</h1>
            <p>Opening the family calendar.</p>
          </div>
        ) : null}
        {presentation.kind === "denied" ? (
          <div data-calendar-enter role="alert">
            <h1>Calendar is Parent only</h1>
            <p>Child view does not schedule missions.</p>
          </div>
        ) : null}
        {presentation.kind === "missing" ? (
          <div data-calendar-enter>
            <h1>Family not found</h1>
            <p>That id does not open the calendar.</p>
          </div>
        ) : null}
        {presentation.kind === "error" ? (
          <div data-calendar-enter role="alert">
            <h1>Family calendar</h1>
            <p>{presentation.message}</p>
          </div>
        ) : null}
        {presentation.kind === "ready" ? (
          <div data-calendar-enter>
            <h1>Family calendar</h1>
            <p>
              {presentation.day.p_day} · {presentation.day.statusLabel()}
            </p>
            {presentation.day.getChildren().length === 0 ? (
              <div data-calendar-card>
                <p>No suggestions on this day.</p>
              </div>
            ) : null}
            {presentation.day.getChildren().map((p_child, p_index) => (
              <div data-calendar-card key={`${p_child.statusLabel()}-${String(p_index)}`}>
                <h2>{p_child.statusLabel()}</h2>
                {p_child instanceof SuggestionLeaf ? (
                  <p>{p_child.p_item.mission_id}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
            </>
          }
          actions={
            <>
        <form data-calendar-tools onSubmit={onApply}>
          <label>
            Day
            <input
              type="date"
              name="day"
              value={calendar.day}
              onChange={(p_event: ChangeEvent<HTMLInputElement>): void => {
                calendar.setDay(p_event.currentTarget.value);
              }}
            />
          </label>
          <button type="submit">Open day</button>
        </form>
        {presentation.kind === "ready" ? (
            <form data-calendar-card onSubmit={onPreview}>
              <h2>Schedule a published mission</h2>
              <label>
                Published mission
                <select
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
              <button type="submit" data-kind="ghost">
                Check publication
              </button>
              {calendar.unpublishedTried ? (
                <p data-calendar-error>
                  Unpublished mission. It does not appear and cannot be scheduled.
                </p>
              ) : null}
              {calendar.published !== null ? (
                <p data-calendar-success>{calendar.published.getTitle()}</p>
              ) : null}
              <button
                type="button"
                disabled={calendar.isSaving || calendar.published === null}
                onClick={(): void => {
                  void calendar.schedule();
                }}
              >
                Schedule on this day
              </button>
              <label>
                Move to day
                <input
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
                data-kind="ghost"
                disabled={calendar.isSaving || calendar.published === null}
                onClick={(): void => {
                  void calendar.move();
                }}
              >
                Move
              </button>
              {calendar.formError !== null ? (
                <p data-calendar-error role="alert">
                  {calendar.formError}
                </p>
              ) : null}
            </form>
        ) : null}
            </>
          }
        />
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
