"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import Link from "next/link";
import { FamilyNav } from "../../chrome/family-nav";
import { FamilyThumbShell } from "../../chrome/family-thumb-shell";
import { useFamilySession } from "../../context-switch/family-session-context";
import { CycleSessionProvider, useCycleSession } from "./cycle-session-context";
import type { CycleOfferedCommand } from "./cycle-ui-state";

const SCREEN_STYLES: string = `
[data-cycle-screen] {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
[data-cycle-scroll] {
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
[data-cycle-scroll]::-webkit-scrollbar { width: 4px; }
[data-cycle-scroll]::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-ink) 22%, transparent);
  border-radius: 999px;
}
[data-cycle-screen] h1 { margin: 0; font-size: 1.35rem; line-height: 1.25; }
[data-cycle-screen] h2 { margin: 0; font-size: 1.05rem; }
[data-cycle-screen] p { margin: 0; color: var(--color-muted); line-height: 1.45; }
[data-cycle-badge] {
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
[data-cycle-badge][data-role="Child"] {
  background: color-mix(in srgb, var(--color-child) 14%, var(--color-paper));
  color: var(--color-child);
}
[data-cycle-status] {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-secondary) 16%, var(--color-paper));
  color: var(--color-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-cycle-enter] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: cycle-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes cycle-enter {
  from { opacity: 0; transform: translate3d(0, 8px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
[data-cycle-loading-bar] {
  height: 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  transform-origin: left center;
  animation: cycle-load 900ms ease-in-out infinite;
}
@keyframes cycle-load {
  0% { opacity: 0.45; transform: scaleX(0.55); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.45; transform: scaleX(0.55); }
}
[data-cycle-card],
[data-cycle-tools] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--color-tertiary) 22%, var(--color-paper));
}
[data-cycle-screen] label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--color-muted);
  font-size: 0.85rem;
}
[data-cycle-screen] input {
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
[data-cycle-screen] input:focus,
[data-cycle-screen] button:focus,
[data-cycle-screen] a:focus { outline: 2px solid var(--color-ink); outline-offset: 2px; }
[data-cycle-screen] input:focus:not(:focus-visible),
[data-cycle-screen] button:focus:not(:focus-visible),
[data-cycle-screen] a:focus:not(:focus-visible) { outline: none; }
[data-cycle-screen] input:focus-visible,
[data-cycle-screen] button:focus-visible,
[data-cycle-screen] a:focus-visible { outline: 2px solid var(--color-ink); outline-offset: 2px; }
[data-cycle-actions] { display: flex; flex-direction: column; gap: 8px; }
[data-cycle-screen] button,
[data-cycle-screen] a[data-cycle-link] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  margin: 0;
  padding: 0 16px;
  border: 0;
  border-radius: 14px;
  background: var(--color-primary);
  color: var(--color-paper);
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
[data-cycle-screen] button[data-kind="ghost"],
[data-cycle-screen] a[data-kind="ghost"] {
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  color: var(--color-ink);
}
[data-cycle-screen] button[data-kind="choice"] {
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  color: var(--color-ink);
}
[data-cycle-screen] button[data-kind="choice"][data-on="true"] {
  background: var(--color-secondary);
  color: var(--color-paper);
}
[data-cycle-screen] button:active,
[data-cycle-screen] a[data-cycle-link]:active { opacity: 0.88; }
[data-cycle-screen] button:disabled { opacity: 0.55; cursor: not-allowed; }
[data-cycle-error] { color: var(--color-danger); font-weight: 600; }
[data-cycle-pair] { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
[data-cycle-backdrop] {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  align-items: flex-end;
  padding: 12px;
  background: color-mix(in srgb, var(--color-ink) 38%, transparent);
  opacity: 0;
  pointer-events: none;
  transition: opacity 160ms ease-in;
}
[data-cycle-backdrop][data-open="true"] {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-cycle-sheet] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding: 20px 16px 16px;
  border-radius: 20px 20px 16px 16px;
  background: var(--color-paper);
  opacity: 0;
  transform: translate3d(0, 8px, 0);
  transition: transform 160ms ease-in, opacity 160ms ease-in;
}
[data-cycle-backdrop][data-open="true"] [data-cycle-sheet] {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-cycle-sheet] button { width: 100%; }
[data-cycle-pair] button { width: auto; }
@media (hover: hover) and (pointer: fine) {
  [data-cycle-screen] button:hover:not(:disabled),
  [data-cycle-screen] a[data-cycle-link]:hover { opacity: 0.92; }
}
@media (prefers-reduced-motion: reduce) {
  [data-cycle-screen] *,
  [data-cycle-screen] *::before,
  [data-cycle-screen] *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

function commandLabel(p_command: CycleOfferedCommand): string {
  if (p_command === "start") {
    return "Start";
  }
  return "Complete";
}

function CycleScreenBody(): ReactElement {
  const cycle: ReturnType<typeof useCycleSession> = useCycleSession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const role: string = session.snapshot?.role ?? "none";
  const presentation = cycle.presentation;
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const historyHref: string =
    cycle.familyId.length === 0
      ? "/missions/completed"
      : `/missions/completed?id=${encodeURIComponent(cycle.familyId)}`;

  return (
    <div data-cycle-screen>
      <style href="cycle-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-cycle-scroll inert={cycle.isClosingOpen}>
        <FamilyThumbShell
          content={
            <>
        <FamilyNav familyId={cycle.familyId} active="cycle" />
        <span data-cycle-badge data-role={role}>
          View {role === "none" ? "session" : role}
        </span>
        {presentation.kind === "loading" || session.isLoading ? (
          <div data-cycle-enter aria-live="polite" aria-busy="true">
            <h1>Loading the cycle</h1>
            <div data-cycle-loading-bar />
          </div>
        ) : null}
        {presentation.kind === "need-family" && !session.isLoading ? (
          <div data-cycle-enter>
            <h1>Mission cycle</h1>
            <p>Opening the accepted mission cycle.</p>
          </div>
        ) : null}
        {presentation.kind === "need-cycle" && !session.isLoading ? (
          <div data-cycle-enter>
            <h1>Mission cycle</h1>
            <p>Accept a surprise to start. Illegal transitions are hidden.</p>
          </div>
        ) : null}
        {presentation.kind === "denied" ? (
          <div data-cycle-enter role="alert">
            <h1>Cycle is Parent only</h1>
            <p>Child view cannot advance or complete the mission.</p>
          </div>
        ) : null}
        {presentation.kind === "missing" ? (
          <div data-cycle-enter>
            <h1>Mission not found</h1>
            <p>That id does not open the cycle.</p>
          </div>
        ) : null}
        {presentation.kind === "error" ? (
          <div data-cycle-enter role="alert">
            <h1>Mission cycle</h1>
            <p>{presentation.message}</p>
          </div>
        ) : null}
        {isReady && presentation.kind === "ready" && !session.isLoading ? (
          <div data-cycle-enter data-cycle-card data-status={presentation.status}>
            <span data-cycle-status>{presentation.status}</span>
            <h1>
              {presentation.title.length > 0 ? presentation.title : "Family mission"}
            </h1>
            {presentation.status === "Accepted" ? (
              <p>The family accepted. You can only start — complete is not offered yet.</p>
            ) : null}
            {presentation.status === "Doing" ? (
              <p>They are doing it. The closing question opens only when completing.</p>
            ) : null}
            {presentation.status === "Completed" && presentation.closing !== null ? (
              <p>
                Closing: {presentation.closing.do_again ? "would do again" : "do not repeat"}
                {"; "}
                {presentation.closing.save_memory ? "save in memory" : "do not save"}.
              </p>
            ) : null}
            {cycle.formError !== null ? (
              <p data-cycle-error role="alert">
                {cycle.formError}
              </p>
            ) : null}
          </div>
        ) : null}
            </>
          }
          actions={
            isReady && presentation.kind === "ready" && !session.isLoading ? (
            <div data-cycle-actions>
              {presentation.offered.map((p_command: CycleOfferedCommand) => (
                <button
                  key={p_command}
                  type="button"
                  data-cycle-command={p_command}
                  disabled={cycle.isSaving}
                  onClick={(): void => {
                    if (p_command === "start") {
                      void cycle.startDoing();
                      return;
                    }
                    cycle.openClosing();
                  }}
                >
                  {commandLabel(p_command)}
                </button>
              ))}
              {presentation.status === "Completed" ? (
                <Link href={historyHref} data-cycle-link data-kind="ghost">
                  View completed
                </Link>
              ) : null}
            </div>
            ) : undefined
          }
        />
      </div>
      <div
        data-cycle-backdrop
        data-open={cycle.isClosingOpen ? "true" : "false"}
        role="presentation"
        aria-hidden={!cycle.isClosingOpen}
        inert={!cycle.isClosingOpen}
      >
        <form
          data-cycle-sheet
          role="dialog"
          aria-modal="true"
          aria-labelledby="closing-title"
          onSubmit={(p_event: FormEvent<HTMLFormElement>): void => {
            p_event.preventDefault();
            void cycle.completeMission();
          }}
        >
          <h2 id="closing-title">Close the mission</h2>
          <p>Both answers go with Completed, in the same transaction.</p>
          <p>Would you do it again?</p>
          <div data-cycle-pair>
            <button
              type="button"
              data-kind="choice"
              data-on={cycle.doAgain === true ? "true" : "false"}
              onClick={(): void => {
                cycle.setDoAgain(true);
              }}
            >
              Yes
            </button>
            <button
              type="button"
              data-kind="choice"
              data-on={cycle.doAgain === false ? "true" : "false"}
              onClick={(): void => {
                cycle.setDoAgain(false);
              }}
            >
              No
            </button>
          </div>
          <p>Save this in memory?</p>
          <div data-cycle-pair>
            <button
              type="button"
              data-kind="choice"
              data-on={cycle.saveMemory === true ? "true" : "false"}
              onClick={(): void => {
                cycle.setSaveMemory(true);
              }}
            >
              Yes
            </button>
            <button
              type="button"
              data-kind="choice"
              data-on={cycle.saveMemory === false ? "true" : "false"}
              onClick={(): void => {
                cycle.setSaveMemory(false);
              }}
            >
              No
            </button>
          </div>
          {cycle.formError !== null && cycle.isClosingOpen ? (
            <p data-cycle-error role="alert">
              {cycle.formError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={cycle.isSaving || cycle.doAgain === null || cycle.saveMemory === null}
          >
            Complete
          </button>
          <button
            type="button"
            data-kind="ghost"
            onClick={(): void => {
              cycle.closeClosing();
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export function CycleScreen(): ReactElement {
  return (
    <CycleSessionProvider>
      <CycleScreenBody />
    </CycleSessionProvider>
  );
}
