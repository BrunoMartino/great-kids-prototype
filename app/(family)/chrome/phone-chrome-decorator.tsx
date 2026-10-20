import type { ReactNode } from "react";
import {
  SurfaceFacade,
  type SurfaceChrome,
} from "@/app/api/panel/surface-facade";
import { FamilySurfaceDecorator } from "./family-surface-decorator";
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
  background: #1c1a19;
  background: linear-gradient(165deg, #2c2927 0%, var(--color-bezel, #1c1a19) 42%, #121110 100%);
  box-shadow:
    0 0 0 1px rgba(44, 42, 40, 0.4),
    inset 0 1px 0 rgba(255, 248, 242, 0.1),
    0 28px 56px rgba(44, 42, 40, 0.24);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-ink, #2c2a28) 40%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--color-paper, #fff8f2) 12%, transparent),
    0 28px 56px color-mix(in srgb, var(--color-ink, #2c2a28) 24%, transparent);
  animation: family-phone-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
[data-phone-nub] {
  position: absolute;
  z-index: 3;
  width: 4px;
  background: #2f2c2a;
  background: color-mix(in srgb, var(--color-bezel, #1c1a19) 55%, #5a5552);
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
  background: #fff8f2;
  background: var(--color-paper, #fff8f2);
  color: #2c2a28;
  color: var(--color-ink, #2c2a28);
  transform: translateZ(0);
  box-shadow:
    inset 0 0 0 1px rgba(255, 248, 242, 0.22),
    inset 0 1px 3px rgba(0, 0, 0, 0.28);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--color-paper, #fff8f2) 22%, transparent),
    inset 0 1px 3px color-mix(in srgb, #000 28%, transparent);
}
[data-phone-chrome="iphone-15-pro-max"] [data-phone-island] {
  position: absolute;
  top: 12px;
  left: 50%;
  z-index: 2;
  width: 126px;
  height: 36px;
  border-radius: 999px;
  background: #050505;
  transform: translateX(-50%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
[data-phone-chrome="iphone-15-pro-max"] [data-phone-body] {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  padding: 64px 20px 8px;
}
[data-phone-chrome="iphone-15-pro-max"] [data-phone-home] {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  padding: 8px 0 10px;
}
[data-phone-chrome="iphone-15-pro-max"] [data-phone-home]::after {
  content: "";
  width: 139px;
  height: 5px;
  border-radius: 999px;
  background: #2c2a28;
  background: var(--color-ink, #2c2a28);
  opacity: 0.28;
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
    const facade: SurfaceFacade = new SurfaceFacade();
    const surfaceChrome: SurfaceChrome = facade.familySurface();
    const chrome: SurfaceChrome["chrome"] = surfaceChrome.chrome;
    const inner: ReactNode = this.surface.render();

    return (
      <div data-phone-chrome={chrome} aria-label="iPhone 15 Pro Max">
        <style href="family-phone-chrome" precedence="low">
          {PHONE_CHROME_STYLES}
        </style>
        <span data-phone-nub="silent" aria-hidden="true" />
        <span data-phone-nub="volume-up" aria-hidden="true" />
        <span data-phone-nub="volume-down" aria-hidden="true" />
        <span data-phone-nub="power" aria-hidden="true" />
        <div data-phone-screen>
          <div data-phone-island aria-hidden="true" />
          <div data-phone-body>{inner}</div>
          {this.footer}
          <div data-phone-home aria-hidden="true" />
        </div>
      </div>
    );
  }
}
