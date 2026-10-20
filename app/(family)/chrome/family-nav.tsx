"use client";

import type { ReactElement } from "react";
import Link from "next/link";

export type FamilyNavArea =
  | "quiz"
  | "profile"
  | "calendar"
  | "forecast"
  | "surprise"
  | "cycle"
  | "completed"
  | "diary";

type FamilyNavProps = {
  familyId: string;
  active: FamilyNavArea;
};

const AREA_PATH: Record<FamilyNavArea, string> = {
  quiz: "/quiz",
  profile: "/profile",
  calendar: "/calendar",
  forecast: "/forecast",
  surprise: "/missions/surprise",
  cycle: "/missions/cycle",
  completed: "/missions/completed",
  diary: "/diary",
};

const NAV_STYLES: string = `
[data-family-nav] {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 8px;
  flex: 0 0 auto;
  min-width: 0;
}
[data-family-nav] a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 44px;
  padding: 0 8px;
  border-radius: 14px;
  background: #eee8e2;
  background: color-mix(in srgb, var(--color-ink) 8%, var(--color-paper));
  color: var(--color-muted);
  font: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
[data-family-nav] a[data-active="true"] {
  background: var(--color-primary);
  color: var(--color-paper);
}
[data-family-nav] a:focus {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
[data-family-nav] a:focus:not(:focus-visible) {
  outline: none;
}
[data-family-nav] a:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
[data-family-nav] a:active {
  opacity: 0.88;
}
`;

function hrefFor(p_area: FamilyNavArea, p_familyId: string): string {
  const path: string = AREA_PATH[p_area];
  const trimmed: string = p_familyId.trim();
  if (trimmed.length === 0) {
    return path;
  }
  return `${path}?id=${encodeURIComponent(trimmed)}`;
}

export function FamilyNav(p_props: FamilyNavProps): ReactElement {
  return (
    <nav data-family-nav aria-label="Família">
      <style href="family-nav" precedence="medium">
        {NAV_STYLES}
      </style>
      <Link
        href={hrefFor("quiz", p_props.familyId)}
        data-active={p_props.active === "quiz" ? "true" : "false"}
      >
        Quiz
      </Link>
      <Link
        href={hrefFor("profile", p_props.familyId)}
        data-active={p_props.active === "profile" ? "true" : "false"}
      >
        GPS
      </Link>
      <Link
        href={hrefFor("calendar", p_props.familyId)}
        data-active={p_props.active === "calendar" ? "true" : "false"}
      >
        Calendário
      </Link>
      <Link
        href={hrefFor("forecast", p_props.familyId)}
        data-active={p_props.active === "forecast" ? "true" : "false"}
      >
        Previsão
      </Link>
      <Link
        href={hrefFor("surprise", p_props.familyId)}
        data-active={p_props.active === "surprise" ? "true" : "false"}
      >
        Surpresa
      </Link>
      <Link
        href={hrefFor("cycle", p_props.familyId)}
        data-active={p_props.active === "cycle" ? "true" : "false"}
      >
        Ciclo
      </Link>
      <Link
        href={hrefFor("completed", p_props.familyId)}
        data-active={p_props.active === "completed" ? "true" : "false"}
      >
        Completas
      </Link>
      <Link
        href={hrefFor("diary", p_props.familyId)}
        data-active={p_props.active === "diary" ? "true" : "false"}
      >
        Diário
      </Link>
    </nav>
  );
}
