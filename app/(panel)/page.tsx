import type { ReactElement } from "react";
import { CaretRightIcon } from "@/app/design-system/icons";

const HOME_STYLES: string = `
[data-panel-home] {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  overflow: hidden;
  padding: 32px 28px 56px;
  border-radius: var(--r-md);
  background: var(--app-hero-from);
  background: var(--grad-tide);
  box-shadow: var(--el-2);
  color: var(--app-on-hero);
  animation: panel-home-enter var(--dur-ui) var(--ease-enter) both;
}
[data-panel-home] > :not(svg) {
  position: relative;
  z-index: 1;
}
[data-panel-home-wave] {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 48px;
  color: var(--gk-accent);
  opacity: 0.22;
}
[data-panel-home] h1 {
  margin: 0;
  color: var(--app-on-hero);
  font-size: var(--fs-adm-h1);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
}
[data-panel-home] p {
  max-width: 65ch;
  margin: 0;
  color: var(--app-on-hero);
  line-height: 1.5;
}
[data-panel-home] a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  margin-top: 8px;
  padding: 0 16px;
  border-radius: var(--r-sm);
  background: var(--gk-surface);
  color: var(--gk-primary);
  font-size: var(--fs-body-sm);
  font-weight: 600;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background-color var(--dur-micro) var(--ease-state), transform var(--dur-micro) var(--ease-state);
}
[data-panel-home] a:focus {
  outline: 2px solid var(--app-on-hero);
  outline-offset: 2px;
}
[data-panel-home] a:focus:not(:focus-visible) {
  outline: none;
}
[data-panel-home] a:focus-visible {
  outline: 2px solid var(--app-on-hero);
  outline-offset: 2px;
}
[data-panel-home] a:active {
  transform: scale(0.98);
}
@media (hover: hover) and (pointer: fine) {
  [data-panel-home] a:hover {
    background: var(--gk-surface-2);
  }
}
@keyframes panel-home-enter {
  from { opacity: 0; transform: translate3d(0, 4px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@media (prefers-reduced-motion: reduce) {
  [data-panel-home] {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
`;

export default function PanelHomePage(): ReactElement {
  return (
    <section data-panel-home>
      <style href="panel-home" precedence="medium">
        {HOME_STYLES}
      </style>
      <svg data-panel-home-wave aria-hidden="true" focusable="false" viewBox="0 0 1440 48" preserveAspectRatio="none">
        <path d="M0 24 C 240 4 480 4 720 24 S 1200 44 1440 24 V 48 H 0 Z" fill="currentColor" />
      </svg>
      <h1>Staff</h1>
      <p>Set up the mission catalog. No family phone.</p>
      <a href="/catalog">
        Go to catalog
        <CaretRightIcon size={16} weight="bold" aria-hidden="true" />
      </a>
    </section>
  );
}
