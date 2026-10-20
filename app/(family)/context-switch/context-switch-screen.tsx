"use client";

import { useState, type ReactElement } from "react";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import { useFamilySession } from "./family-session-context";

type HolderAction = "plan" | "invite";

const SCREEN_STYLES: string = `
[data-context-switch-screen] {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
[data-context-switch-scroll] {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 16px;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 8px 4px 16px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: #c4b8ac transparent;
  scrollbar-color: color-mix(in srgb, var(--color-ink) 22%, transparent) transparent;
}
[data-context-switch-scroll]::-webkit-scrollbar {
  width: 4px;
}
[data-context-switch-scroll]::-webkit-scrollbar-thumb {
  background: #c4b8ac;
  background: color-mix(in srgb, var(--color-ink) 22%, transparent);
  border-radius: 999px;
}
[data-context-switch-screen] h1 {
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.25;
}
[data-context-switch-screen] p {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.45;
}
[data-session-badge] {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  width: fit-content;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #efdfd8;
  background: color-mix(in srgb, var(--color-primary) 14%, var(--color-paper));
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-session-badge][data-role="Child"] {
  background: #e8e1e2;
  background: color-mix(in srgb, var(--color-child) 14%, var(--color-paper));
  color: var(--color-child);
}
[data-family-views] {
  display: grid;
  overflow-anchor: none;
}
[data-family-view] {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  contain: layout;
  opacity: 0;
  transform: translate3d(0, 4px, 0);
  pointer-events: none;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transition: opacity 160ms ease-in, transform 160ms ease-in;
}
[data-family-view][data-active="true"] {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  pointer-events: auto;
  transition: opacity 280ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-family-card] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 20px;
  background: #f3e6d8;
  background: color-mix(in srgb, var(--color-tertiary) 28%, var(--color-paper));
}
[data-family-actions] {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
[data-family-actions] button {
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
[data-family-actions] button[data-kind="invite"] {
  background: var(--color-secondary);
}
[data-family-view="child"] [data-family-actions] button {
  background: #d9d3ce;
  background: color-mix(in srgb, var(--color-ink) 18%, var(--color-paper));
  color: var(--color-muted);
}
[data-family-actions] button:focus {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
[data-family-actions] button:focus:not(:focus-visible) {
  outline: none;
}
[data-family-actions] button:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
[data-family-notice] {
  min-height: 44px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #e8e7dd;
  background: color-mix(in srgb, var(--color-success) 12%, var(--color-paper));
  color: var(--color-success);
  opacity: 1;
  transform: translate3d(0, 0, 0);
  transition: opacity 280ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-family-notice][data-open="false"] {
  min-height: 0;
  padding: 0;
  overflow: hidden;
  opacity: 0;
  transform: translate3d(0, 4px, 0);
  pointer-events: none;
  transition: opacity 160ms ease-in, transform 160ms ease-in;
}
[data-session-loading],
[data-session-error] {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
[data-session-loading-bar] {
  height: 12px;
  border-radius: 999px;
  background: #eae3de;
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  transform-origin: left center;
  transform: translateZ(0);
  animation: session-load 900ms ease-in-out infinite;
}
@keyframes session-load {
  0% { opacity: 0.45; transform: scaleX(0.55); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.45; transform: scaleX(0.55); }
}
[data-deny-backdrop] {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  background: rgba(44, 42, 40, 0.36);
  background: color-mix(in srgb, var(--color-ink) 36%, transparent);
  opacity: 0;
  pointer-events: none;
  transition: opacity 160ms ease-in;
}
[data-deny-backdrop][data-open="true"] {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-deny-sheet] {
  width: 100%;
  max-width: 100%;
  padding: 20px 16px 16px;
  border-radius: 20px 20px 16px 16px;
  background: var(--color-paper);
  color: var(--color-ink);
  opacity: 0;
  transform: translate3d(0, 8px, 0);
  transition: transform 160ms ease-in, opacity 160ms ease-in;
}
[data-deny-backdrop][data-open="true"] [data-deny-sheet] {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-deny-sheet] h2 {
  margin: 0 0 8px;
  font-size: 1.1rem;
}
[data-deny-sheet] button {
  width: 100%;
  min-height: 44px;
  margin-top: 16px;
  padding: 0 16px;
  border: 0;
  border-radius: 14px;
  background: var(--color-child);
  color: var(--color-paper);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
[data-deny-sheet] button:focus {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
[data-deny-sheet] button:focus:not(:focus-visible) {
  outline: none;
}
[data-deny-sheet] button:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  [data-family-view],
  [data-family-notice],
  [data-session-loading-bar],
  [data-deny-backdrop],
  [data-deny-sheet] {
    animation: none !important;
    transition: none !important;
  }
}
`;

