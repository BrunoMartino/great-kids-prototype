import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { MaterialsSessionProvider } from "./materials-session-context";

const MaterialsScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { MaterialsScreen: ComponentType } = await import("./materials-screen");
    return { default: loaded.MaterialsScreen };
  },
);

export default function MaterialsPage(): ReactElement {
  return (
    <MaterialsSessionProvider>
      <MaterialsScreen />
    </MaterialsSessionProvider>
  );
}
