import type { ReactElement, ReactNode } from "react";
import {
  getPresentation,
  isPresentationPresent,
} from "@/app/api/session/presentation-strategy";
import { PhoneChromeFrame } from "./chrome/phone-chrome-frame";
import { SurfaceModeSwitch } from "./chrome/surface-mode-switch";
import {
  FamilySessionProvider,
  type SessionSnapshot,
} from "./context-switch/family-session-context";

type FamilyLayoutProps = {
  children: ReactNode;
};

const FAMILY_SHELL_STYLES: string = `
[data-surface="family"] {
  --color-primary: #ff5a36;
  --color-secondary: #1f9d8a;
  --color-tertiary: #ffc43d;
  --color-success: #2f9e4d;
  --color-danger: #e23d4d;
  --color-warning: #f4a259;
  --color-ink: #1f2a37;
  --color-muted: #5a6674;
  --color-paper: #f3f8ff;
  --color-desk: #b8e4f0;
  --color-child: #7c5cbf;
  --color-bezel: #1a222c;
  --phone-screen-width: 430px;
  --phone-screen-height: 932px;
  --phone-bezel: 14px;
  min-height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--color-desk);
  color: var(--color-ink);
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
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

function readInitialSnapshot(): SessionSnapshot | null {
  if (!isPresentationPresent()) {
    return null;
  }
  const present: ReturnType<typeof getPresentation> = getPresentation();
  return {
    role: present.role,
    presentation: present.presentation,
  };
}

export default async function FamilyLayout(
  p_props: FamilyLayoutProps,
): Promise<ReactElement> {
  const initialSnapshot: SessionSnapshot | null = readInitialSnapshot();

  return (
    <div data-surface="family">
      <style href="family-shell" precedence="low">
        {FAMILY_SHELL_STYLES}
      </style>
      <div data-family-desk>
        <SurfaceModeSwitch />
        <FamilySessionProvider initialSnapshot={initialSnapshot}>
          <PhoneChromeFrame>
            {p_props.children}
          </PhoneChromeFrame>
        </FamilySessionProvider>
      </div>
    </div>
  );
}
