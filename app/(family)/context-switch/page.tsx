import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";

const ContextSwitchScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { ContextSwitchScreen: ComponentType } = await import(
      "./context-switch-screen"
    );
    return { default: loaded.ContextSwitchScreen };
  },
);

export default function ContextSwitchPage(): ReactElement {
  return <ContextSwitchScreen />;
}
