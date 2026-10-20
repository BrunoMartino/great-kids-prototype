import { Suspense, type ReactElement } from "react";
import { CompletedScreen } from "./completed-screen";

function CompletedFallback(): ReactElement {
  return (
    <div data-completed-screen>
      <div data-completed-scroll>
        <div aria-live="polite" aria-busy="true">
          <h1>Carregando as completas</h1>
        </div>
      </div>
    </div>
  );
}

export default function CompletedPage(): ReactElement {
  return (
    <Suspense fallback={<CompletedFallback />}>
      <CompletedScreen />
    </Suspense>
  );
}
