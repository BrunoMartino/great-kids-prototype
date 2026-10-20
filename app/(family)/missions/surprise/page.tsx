import { Suspense, type ReactElement } from "react";
import { SurpriseScreen } from "./surprise-screen";

function SurpriseFallback(): ReactElement {
  return (
    <div data-surprise-screen>
      <div data-surprise-scroll>
        <div aria-live="polite" aria-busy="true">
          <h1>Carregando a surpresa</h1>
        </div>
      </div>
    </div>
  );
}

export default function SurprisePage(): ReactElement {
  return (
    <Suspense fallback={<SurpriseFallback />}>
      <SurpriseScreen />
    </Suspense>
  );
}
