import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";

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

const ForecastScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { ForecastScreen: ComponentType } = await import("./forecast-screen");
    return { default: loaded.ForecastScreen };
  },
  { loading: ForecastFallback },
);

export default function ForecastPage(): ReactElement {
  return <ForecastScreen />;
}
