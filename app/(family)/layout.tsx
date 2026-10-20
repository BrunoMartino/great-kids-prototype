import type { ReactElement, ReactNode } from "react";
import { PhoneChromeFrame } from "./chrome/phone-chrome-frame";
import { ContextSwitchControl } from "./context-switch/context-switch-control";
import { FamilySessionProvider } from "./context-switch/family-session-context";

type FamilyLayoutProps = {
  children: ReactNode;
};

const FAMILY_SHELL_STYLES: string = `
[data-surface="family"] {
  --color-primary: #8b4a3c;
  --color-secondary: #4f6b50;
  --color-tertiary: #d4b896;
  --color-success: #3d6b44;
  --color-danger: #a33f3f;
  --color-warning: #9a7028;
  --color-ink: #2c2a28;
  --color-muted: #5c564f;
  --color-paper: #fff8f2;
  --color-desk: #f3e8dc;
  --color-child: #5a5280;
  --color-bezel: #1c1a19;
  --phone-screen-width: 430px;
  --phone-screen-height: 932px;
  --phone-bezel: 14px;
  min-height: 100%;
  min-height: 100vh;
  min-height: -webkit-fill-available;
  min-height: 100svh;
  min-height: 100lvh;
  background: var(--color-desk);
  color: var(--color-ink);
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
[data-family-desk] {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 1920px;
  min-width: 0;
  margin: 0 auto;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  padding: 24px 32px 48px;
  padding-top: max(24px, env(safe-area-inset-top, 0px));
  padding-right: max(32px, env(safe-area-inset-right, 0px));
  padding-bottom: max(48px, env(safe-area-inset-bottom, 0px));
  padding-left: max(32px, env(safe-area-inset-left, 0px));
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
        <FamilySessionProvider>
          <PhoneChromeFrame footer={<ContextSwitchControl />}>
            {p_props.children}
          </PhoneChromeFrame>
        </FamilySessionProvider>
      </div>
    </div>
  );
}
