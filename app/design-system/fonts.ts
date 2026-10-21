import localFont from "next/font/local";
import type { NextFontWithVariable } from "next/dist/compiled/@next/font/dist/types";

/**
 * Self-hosted Tidal fonts (SIL OFL 1.1, files in `./fonts/`).
 * Local files keep `next build` network-free on Nixpacks/Coolify.
 */
export const FONT_SANS: NextFontWithVariable = localFont({
  src: "./fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  variable: "--font-sans-face",
  weight: "200 800",
  style: "normal",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

export const FONT_DISPLAY: NextFontWithVariable = localFont({
  src: "./fonts/fraunces-latin-full-normal.woff2",
  variable: "--font-display-face",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const FONT_CLASS_NAMES: string = `${FONT_SANS.variable} ${FONT_DISPLAY.variable}`;
