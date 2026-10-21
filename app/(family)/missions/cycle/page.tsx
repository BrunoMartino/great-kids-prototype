import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { FamilyThumbShell } from "../../chrome/family-thumb-shell";
import { LoadingCard } from "../../chrome/family-ui";

function CycleFallback(): ReactElement {
  return (
    <div data-cycle-screen>
      <FamilyThumbShell content={<LoadingCard label="Loading the cycle" />} />
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
