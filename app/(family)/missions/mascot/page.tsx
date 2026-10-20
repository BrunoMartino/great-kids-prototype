import { Suspense, type ReactElement } from "react";
import { MascotScreen } from "./mascot-screen";

function MascotFallback(): ReactElement {
  return (
    <div data-mascot-screen>
      <div data-mascot-scroll>
        <div data-mascot-loading aria-live="polite" aria-busy="true">
          <h1>Carregando missão</h1>
        </div>
      </div>
    </div>
  );
}

export default function MascotPage(): ReactElement {
  return (
    <Suspense fallback={<MascotFallback />}>
      <MascotScreen />
    </Suspense>
  );
}
