import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";

function SurpriseFallback(): ReactElement {
  return (
    <div data-surprise-screen>
      <div data-surprise-scroll>
        <div aria-live="polite" aria-busy="true">
          <h1>Loading the surprise</h1>
        </div>
      </div>
    </div>
  );
}

const SurpriseScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { SurpriseScreen: ComponentType } = await import("./surprise-screen");
    return { default: loaded.SurpriseScreen };
  },
  { loading: SurpriseFallback },
);

export default function SurprisePage(): ReactElement {
  return <SurpriseScreen />;
}
