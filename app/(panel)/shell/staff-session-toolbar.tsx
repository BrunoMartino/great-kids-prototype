"use client";

import type { ReactElement } from "react";

export type StaffRole = "Admin" | "Operator";

type StaffSessionToolbarProps = {
  activeRole: StaffRole | null;
  onSwitchRole: (p_role: StaffRole) => void;
  isBusy: boolean;
};

const TOOLBAR_STYLES: string = `
[data-staff-toolbar] {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
[data-staff-toolbar-label] {
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-staff-toolbar] button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  min-width: 36px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: var(--color-paper);
  color: var(--color-ink);
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
[data-staff-toolbar] button::-moz-focus-inner {
  border: 0;
  padding: 0;
}
[data-staff-toolbar] button[data-pressed="true"] {
  background: #ededed;
  color: var(--color-ink);
}
[data-staff-toolbar] button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
[data-staff-toolbar] button:active:not(:disabled) {
  transform: translateY(0);
}
[data-staff-toolbar] button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
[data-staff-toolbar] button:focus:not(:focus-visible) {
  outline: none;
}
[data-staff-toolbar] button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
@media (hover: hover) and (pointer: fine) {
  [data-staff-toolbar] button:hover:not(:disabled) {
    background: #efe4d6;
    background: color-mix(in srgb, var(--color-tertiary) 36%, var(--color-paper));
    transform: translateY(-1px);
  }
  [data-staff-toolbar] button[data-pressed="true"]:hover:not(:disabled) {
    background: #ededed;
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-staff-toolbar] button {
    transition: none !important;
    transform: none;
  }
}
`;

export function StaffSessionToolbar(
  p_props: StaffSessionToolbarProps,
): ReactElement {
  return (
    <div data-staff-toolbar data-panel-toolbar>
      <style href="staff-session-toolbar" precedence="medium">
        {TOOLBAR_STYLES}
      </style>
      <span data-staff-toolbar-label data-panel-toolbar-label>
        Session
      </span>
      <button
        type="button"
        data-pressed={p_props.activeRole === "Admin" ? "true" : "false"}
        aria-pressed={p_props.activeRole === "Admin"}
        disabled={p_props.isBusy}
        onClick={(): void => {
          p_props.onSwitchRole("Admin");
        }}
      >
        Admin
      </button>
      <button
        type="button"
        data-pressed={p_props.activeRole === "Operator" ? "true" : "false"}
        aria-pressed={p_props.activeRole === "Operator"}
        disabled={p_props.isBusy}
        onClick={(): void => {
          p_props.onSwitchRole("Operator");
        }}
      >
        Operator
      </button>
    </div>
  );
}

export function staffRoleLabel(p_role: string): string {
  if (p_role === "Admin") {
    return "Admin";
  }
  if (p_role === "Operator") {
    return "Operator";
  }
  if (p_role === "Child") {
    return "Child";
  }
  if (p_role === "Parent") {
    return "Parent";
  }
  return p_role;
}
