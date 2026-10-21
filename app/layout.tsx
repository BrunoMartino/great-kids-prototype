import type { Metadata, Viewport } from "next";
import type { ReactElement, ReactNode } from "react";
import { FONT_CLASS_NAMES } from "./design-system/fonts";
import {
  REDUCED_MOTION_STYLES,
  THEME_COLOR_LIGHT,
  TOKENS_STYLES,
} from "./design-system/tokens";

type RootLayoutProps = {
  children: ReactNode;
};

const ROOT_DOCUMENT_STYLES: string = `
html {
  box-sizing: border-box;
  min-height: 100%;
  min-height: 100vh;
  min-height: -webkit-fill-available;
  min-height: 100dvh;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
*,
*::before,
*::after {
  box-sizing: inherit;
}
body {
  margin: 0;
  min-height: 100%;
  min-height: 100vh;
  min-height: -webkit-fill-available;
  min-height: 100dvh;
  font-family: var(--font-sans);
  font-size: var(--fs-body);
  line-height: 1.55;
  color: var(--gk-ink);
  background: var(--gk-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
h1,
h2,
h3 {
  text-wrap: balance;
}
::selection {
  background: var(--gk-accent);
  color: var(--gk-ink);
}
`;

export const metadata: Metadata = {
  title: "Great Kids",
  description: "Family activities for loving parents.",
};

export const viewport: Viewport = {
  width: "device-width",
  colorScheme: "light",
  themeColor: THEME_COLOR_LIGHT,
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout(p_props: RootLayoutProps): ReactElement {
  return (
    <html lang="en" className={FONT_CLASS_NAMES}>
      <body>
        <style href="design-tokens" precedence="high">
          {TOKENS_STYLES}
        </style>
        <style href="root-document" precedence="high">
          {ROOT_DOCUMENT_STYLES}
        </style>
        <style href="reduced-motion" precedence="high">
          {REDUCED_MOTION_STYLES}
        </style>
        {p_props.children}
      </body>
    </html>
  );
}
