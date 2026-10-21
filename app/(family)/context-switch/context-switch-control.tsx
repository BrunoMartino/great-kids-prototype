"use client";

import type { ReactElement } from "react";
import {
  useFamilySession,
  type SessionRole,
} from "./family-session-context";

const CONTROL_STYLES: string = `
[data-context-switch] {
  flex: 0 0 auto;
  padding: 12px 16px 8px;
}
[data-context-switch-track] {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 44px;
  padding: 4px;
  border: 0;
  border-radius: var(--r-pill);
  background: var(--gk-surface-2);
}
[data-context-switch-thumb] {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(50% - 4px);
  border-radius: var(--r-pill);
  background: var(--gk-surface);
  box-shadow: 0 1px 4px var(--gk-border);
  box-shadow: 0 1px 4px color-mix(in srgb, var(--gk-ink) 16%, transparent);
  transform: translate3d(0, 0, 0);
  transition: transform 240ms ease-in-out;
  will-change: transform;
  pointer-events: none;
}
[data-context-switch-thumb][data-role="Child"] {
  transform: translate3d(100%, 0, 0);
}
[data-context-switch-option] {
  position: relative;
  z-index: 1;
  min-height: 44px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--r-pill);
  background: transparent;
  color: var(--gk-ink-muted);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
[data-context-switch-option][aria-pressed="true"] {
  color: var(--gk-ink);
}
[data-context-switch-option]:focus {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}
[data-context-switch-option]:focus:not(:focus-visible) {
  outline: none;
}
[data-context-switch-option]:focus-visible {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}
[data-context-switch-option]:disabled {
  opacity: 1;
  cursor: wait;
}
@media (prefers-reduced-motion: reduce) {
  [data-context-switch-thumb] {
    transition: none;
    will-change: auto;
  }
}
`;

export function ContextSwitchControl(): ReactElement {
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const role: SessionRole = session.snapshot?.role ?? "Parent";
  const isBusy: boolean = session.isLoading || session.isSwitching;

  return (
    <div data-context-switch>
      <style href="context-switch-control" precedence="medium">
        {CONTROL_STYLES}
      </style>
      <div
        data-context-switch-track
        role="group"
        aria-label="Switch Parent or Child view"
      >
        <span data-context-switch-thumb data-role={role} aria-hidden="true" />
        <button
          type="button"
          data-context-switch-option
          aria-pressed={role === "Parent"}
          disabled={isBusy}
          onClick={(): void => {
            void session.switchRole("Parent");
          }}
        >
          Parent
        </button>
        <button
          type="button"
          data-context-switch-option
          aria-pressed={role === "Child"}
          disabled={isBusy}
          onClick={(): void => {
            void session.switchRole("Child");
          }}
        >
          Child
        </button>
      </div>
    </div>
  );
}
