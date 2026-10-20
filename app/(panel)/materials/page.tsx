import type { ReactElement } from "react";
import { MaterialsScreen } from "./materials-screen";
import { MaterialsSessionProvider } from "./materials-session-context";

export default function MaterialsPage(): ReactElement {
  return (
    <MaterialsSessionProvider>
      <MaterialsScreen />
    </MaterialsSessionProvider>
  );
}
