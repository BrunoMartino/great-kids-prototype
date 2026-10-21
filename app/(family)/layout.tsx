import type { ReactElement, ReactNode } from "react";
import { PhoneChromeFrame } from "./chrome/phone-chrome-frame";
import { SurfaceModeSwitch } from "./chrome/surface-mode-switch";
import { FamilySessionProvider } from "./context-switch/family-session-context";

type FamilyLayoutProps = {
  children: ReactNode;
};

const FAMILY_SHELL_STYLES: string = `
[data-surface="family"] {
  --phone-screen-width: 430px;
  --phone-screen-height: 932px;
  --phone-bezel: 14px;
  min-height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--app-desk-from);
  background: var(--grad-desk);
  color: var(--gk-ink);
  font-family: var(--font-sans);
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
[data-surface="family"] :where(h1, h2) {
  font-family: var(--font-display);
  font-weight: 600;
  font-variation-settings: "SOFT" 60, "WONK" 0;
  letter-spacing: -0.01em;
  color: var(--gk-ink);
}
[data-family-desk] {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1920px;
  min-width: 0;
  min-height: 100dvh;
  height: 100dvh;
  margin: 0 auto;
  overflow: hidden;
  padding: 0;
}
@media (prefers-reduced-motion: reduce) {
  [data-surface="family"] *,
  [data-surface="family"] *::before,
  [data-surface="family"] *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
`;

export default function FamilyLayout(p_props: FamilyLayoutProps): ReactElement {
  return (
    <div data-surface="family">
      <style href="family-shell" precedence="low">
        {FAMILY_SHELL_STYLES}
      </style>
      <div data-family-desk>
        <SurfaceModeSwitch />
        <FamilySessionProvider>
          <PhoneChromeFrame>
            {p_props.children}
          </PhoneChromeFrame>
        </FamilySessionProvider>
      </div>
    </div>
  );
}
