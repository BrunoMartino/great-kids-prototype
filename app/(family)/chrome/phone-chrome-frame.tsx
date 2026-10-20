import type { ReactElement, ReactNode } from "react";
import { FamilyAppView } from "./family-app-view";
import type { IFamilySurface } from "./family-surface-protocol";
import { PhoneChromeDecorator } from "./phone-chrome-decorator";

type PhoneChromeFrameProps = {
  children: ReactNode;
  footer?: ReactNode;
};

/** Children render inside `[data-phone-body]`. Footer sits above the home indicator. */
export function PhoneChromeFrame(p_props: PhoneChromeFrameProps): ReactElement {
  const surface: IFamilySurface = new PhoneChromeDecorator(
    new FamilyAppView(p_props.children),
    p_props.footer ?? null,
  );
  const framed: ReactNode = surface.render();
  return <>{framed}</>;
}
