import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { ContextsSessionProvider } from "./contexts-session-context";

const ContextsScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { ContextsScreen: ComponentType } = await import("./contexts-screen");
    return { default: loaded.ContextsScreen };
  },
);

export default function ContextsPage(): ReactElement {
  return (
    <ContextsSessionProvider>
      <ContextsScreen />
    </ContextsSessionProvider>
  );
}