function denyCopy(p_action: HolderAction): string {
  if (p_action === "plan") {
    return "Child view cannot change the plan. You stay in the child view.";
  }
  return "Child view cannot invite adults. You stay in the child view.";
}

function parentCopy(p_action: HolderAction): string {
  if (p_action === "plan") {
    return "Parent view: changing the plan is available to the account holder.";
  }
  return "Parent view: inviting adults is available to the account holder.";
}

export function ContextSwitchScreen(): ReactElement {
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const [denyAction, setDenyAction] = useState<HolderAction | null>(null);
  const [lastDenyAction, setLastDenyAction] = useState<HolderAction>("plan");
  const [parentAction, setParentAction] = useState<HolderAction | null>(null);
  const role: "Parent" | "Child" | null = session.snapshot?.role ?? null;
  const isParent: boolean = role === "Parent";
  const isChild: boolean = role === "Child";
  const isDenyOpen: boolean = denyAction !== null && isChild;

  const onHolderAction = (p_action: HolderAction): void => {
    if (session.snapshot === null) {
      return;
    }
    if (session.snapshot.role === "Child") {
      setParentAction(null);
      setLastDenyAction(p_action);
      setDenyAction(p_action);
      return;
    }
    setDenyAction(null);
    setParentAction(p_action);
  };

  return (
    <div
      data-context-switch-screen
      data-session-role={role ?? "none"}
      data-presentation={session.snapshot?.presentation ?? "none"}
    >
      <style href="context-switch-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-context-switch-scroll inert={isDenyOpen}>
        <FamilyThumbShell
          content={
            <>
      {session.isLoading ? (
        <div data-session-loading aria-live="polite" aria-busy="true">
          <span data-session-badge>Session</span>
          <h1>Loading the family view</h1>
          <div data-session-loading-bar />
        </div>
      ) : null}
      {!session.isLoading && session.snapshot === null ? (
        <div data-session-error role="alert">
          <span data-session-badge>Session</span>
          <h1>No mock session</h1>
          <p>{session.errorMessage}</p>
        </div>
      ) : null}
      {session.snapshot !== null ? (
        <>
          <span data-session-badge data-role={session.snapshot.role}>
            View {session.snapshot.role}
          </span>
          <div data-family-views>
            <section
              data-family-view="parent"
              data-active={isParent ? "true" : "false"}
              aria-hidden={!isParent}
              inert={!isParent}
            >
              <h1>Family home</h1>
              <p>
                Default mock session: Parent. A child is not an account and has no photo.
              </p>
              <p
                  data-family-notice
                  data-open={parentAction !== null && isParent ? "true" : "false"}
                >
                  {parentAction !== null ? parentCopy(parentAction) : ""}
                </p>
            </section>
            <section
              data-family-view="child"
              data-active={isChild ? "true" : "false"}
              aria-hidden={!isChild}
              inert={!isChild}
            >
              <h1>Child view</h1>
              <p>
                Context switch only. No Child login is created. Plan and invites stay locked.
              </p>
            </section>
          </div>
        </>
      ) : null}
            </>
          }
          actions={
            session.snapshot !== null ? (
                <div data-family-actions>
                  <button
                    type="button"
                    data-kind="plan"
                    onClick={(): void => {
                      onHolderAction("plan");
                    }}
                  >
                    Change plan
                  </button>
                  <button
                    type="button"
                    data-kind="invite"
                    onClick={(): void => {
                      onHolderAction("invite");
                    }}
                  >
                    Invite family member
                  </button>
                </div>
            ) : undefined
          }
        />
      </div>
      <div
        data-deny-backdrop
        data-open={isDenyOpen ? "true" : "false"}
        role="presentation"
        aria-hidden={!isDenyOpen}
        inert={!isDenyOpen}
      >
        <div
          data-deny-sheet
          role="dialog"
          aria-modal="true"
          aria-labelledby="child-deny-title"
        >
          <h2 id="child-deny-title">Action blocked</h2>
          <p>{denyCopy(lastDenyAction)}</p>
          <button
            type="button"
            onClick={(): void => {
              setDenyAction(null);
            }}
          >
            Stay in Child view
          </button>
        </div>
      </div>
    </div>
  );
}
