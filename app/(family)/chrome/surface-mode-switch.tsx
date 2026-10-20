"use client";

import type { ReactElement } from "react";
import { usePathname } from "next/navigation";

const USER_HOME: string = "/quiz";
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
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-paper, #f3f8ff) 92%, #fff);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-ink, #1f2a37) 10%, transparent),
    0 12px 28px color-mix(in srgb, var(--color-ink, #1f2a37) 14%, transparent);
  transform: translateY(-50%);
}
[data-panel-header] [data-surface-mode-switch] {
  position: static;
  transform: none;
}
[data-surface-mode-option] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  color: var(--color-muted, #5a6674);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
[data-surface-mode-option="on"] {
  background: var(--color-primary, #ff5a36);
  color: #fff;
}
[data-surface-mode-option]:focus {
  outline: 2px solid var(--color-ink, #1f2a37);
  outline-offset: 2px;
}
[data-surface-mode-option]:focus:not(:focus-visible) {
  outline: none;
}
[data-surface-mode-option]:focus-visible {
  outline: 2px solid var(--color-ink, #1f2a37);
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
