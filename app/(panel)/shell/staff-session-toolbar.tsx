"use client";

import type { ReactElement } from "react";

export type StaffRole = "Admin" | "Operator";

type StaffSessionToolbarProps = {
  activeRole: StaffRole | null;
  onSwitchRole: (p_role: StaffRole) => void;
  isBusy: boolean;
};

const TOOLBAR_STYLES: string = `
[data-staff-toolbar][data-panel-toolbar] {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  align-self: flex-start;
  gap: 4px;
  padding: 4px;
  border-radius: var(--r-pill);
  background: var(--gk-surface-2);
}
[data-staff-toolbar-label] {
  padding: 0 10px 0 8px;
  color: var(--gk-ink-muted);
  font-size: var(--fs-caption);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-staff-toolbar][data-panel-toolbar] button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  min-width: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: var(--r-pill);
  background: transparent;
  color: var(--gk-ink-muted);
  font: inherit;
  font-size: var(--fs-body-sm);
  font-weight: 600;
  cursor: pointer;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background-color var(--dur-micro) var(--ease-state), color var(--dur-micro) var(--ease-state), box-shadow var(--dur-micro) var(--ease-state);
}
[data-staff-toolbar][data-panel-toolbar] button::-moz-focus-inner {
  border: 0;
  padding: 0;
}
[data-staff-toolbar][data-panel-toolbar] button[data-pressed="true"] {
  background: var(--gk-surface);
  box-shadow: var(--el-1);
  color: var(--gk-primary);
}
[data-staff-toolbar][data-panel-toolbar] button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
[data-staff-toolbar][data-panel-toolbar] button:focus {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}
[data-staff-toolbar][data-panel-toolbar] button:focus:not(:focus-visible) {
  outline: none;
}
[data-staff-toolbar][data-panel-toolbar] button:focus-visible {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}
@media (hover: hover) and (pointer: fine) {
  [data-staff-toolbar][data-panel-toolbar] button:not([data-pressed="true"]):hover:not(:disabled) {
    color: var(--gk-ink);
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-staff-toolbar][data-panel-toolbar] button {
    transition: none !important;
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
