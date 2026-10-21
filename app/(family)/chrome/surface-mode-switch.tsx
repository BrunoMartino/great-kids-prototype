"use client";

import type { ReactElement } from "react";
import { usePathname } from "next/navigation";

const USER_HOME: string = "/context-switch";
const ADMIN_HOME: string = "/catalog";

const ADMIN_PREFIXES: readonly string[] = [
  "/catalog",
  "/materials",
  "/questions",
  "/families",
  "/plans",
  "/users",
  "/indicators",
  "/contexts",
];

const SWITCH_STYLES: string = `
[data-surface-mode-switch] {
  position: absolute;
  left: 16px;
  top: 50%;
  z-index: 8;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: max-content;
  padding: 4px;
  border: 0;
  border-radius: var(--r-pill);
  background: var(--gk-surface);
  box-shadow: 0 0 0 1px var(--gk-border), var(--el-2);
  transform: translateY(-50%);
}
[data-panel-topbar] [data-surface-mode-switch] {
  position: static;
  box-shadow: 0 0 0 1px var(--gk-border);
  transform: none;
}
[data-panel-topbar] [data-surface-mode-option] {
  min-width: 64px;
  min-height: 32px;
}
[data-surface-mode-option] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: var(--r-pill);
  color: var(--gk-ink-muted);
  font-size: var(--fs-body-sm);
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background-color var(--dur-micro) var(--ease-state), color var(--dur-micro) var(--ease-state);
}
[data-surface-mode-option="on"] {
  background: var(--gk-primary);
  color: var(--gk-on-primary);
}
@media (hover: hover) and (pointer: fine) {
  [data-surface-mode-option="off"]:hover {
    background: var(--gk-surface-2);
    color: var(--gk-ink);
  }
}
[data-surface-mode-option]:focus {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}
[data-surface-mode-option]:focus:not(:focus-visible) {
  outline: none;
}
[data-surface-mode-option]:focus-visible {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  [data-surface-mode-option] {
    transition: none !important;
  }
}
`

function isAdminPath(p_path: string): boolean {
  if (p_path === "/") {
    return true;
  }
  return ADMIN_PREFIXES.some((p_prefix: string): boolean => {
    return p_path === p_prefix || p_path.startsWith(`${p_prefix}/`);
  });
}

export function SurfaceModeSwitch(): ReactElement {
  const path: string = usePathname();
  const admin: boolean = isAdminPath(path);

  return (
    <nav data-surface-mode-switch aria-label="Screen mode">
      <style href="surface-mode-switch" precedence="low">
        {SWITCH_STYLES}
      </style>
      <a
        href={USER_HOME}
        data-surface-mode-option={admin ? "off" : "on"}
        aria-current={admin ? undefined : "page"}
      >
        User
      </a>
      <a
        href={ADMIN_HOME}
        data-surface-mode-option={admin ? "on" : "off"}
        aria-current={admin ? "page" : undefined}
      >
        Admin
      </a>
    </nav>
  );
}
