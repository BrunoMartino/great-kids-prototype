import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { FamilyThumbShell } from "../../chrome/family-thumb-shell";
import { LoadingCard } from "../../chrome/family-ui";

function CompletedFallback(): ReactElement {
  return (
    <div data-completed-screen>
      <FamilyThumbShell content={<LoadingCard label="Loading completed missions" />} />
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
