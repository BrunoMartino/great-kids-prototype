"use client";

import type { ReactElement } from "react";
import { useTidePreference } from "./tide-preference-context";


/** Two periods of one wave across a 200%-wide layer, so translateX(-50%) loops seamlessly. */
const WAVE_PATH: string =
  "M0 60 C 240 20 480 20 720 60 S 1200 100 1440 60 S 1920 20 2160 60 S 2640 100 2880 60 V 160 H 0 Z";

const TIDE_STYLES: string = `
[data-tide] {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: var(--gk-bg);
  background: var(--grad-foam);
}
[data-tide-pool] {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: var(--r-pill);
}
[data-tide-pool="sea"] {
  top: 8%;
  left: -96px;
  background: radial-gradient(circle at center, var(--app-tide-pool) 0%, transparent 70%);
}
[data-tide-pool="sand"] {
  top: 38%;
  right: -120px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle at center, var(--app-tide-pool-warm) 0%, transparent 70%);
}
[data-tide-ripples] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: var(--gk-primary);
  opacity: 0.06;
}
[data-tide-waves] {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 40%;
}
[data-tide-wave] {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
}
[data-tide-wave] svg {
  display: block;
  width: 100%;
  height: 100%;
}
[data-tide-wave="1"] { color: var(--app-tide-3); height: 100%; }
[data-tide-wave="2"] { color: var(--app-tide-2); height: 78%; }
[data-tide-wave="3"] { color: var(--app-tide-1); height: 56%; }
[data-tide-mode="animated"] [data-tide-wave] {
  will-change: transform;
  animation: tide-drift 28s linear infinite;
}
[data-tide-mode="animated"] [data-tide-wave="1"] { animation-duration: 42s; animation-direction: reverse; }
[data-tide-mode="animated"] [data-tide-wave="2"] { animation-duration: 28s; }
[data-tide-mode="animated"] [data-tide-wave="3"] { animation-duration: 18s; animation-direction: reverse; }
[data-tide-mode="animated"] [data-tide-pool="sea"] { animation: tide-pool 30s var(--ease-state) infinite alternate; }
[data-tide][data-tide-paused="true"] *,
[data-tide][data-tide-paused="true"] {
  animation-play-state: paused !important;
}
@keyframes tide-drift {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
}
@keyframes tide-pool {
  from { transform: translate3d(-24px, -12px, 0); }
  to { transform: translate3d(24px, 12px, 0); }
}
@media (prefers-reduced-motion: reduce) {
  [data-tide] *,
  [data-tide] {
    animation: none !important;
    will-change: auto !important;
  }
}
`;

export function TideBackground(): ReactElement {
  const preference: ReturnType<typeof useTidePreference> = useTidePreference();
  /** Max 4 animated layers (3 waves + 1 light pool) on every family screen (MASTER §8, D7 revised); pause lives in the drawer. */
  const mode: "animated" | "static" = "animated";

  return (
    <div
      data-tide
      data-tide-mode={mode}
      data-tide-paused={preference.isPaused ? "true" : "false"}
      aria-hidden="true"
    >
      <style href="family-tide" precedence="low">
        {TIDE_STYLES}
      </style>
      <span data-tide-pool="sea" />
      <span data-tide-pool="sand" />
      <svg data-tide-ripples aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice" viewBox="0 0 430 932">
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M-20 140 C 80 110 160 170 260 140 S 400 110 460 140" />
          <path d="M-20 176 C 80 146 160 206 260 176 S 400 146 460 176" />
          <path d="M-20 212 C 80 182 160 242 260 212 S 400 182 460 212" />
          <path d="M-20 420 C 100 390 200 450 300 420 S 420 395 460 420" />
          <path d="M-20 456 C 100 426 200 486 300 456 S 420 431 460 456" />
        </g>
      </svg>
      <div data-tide-waves>
        {(["1", "2", "3"] as const).map((p_layer: "1" | "2" | "3") => (
          <div key={p_layer} data-tide-wave={p_layer}>
            <svg aria-hidden="true" focusable="false" viewBox="0 0 2880 160" preserveAspectRatio="none">
              <path d={WAVE_PATH} fill="currentColor" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
