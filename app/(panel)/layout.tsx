import type { ReactElement, ReactNode } from "react";
import { type SurfaceChrome, SurfaceFacade } from "@/app/api/panel/surface-facade";

type PanelLayoutProps = {
  children: ReactNode;
};

const PANEL_SHELL_STYLES: string = `
[data-surface="panel"] {
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
  min-height: 100%;
  min-height: 100vh;
  min-height: -webkit-fill-available;
  min-height: 100svh;
  min-height: 100dvh;
  background: var(--color-desk);
  color: var(--color-ink);
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
[data-panel-shell] {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1920px;
  min-width: 0;
  min-height: 100%;
  min-height: 100vh;
  min-height: -webkit-fill-available;
  min-height: 100svh;
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
  align-items: center;
  gap: 24px;
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
    background: #efe4d6;
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
            Painel
          </a>
          <nav data-panel-nav aria-label="Painel">
            <a href="/catalog">Catálogo</a>
            <a href="/questions">Perguntas</a>
            <a href="/indicators">Indicadores</a>
          </nav>
        </header>
        <main data-panel-main>{p_props.children}</main>
      </div>
    </div>
  );
}
