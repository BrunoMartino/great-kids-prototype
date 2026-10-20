import { Suspense, type ReactElement } from "react";
import { CycleScreen } from "./cycle-screen";

function CycleFallback(): ReactElement {
  return (
    <div data-cycle-screen>
      <div data-cycle-scroll>
        <div aria-live="polite" aria-busy="true">
          <h1>Loading the cycle</h1>
        </div>
      </div>
    </div>
  );
}

export default function CyclePage(): ReactElement {
  return (
    <Suspense fallback={<CycleFallback />}>
      <CycleScreen />
    </Suspense>
  );
}
