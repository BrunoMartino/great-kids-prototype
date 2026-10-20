"use client";

import { type ReactElement } from "react";
import { FamilyNav } from "../../chrome/family-nav";
import { FamilyThumbShell } from "../../chrome/family-thumb-shell";
import { useFamilySession } from "../../context-switch/family-session-context";
import type { CompletedMissionItem } from "./completed-payload";
import {
  CompletedSessionProvider,
  useCompletedSession,
} from "./completed-session-context";

const SCREEN_STYLES: string = `
[data-completed-screen] {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
[data-completed-scroll] {
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
[data-completed-scroll]::-webkit-scrollbar { width: 4px; }
[data-completed-scroll]::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-ink) 22%, transparent);
  border-radius: 999px;
}
[data-completed-screen] h1 { margin: 0; font-size: 1.35rem; line-height: 1.25; }
[data-completed-screen] h2 { margin: 0; font-size: 1.05rem; }
[data-completed-screen] p { margin: 0; color: var(--color-muted); line-height: 1.45; }
[data-completed-badge] {
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
[data-completed-badge][data-role="Child"] {
  background: color-mix(in srgb, var(--color-child) 14%, var(--color-paper));
  color: var(--color-child);
}
[data-completed-enter] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: completed-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes completed-enter {
  from { opacity: 0; transform: translate3d(0, 8px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
[data-completed-loading-bar] {
  height: 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  transform-origin: left center;
  animation: completed-load 900ms ease-in-out infinite;
}
@keyframes completed-load {
  0% { opacity: 0.45; transform: scaleX(0.55); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.45; transform: scaleX(0.55); }
}
[data-completed-card],
[data-completed-tools],
[data-completed-item] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--color-tertiary) 22%, var(--color-paper));
}
[data-completed-list] {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
[data-completed-item] {
  animation: completed-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
[data-completed-screen] label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--color-muted);
  font-size: 0.85rem;
}
[data-completed-screen] input {
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
[data-completed-screen] input:focus,
[data-completed-screen] button:focus { outline: 2px solid var(--color-ink); outline-offset: 2px; }
[data-completed-screen] input:focus:not(:focus-visible),
[data-completed-screen] button:focus:not(:focus-visible) { outline: none; }
[data-completed-screen] input:focus-visible,
[data-completed-screen] button:focus-visible { outline: 2px solid var(--color-ink); outline-offset: 2px; }
[data-completed-screen] button {
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
[data-completed-screen] button[data-kind="ghost"] {
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  color: var(--color-ink);
}
[data-completed-screen] button:active { opacity: 0.88; }
[data-completed-screen] button:disabled { opacity: 0.55; cursor: not-allowed; }
[data-completed-empty] { font-weight: 600; }
[data-completed-meta] {
  color: var(--color-muted);
  font-size: 0.85rem;
}
@media (hover: hover) and (pointer: fine) {
  [data-completed-screen] button:hover:not(:disabled) { opacity: 0.92; }
}
@media (prefers-reduced-motion: reduce) {
  [data-completed-screen] *,
  [data-completed-screen] *::before,
  [data-completed-screen] *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

function closingCopy(p_item: CompletedMissionItem): string {
  if (p_item.closing === null) {
    return "No closing.";
  }
  const again: string = p_item.closing.do_again ? "would do again" : "do not repeat";
  const memory: string = p_item.closing.save_memory
    ? "save in memory"
    : "do not save";
  return `${again}; ${memory}`;
}

function CompletedScreenBody(): ReactElement {
  const history: ReturnType<typeof useCompletedSession> = useCompletedSession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const role: string = session.snapshot?.role ?? "none";
  const presentation = history.presentation;

  return (
    <div data-completed-screen>
      <style href="completed-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-completed-scroll>
        <FamilyThumbShell
          content={
            <>
        <FamilyNav familyId={history.familyId} active="completed" />
        <span data-completed-badge data-role={role}>
          View {role === "none" ? "session" : role}
        </span>
        {null}
        {presentation.kind === "loading" || session.isLoading ? (
          <div data-completed-enter aria-live="polite" aria-busy="true">
            <h1>Loading completed missions</h1>
            <div data-completed-loading-bar />
          </div>
        ) : null}
        {presentation.kind === "need-family" && !session.isLoading ? (
          <div data-completed-enter>
            <h1>Completed missions</h1>
            <p>Opening family history.</p>
          </div>
        ) : null}
        {presentation.kind === "denied" ? (
          <div data-completed-enter role="alert">
            <h1>History is Parent only</h1>
            <p>Child view does not list completed missions.</p>
          </div>
        ) : null}
        {presentation.kind === "missing" ? (
          <div data-completed-enter>
            <h1>Family not found</h1>
            <p>That id does not open history.</p>
          </div>
        ) : null}
        {presentation.kind === "error" ? (
          <div data-completed-enter role="alert">
            <h1>Completed missions</h1>
            <p>{presentation.message}</p>
          </div>
        ) : null}
        {presentation.kind === "empty" ? (
          <div data-completed-enter data-completed-empty-state="true">
            <div data-completed-card>
              <h1 data-completed-empty>No completed missions.</h1>
              <p>The envelope arrives empty. Drafts and in-progress missions stay out.</p>
            </div>
          </div>
        ) : null}
        {presentation.kind === "ready" ? (
          <div data-completed-enter data-completed-list>
            <h1>Completed missions</h1>
            {presentation.missions.map((p_item: CompletedMissionItem) => (
              <article key={p_item.id} data-completed-item>
                <h2>{p_item.title}</h2>
                <p data-completed-meta>
                  {p_item.completed_at ?? "No date"} · {closingCopy(p_item)}
                </p>
              </article>
            ))}
          </div>
        ) : null}
            </>
          }
        />
      </div>
    </div>
  );
}

export function CompletedScreen(): ReactElement {
  return (
    <CompletedSessionProvider>
      <CompletedScreenBody />
    </CompletedSessionProvider>
  );
}
