"use client";

import {
  startTransition,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import type { Icon } from "@/app/design-system/icons";
import { InstantRevealStrategy } from "../missions/mascot/instant-reveal-strategy";
import type { RevealStrategy } from "../missions/mascot/reveal-strategy";
import { TypewriterRevealStrategy } from "../missions/mascot/typewriter-reveal-strategy";

type WellProps = {
  icon: Icon;
  tone?: "sea" | "warm";
  size?: "md" | "sm";
};

/** Round tinted well with a duotone glyph (MASTER §7, §9.3). */
export function Well(p_props: WellProps): ReactElement {
  const Glyph: Icon = p_props.icon;
  const isSmall: boolean = p_props.size === "sm";
  return (
    <span
      data-gk-well
      data-tone={p_props.tone ?? "sea"}
      data-size={isSmall ? "sm" : "md"}
      aria-hidden="true"
    >
      <Glyph size={isSmall ? 20 : 24} weight="duotone" />
    </span>
  );
}

/** Initials only, from a display name. Never a photo (INV-002). */
export function initialsOf(p_name: string): string {
  const parts: string[] = p_name
    .trim()
    .split(/\s+/)
    .filter((p_part: string): boolean => p_part.length > 0);
  const first: string = parts[0]?.charAt(0) ?? "";
  const last: string = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  const initials: string = `${first}${last}`.toUpperCase();
  return initials.length > 0 ? initials : "?";
}

/** The mascot glyph of the preview (`#i-mascot`), drawn with tokens. */
export function MascotGlyph(): ReactElement {
  return (
    <svg data-gk-mascot viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <ellipse data-part="body" cx="32" cy="36" rx="24" ry="22" />
      <ellipse data-part="belly" cx="32" cy="42" rx="14" ry="11" />
      <circle data-part="eye" cx="24" cy="30" r="3.2" />
      <circle data-part="eye" cx="40" cy="30" r="3.2" />
      <circle data-part="shine" cx="25" cy="29" r="1" />
      <circle data-part="shine" cx="41" cy="29" r="1" />
      <path data-part="smile" d="M26 38q6 5 12 0" />
      <path data-part="ears" d="M14 22q2-9 10-10M50 22q-2-9-10-10" />
    </svg>
  );
}

const HERO_WAVE_PATH: string =
  "M0 40 Q 180 0 360 40 T 720 40 T 1080 40 T 1440 40 V 120 H 0 Z";

/** Static foam waves inside the hero (MASTER §8, hero variant). */
export function HeroWaves(): ReactElement {
  return (
    <div data-gk-hero-waves aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" focusable="false" aria-hidden="true">
        <path d={HERO_WAVE_PATH} fill="currentColor" />
      </svg>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" focusable="false" aria-hidden="true">
        <path d={HERO_WAVE_PATH} fill="currentColor" />
      </svg>
    </div>
  );
}

type TypewriterCopyProps = {
  text: string;
};

function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);
  useEffect(() => {
    const media: MediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = (): void => {
      setPrefersReduced(media.matches);
    };
    sync();
    media.addEventListener("change", sync);
    return (): void => {
      media.removeEventListener("change", sync);
    };
  }, []);
  return prefersReduced;
}

/** Mission copy typed out slow then fast (native strategy, MASTER D10). */
export function TypewriterCopy(p_props: TypewriterCopyProps): ReactElement {
  const prefersReduced: boolean = usePrefersReducedMotion();
  const [shown, setShown] = useState<string>("");
  const [isDone, setIsDone] = useState<boolean>(false);

  useEffect(() => {
    const strategy: RevealStrategy = prefersReduced
      ? new InstantRevealStrategy()
      : new TypewriterRevealStrategy();
    setIsDone(false);
    const cancel: () => void = strategy.getRevealed(p_props.text, (p_shown: string): void => {
      startTransition((): void => {
        setShown(p_shown);
      });
      if (p_shown === p_props.text) {
        setIsDone(true);
      }
    });
    return cancel;
  }, [p_props.text, prefersReduced]);

  return (
    <p data-gk-mission-copy>
      <span data-gk-visually-hidden>{p_props.text}</span>
      <span aria-hidden="true">{shown}</span>
      {isDone ? null : <span data-gk-caret aria-hidden="true" />}
    </p>
  );
}

type StateCardProps = {
  icon: Icon;
  title: string;
  children?: ReactNode;
  role?: "alert";
  tone?: "sea" | "warm";
};

/** Empty / denied / error state: icon well + title + one sentence (MASTER §9.9). */
export function StateCard(p_props: StateCardProps): ReactElement {
  return (
    <div data-gk-card data-gk-enter role={p_props.role}>
      <Well icon={p_props.icon} tone={p_props.tone} />
      <h2>{p_props.title}</h2>
      {p_props.children}
    </div>
  );
}

type LoadingCardProps = {
  label: string;
};

/** Skeleton card with an accessible label (MASTER §9.9). */
export function LoadingCard(p_props: LoadingCardProps): ReactElement {
  return (
    <div data-gk-card aria-live="polite" aria-busy="true">
      <h2>{p_props.label}</h2>
      <span data-gk-skeleton />
      <span data-gk-skeleton data-w="short" />
    </div>
  );
}
