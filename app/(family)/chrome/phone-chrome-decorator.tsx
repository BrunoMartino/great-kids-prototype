"use client";

import type { ReactNode } from "react";
import { FamilySurfaceDecorator } from "./family-surface-decorator";
import { FamilyDrawer } from "./family-drawer";
import { TideBackground } from "./tide-background";
import { TidePreferenceProvider } from "./tide-preference-context";
import { FAMILY_UI_STYLES } from "./family-ui-styles";
import type { IFamilySurface } from "./family-surface-protocol";

const PHONE_CHROME_STYLES: string = `
[data-phone-chrome="iphone-15-pro-max"] {
  --phone-screen-width: 430px;
  --phone-screen-height: 932px;
  --phone-bezel: 14px;
  --phone-outer-radius: 56px;
  --phone-inner-radius: 44px;
  position: relative;
  flex: 0 0 auto;
  box-sizing: border-box;
  width: calc(var(--phone-screen-width) + (var(--phone-bezel) * 2));
  margin-inline: 8px;
  padding: var(--phone-bezel);
  border-radius: var(--phone-outer-radius);
  background: var(--app-bezel);
  background: linear-gradient(165deg, var(--app-bezel-highlight) 0%, var(--app-bezel) 42%, var(--app-island) 100%);
  box-shadow:
    0 0 0 1px var(--app-bezel-edge),
    inset 0 1px 0 var(--app-bezel-highlight),
    var(--el-3);
  animation: family-phone-enter var(--dur-enter) var(--ease-enter) both;
}
[data-phone-nub] {
  position: absolute;
  z-index: 3;
  width: 4px;
  background: var(--app-bezel-edge);
  pointer-events: none;
}
[data-phone-nub="silent"] {
  top: 148px;
  left: -3px;
  height: 22px;
  border-radius: 2px 0 0 2px;
}
[data-phone-nub="volume-up"] {
  top: 198px;
  left: -3px;
  height: 52px;
  border-radius: 2px 0 0 2px;
}
[data-phone-nub="volume-down"] {
  top: 260px;
  left: -3px;
  height: 52px;
  border-radius: 2px 0 0 2px;
}
[data-phone-nub="power"] {
  top: 220px;
  right: -3px;
  height: 86px;
  border-radius: 0 2px 2px 0;
}
[data-phone-chrome="iphone-15-pro-max"] [data-phone-screen] {
  position: relative;
  display: flex;
  flex-direction: column;
  width: var(--phone-screen-width);
  height: var(--phone-screen-height);
  overflow: hidden;
  overscroll-behavior: contain;
  isolation: isolate;
  border-radius: var(--phone-inner-radius);
  background: var(--gk-bg);
  color: var(--gk-ink);
  transform: translateZ(0);
  box-shadow: inset 0 0 0 1px var(--app-bezel-edge);
}
[data-phone-chrome="iphone-15-pro-max"] [data-phone-island] {
  position: absolute;
  top: 14px;
  left: 50%;
  z-index: 25;
  width: 124px;
  height: 36px;
  border-radius: var(--r-pill);
  background: var(--app-island);
  transform: translateX(-50%);
  box-shadow: inset 0 1px 0 var(--app-bezel-highlight);
}
[data-phone-chrome="iphone-15-pro-max"] [data-phone-statusbar] {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 8px 34px 0;
  color: var(--gk-ink);
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}
[data-phone-screen]:has([data-gk-hero]) [data-phone-statusbar] {
  color: var(--app-on-hero);
}
[data-phone-status-icons] {
  display: flex;
  align-items: center;
  gap: 6px;
}
[data-phone-status-icons] svg {
  display: block;
}
[data-phone-chrome="iphone-15-pro-max"] [data-phone-body] {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  padding: 56px 0 0;
}
[data-phone-chrome="iphone-15-pro-max"] [data-phone-body] > * {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}
[data-phone-chrome="iphone-15-pro-max"] [data-phone-home] {
  position: absolute;
  bottom: 8px;
  left: 50%;
  z-index: 26;
  width: 140px;
  height: 5px;
  margin-left: -70px;
  border-radius: 3px;
  background: var(--gk-ink);
  opacity: 0.85;
  pointer-events: none;
}
@keyframes family-phone-enter {
  from {
    opacity: 0;
    transform: translate3d(0, 8px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-phone-chrome="iphone-15-pro-max"] {
    animation: none;
  }
  [data-phone-chrome="iphone-15-pro-max"],
  [data-phone-chrome="iphone-15-pro-max"] *,
  [data-phone-chrome="iphone-15-pro-max"] *::before,
  [data-phone-chrome="iphone-15-pro-max"] *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
`;

export class PhoneChromeDecorator extends FamilySurfaceDecorator {
  public constructor(
    p_surface: IFamilySurface,
    private footer: ReactNode = null,
  ) {
    super(p_surface);
  }

  public render(): ReactNode {
    const chrome: "iphone-15-pro-max" = "iphone-15-pro-max";
    const inner: ReactNode = this.surface.render();

    return (
      <div data-phone-chrome={chrome} aria-label="iPhone 15 Pro Max">
        <style href="family-phone-chrome" precedence="low">
          {PHONE_CHROME_STYLES}
        </style>
        <style href="family-ui" precedence="medium">
          {FAMILY_UI_STYLES}
        </style>
        <span data-phone-nub="silent" aria-hidden="true" />
        <span data-phone-nub="volume-up" aria-hidden="true" />
        <span data-phone-nub="volume-down" aria-hidden="true" />
        <span data-phone-nub="power" aria-hidden="true" />
        <TidePreferenceProvider>
          <div data-phone-screen>
            <TideBackground />
            <div data-phone-island aria-hidden="true" />
            <div data-phone-statusbar aria-hidden="true">
              <span>9:41</span>
              <span data-phone-status-icons>
                <svg width="18" height="12" viewBox="0 0 18 12" focusable="false" aria-hidden="true">
                  <rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" />
                  <rect x="5" y="5" width="3" height="7" rx="1" fill="currentColor" />
                  <rect x="10" y="2" width="3" height="10" rx="1" fill="currentColor" />
                  <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" />
                </svg>
                <svg width="26" height="12" viewBox="0 0 26 12" focusable="false" aria-hidden="true">
                  <rect x="0.75" y="0.75" width="22" height="10.5" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="3" y="3" width="15" height="6" rx="1.5" fill="currentColor" />
                  <rect x="24" y="4" width="1.5" height="4" rx="0.75" fill="currentColor" />
                </svg>
              </span>
            </div>
            <FamilyDrawer />
            <div data-phone-body>{inner}</div>
            {this.footer}
            <div data-phone-home aria-hidden="true" />
          </div>
        </TidePreferenceProvider>
      </div>
    );
  }
}
