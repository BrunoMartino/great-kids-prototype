import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { IndicatorsSessionProvider } from "./indicators-session-context";

const IndicatorsScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { IndicatorsScreen: ComponentType } = await import("./indicators-screen");
    return { default: loaded.IndicatorsScreen };
  },
);

export default function IndicatorsPage(): ReactElement {
  return (
    <IndicatorsSessionProvider>
      <IndicatorsScreen />
    </IndicatorsSessionProvider>
  );
}
