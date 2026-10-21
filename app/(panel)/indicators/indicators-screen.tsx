"use client";

import type { ReactElement } from "react";
import {
  useIndicatorsSession,
  type SwitchableRole,
} from "./indicators-session-context";
import {
  StaffSessionToolbar,
  staffRoleLabel,
} from "../shell/staff-session-toolbar";

const SCREEN_STYLES: string = `
[data-panel-indicators] {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 1120px;
  min-width: 0;
}
[data-panel-indicators] h1 {
  margin: 0;
  font-size: var(--fs-adm-h1);
  line-height: 1.25;
}
[data-panel-indicators] h2 {
  margin: 0;
  font-size: var(--fs-caption);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--gk-ink-muted);
}
[data-panel-indicators] p {
  margin: 0;
  color: var(--gk-ink-muted);
  line-height: 1.45;
}
[data-panel-role] {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 28px;
  padding: 0 10px;
  border-radius: var(--r-pill);
  background: var(--gk-surface-2);
  background: color-mix(in srgb, var(--gk-primary) 14%, var(--gk-surface));
  color: var(--gk-primary);
  font-size: var(--fs-caption);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-panel-toolbar] {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
[data-panel-toolbar-label] {
  color: var(--gk-ink-muted);
  font-size: var(--fs-caption);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-panel-loading],
[data-panel-forbidden],
[data-panel-error],
[data-panel-success] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  max-width: 100%;
  opacity: 1;
  transform: translate3d(0, 0, 0);
  animation: panel-enter 200ms var(--ease-enter) both;
}
[data-panel-loading-bar] {
  width: 100%;
  height: 12px;
  border-radius: var(--r-pill);
  background: var(--gk-surface-2);
  transform-origin: left center;
  transform: translateZ(0);
  animation: panel-load 900ms ease-in-out infinite;
}
[data-panel-indicators] button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  min-width: 36px;
  padding: 0 14px;
  border: 1px solid var(--gk-border-strong);
  border-radius: var(--r-sm);
  background: var(--gk-surface);
  color: var(--gk-primary);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: transform 120ms ease-out, opacity 120ms ease-out;
}
[data-panel-indicators] button::-moz-focus-inner {
  border: 0;
  padding: 0;
}
[data-panel-indicators] button[data-pressed="true"] {
  border-color: var(--gk-primary);
  background: var(--gk-primary);
  color: var(--gk-on-primary);
}
[data-panel-indicators] button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
[data-panel-indicators] button:active:not(:disabled) {
  transform: translateY(0);
}
[data-panel-indicators] button:focus {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}
[data-panel-indicators] button:focus:not(:focus-visible) {
  outline: none;
}
[data-panel-indicators] button:focus-visible {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}
[data-indicator-grid] {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  min-width: 0;
}
[data-indicator-card] {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding: 20px 16px;
  border: 1px solid var(--gk-border);
  border-top: 3px solid var(--viz-1);
  border-radius: var(--r-md);
  background: var(--gk-surface);
  box-shadow: var(--el-2);
  animation: panel-row-enter 200ms var(--ease-enter) both;
}
[data-panel-indicators] [data-indicator-value] {
  margin: 0;
  color: var(--gk-ink);
  font-size: var(--fs-kpi);
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
[data-panel-empty] {
  padding: 8px 0 0;
  color: var(--gk-ink-muted);
}
@keyframes panel-enter {
  from { opacity: 0; transform: translate3d(0, 4px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes panel-row-enter {
  from { opacity: 0; transform: translate3d(0, 4px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes panel-load {
  0% { opacity: 0.45; transform: scaleX(0.55); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.45; transform: scaleX(0.55); }
}
@media (min-width: 768px) {
  [data-indicator-grid] {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (hover: hover) and (pointer: fine) {
  [data-panel-indicators] button:hover:not(:disabled) {
    background: var(--gk-surface-2);
    transform: translateY(-1px);
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-panel-loading],
  [data-panel-forbidden],
  [data-panel-error],
  [data-panel-success],
  [data-indicator-card],
  [data-panel-loading-bar],
  [data-panel-indicators] button {
    animation: none !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition: none !important;
    opacity: 1;
    transform: none;
  }
}
`;

export function IndicatorsScreen(): ReactElement {
  const session: ReturnType<typeof useIndicatorsSession> = useIndicatorsSession();
  const allZero: boolean =
    session.counts !== null &&
    session.counts.scheduled === 0 &&
    session.counts.completed === 0 &&
    session.counts.repeated === 0;

  const onSwitchRole = (p_role: SwitchableRole): void => {
    void session.switchRole(p_role);
  };

  return (
    <div data-panel-indicators>
      <style href="panel-indicators" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <StaffSessionToolbar
        activeRole={session.activeRole}
        onSwitchRole={onSwitchRole}
        isBusy={session.isLoading}
      />
      {session.isLoading ? (
        <div data-panel-loading aria-live="polite" aria-busy="true">
          <span data-panel-role>Indicators</span>
          <h1>Loading indicators</h1>
          <div data-panel-loading-bar />
        </div>
      ) : null}
      {!session.isLoading && session.isForbidden ? (
        <div data-panel-forbidden role="alert">
          <span data-panel-role>Indicators</span>
          <h1>Access denied</h1>
          <p>This panel is staff only.</p>
        </div>
      ) : null}
      {!session.isLoading &&
      !session.isForbidden &&
      session.errorMessage !== null ? (
        <div data-panel-error role="alert">
          <span data-panel-role>Indicators</span>
          <h1>Could not load indicators</h1>
          <p>{session.errorMessage}</p>
        </div>
      ) : null}
      {!session.isLoading &&
      !session.isForbidden &&
      session.errorMessage === null &&
      session.role !== null &&
      session.counts !== null ? (
        <div
          data-panel-success
          data-indicators-id={session.counts.id}
          data-indicators-empty={allZero ? "true" : "false"}
        >
          <span data-panel-role data-role={session.role}>
            {staffRoleLabel(session.role)}
          </span>
          <h1>Indicators</h1>
          <p>What families scheduled, completed, and repeated.</p>
          <div data-indicator-grid>
            <article data-indicator-card data-indicator="scheduled">
              <h2>Scheduled</h2>
              <p data-indicator-value>{session.counts.scheduled}</p>
            </article>
            <article data-indicator-card data-indicator="completed">
              <h2>Completed</h2>
              <p data-indicator-value>{session.counts.completed}</p>
            </article>
            <article data-indicator-card data-indicator="repeated">
              <h2>Repeated</h2>
              <p data-indicator-value>{session.counts.repeated}</p>
            </article>
          </div>
          {allZero ? (
            <p data-panel-empty>
              No activity yet. The three numbers stay at zero.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
