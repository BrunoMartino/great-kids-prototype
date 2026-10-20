import type { ReactElement } from "react";
import { CatalogScreen } from "./catalog-screen";
import { PanelSessionProvider } from "./panel-session-context";

export default function CatalogPage(): ReactElement {
  return (
    <PanelSessionProvider>
      <CatalogScreen />
    </PanelSessionProvider>
  );
}
