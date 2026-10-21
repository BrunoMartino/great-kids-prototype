import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { FamilyThumbShell } from "../../chrome/family-thumb-shell";
import { LoadingCard } from "../../chrome/family-ui";

function MascotFallback(): ReactElement {
  return (
    <div data-mascot-screen>
      <FamilyThumbShell content={<LoadingCard label="Loading mission" />} />
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
