import { Suspense, type ReactElement } from "react";
import { ForecastScreen } from "./forecast-screen";

function ForecastFallback(): ReactElement {
  return (
    <div data-forecast-screen>
      <div data-forecast-scroll>
        <div aria-live="polite" aria-busy="true">
          <h1>Loading the forecast</h1>
        </div>
      </div>
    </div>
  );
}

export default function ForecastPage(): ReactElement {
  return (
    <Suspense fallback={<ForecastFallback />}>
      <ForecastScreen />
    </Suspense>
  );
}
