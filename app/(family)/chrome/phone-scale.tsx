"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

type PhoneScaleProps = {
  children: ReactNode;
};

const PHONE_OUTER_WIDTH: number = 458;
const PHONE_OUTER_HEIGHT: number = 960;

const SCALE_STYLES: string = `
[data-phone-scale] {
  position: relative;
  flex: 0 0 auto;
  overflow: hidden;
}
[data-phone-scale-inner] {
  transform-origin: top left;
}
@media (prefers-reduced-motion: reduce) {
  [data-phone-scale-inner] {
    transition: none !important;
  }
}
`;

function fitScale(p_width: number, p_height: number): number {
  const next: number = Math.min(
    p_width / PHONE_OUTER_WIDTH,
    p_height / PHONE_OUTER_HEIGHT,
  );
  if (next <= 0 || Number.isNaN(next)) {
    return 1;
  }
  return next;
}

export function PhoneScale(p_props: PhoneScaleProps): ReactElement {
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const update = (): void => {
      setScale(fitScale(window.innerWidth, window.innerHeight));
    };
    update();
    window.addEventListener("resize", update);
    return (): void => {
      window.removeEventListener("resize", update);
    };
  }, []);

  const hostStyle: CSSProperties = {
    width: `${String(PHONE_OUTER_WIDTH * scale)}px`,
    height: `${String(PHONE_OUTER_HEIGHT * scale)}px`,
  };
  const innerStyle: CSSProperties = {
    width: `${String(PHONE_OUTER_WIDTH)}px`,
    height: `${String(PHONE_OUTER_HEIGHT)}px`,
    transform: `scale(${String(scale)})`,
  };

  return (
    <div data-phone-scale style={hostStyle}>
      <style href="family-phone-scale" precedence="low">
        {SCALE_STYLES}
      </style>
      <div data-phone-scale-inner style={innerStyle}>
        {p_props.children}
      </div>
    </div>
  );
}
