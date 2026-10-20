import type { ReactElement } from "react";
import { IndicatorsScreen } from "./indicators-screen";
import { IndicatorsSessionProvider } from "./indicators-session-context";

export default function IndicatorsPage(): ReactElement {
  return (
    <IndicatorsSessionProvider>
      <IndicatorsScreen />
    </IndicatorsSessionProvider>
  );
}
