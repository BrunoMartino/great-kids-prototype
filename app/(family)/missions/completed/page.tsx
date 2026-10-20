import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";

function CompletedFallback(): ReactElement {
  return (
    <div data-completed-screen>
      <div data-completed-scroll>
        <div aria-live="polite" aria-busy="true">
          <h1>Loading completed missions</h1>
        </div>
      </div>
    </div>
  );
}

const CompletedScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { CompletedScreen: ComponentType } = await import("./completed-screen");
    return { default: loaded.CompletedScreen };
  },
  { loading: CompletedFallback },
);

export default function CompletedPage(): ReactElement {
  return <CompletedScreen />;
}
