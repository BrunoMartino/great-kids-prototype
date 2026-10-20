import type { ReactElement, ReactNode } from "react";
import { SurfaceModeSwitch } from "@/app/(family)/chrome/surface-mode-switch";
import { type SurfaceChrome, SurfaceFacade } from "@/app/api/panel/surface-facade";

type PanelLayoutProps = {
  children: ReactNode;
};

const PANEL_SHELL_STYLES: string = `
[data-surface="panel"] {
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
  min-height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--color-desk);
  color: var(--color-ink);
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
[data-panel-shell] {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1920px;
  min-width: 0;
  min-height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0 auto;
}
[data-panel-header] {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 24px;
  min-height: 64px;
  padding: 12px 24px;
  padding-top: max(12px, env(safe-area-inset-top, 0px));
  padding-right: max(24px, env(safe-area-inset-right, 0px));
  padding-left: max(24px, env(safe-area-inset-left, 0px));
  background: var(--color-paper);
  box-shadow: 0 1px 0 rgba(44, 42, 40, 0.1);
  box-shadow: 0 1px 0 color-mix(in srgb, var(--color-ink) 10%, transparent);
}
[data-panel-brand] {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 4px;
  color: var(--color-primary);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-decoration: none;
}
[data-panel-nav] {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
[data-panel-nav] a {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  color: var(--color-ink);
  font-weight: 600;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: transform 120ms ease-out, opacity 120ms ease-out;
}
[data-panel-brand]:focus,
[data-panel-nav] a:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
[data-panel-brand]:focus:not(:focus-visible),
[data-panel-nav] a:focus:not(:focus-visible) {
  outline: none;
}
[data-panel-brand]:focus-visible,
[data-panel-nav] a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
[data-panel-nav] a:active {
  transform: translateY(0);
}
@media (hover: hover) and (pointer: fine) {
  [data-panel-nav] a:hover {
    background: #e8f4ea;
    background: color-mix(in srgb, var(--color-tertiary) 36%, var(--color-paper));
    transform: translateY(-1px);
  }
  [data-panel-brand]:hover {
    color: var(--color-ink);
  }
}
[data-panel-main] {
  flex: 1 1 auto;
  min-width: 0;
  padding: 24px;
  padding-right: max(24px, env(safe-area-inset-right, 0px));
  padding-bottom: max(24px, env(safe-area-inset-bottom, 0px));
  padding-left: max(24px, env(safe-area-inset-left, 0px));
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
    <div data-surface="panel" data-chrome={chrome.chrome}>
      <style href="panel-shell" precedence="low">
        {PANEL_SHELL_STYLES}
      </style>
      <div data-panel-shell>
        <header data-panel-header>
          <a href="/" data-panel-brand>
            Panel
          </a>
          <SurfaceModeSwitch />
          <nav data-panel-nav aria-label="Panel">
            <a href="/catalog">Catalog</a>
            <a href="/materials">Materials</a>
            <a href="/questions">Questions</a>
            <a href="/families">Families</a>
            <a href="/plans">Plans</a>
            <a href="/users">Users</a>
            <a href="/indicators">Indicators</a>
            <a href="/contexts">Contexts</a>
          </nav>
        </header>
        <main data-panel-main>{p_props.children}</main>
      </div>
    </div>
  );
}
