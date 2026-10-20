import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { PanelSessionProvider } from "./panel-session-context";

const CatalogScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { CatalogScreen: ComponentType } = await import("./catalog-screen");
    return { default: loaded.CatalogScreen };
  },
);

export default function CatalogPage(): ReactElement {
  return (
    <PanelSessionProvider>
      <CatalogScreen />
    </PanelSessionProvider>
  );
}
