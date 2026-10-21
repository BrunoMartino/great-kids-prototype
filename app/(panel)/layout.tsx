import type { ReactElement, ReactNode } from "react";
import { type SurfaceChrome, SurfaceFacade } from "@/app/api/panel/surface-facade";
import { PanelFrame } from "./shell/panel-frame";
import { PanelThemeScope } from "./shell/panel-theme";

type PanelLayoutProps = {
  children: ReactNode;
};

const PANEL_SHELL_STYLES: string = `
[data-surface="panel"] {
  min-height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--gk-bg);
  color: var(--gk-ink);
  font-family: var(--font-sans);
  font-size: var(--fs-adm-body);
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
@media (prefers-reduced-motion: reduce) {
  [data-surface="panel"] *,
  [data-surface="panel"] *::before,
  [data-surface="panel"] *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
`;

export default function PanelLayout(p_props: PanelLayoutProps): ReactElement {
  const surface: SurfaceFacade = new SurfaceFacade();
  const chrome: SurfaceChrome = surface.panelSurface();

  return (
    <PanelThemeScope chrome={chrome.chrome}>
      <style href="panel-shell" precedence="low">
        {PANEL_SHELL_STYLES}
      </style>
      <PanelFrame>{p_props.children}</PanelFrame>
    </PanelThemeScope>
  );
}
