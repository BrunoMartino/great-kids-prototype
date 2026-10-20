import type { ReactElement } from "react";
import { PlansScreen } from "./plans-screen";
import { PlansSessionProvider } from "./plans-session-context";

export default function PlansPage(): ReactElement {
  return (
    <PlansSessionProvider>
      <PlansScreen />
    </PlansSessionProvider>
  );
}
