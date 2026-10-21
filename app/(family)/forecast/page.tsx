import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import { LoadingCard } from "../chrome/family-ui";

function ForecastFallback(): ReactElement {
  return (
    <div data-forecast-screen>
      <FamilyThumbShell content={<LoadingCard label="Loading the forecast" />} />
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
