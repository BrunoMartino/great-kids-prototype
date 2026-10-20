import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";

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

const CycleScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { CycleScreen: ComponentType } = await import("./cycle-screen");
    return { default: loaded.CycleScreen };
  },
  { loading: CycleFallback },
);

export default function CyclePage(): ReactElement {
  return <CycleScreen />;
}
