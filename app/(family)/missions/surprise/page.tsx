import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { FamilyThumbShell } from "../../chrome/family-thumb-shell";
import { LoadingCard } from "../../chrome/family-ui";

function SurpriseFallback(): ReactElement {
  return (
    <div data-surprise-screen>
      <FamilyThumbShell content={<LoadingCard label="Loading the surprise" />} />
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
