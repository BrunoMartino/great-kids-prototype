import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";

function MascotFallback(): ReactElement {
  return (
    <div data-mascot-screen>
      <div data-mascot-scroll>
        <div data-mascot-loading aria-live="polite" aria-busy="true">
          <h1>Loading mission</h1>
        </div>
      </div>
    </div>
  );
}

const MascotScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { MascotScreen: ComponentType } = await import("./mascot-screen");
    return { default: loaded.MascotScreen };
  },
  { loading: MascotFallback },
);

export default function MascotPage(): ReactElement {
  return <MascotScreen />;
}
