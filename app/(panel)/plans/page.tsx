import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { PlansSessionProvider } from "./plans-session-context";

const PlansScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { PlansScreen: ComponentType } = await import("./plans-screen");
    return { default: loaded.PlansScreen };
  },
);

export default function PlansPage(): ReactElement {
  return (
    <PlansSessionProvider>
      <PlansScreen />
    </PlansSessionProvider>
  );
}
