import type { ReactElement } from "react";
import { ContextsScreen } from "./contexts-screen";
import { ContextsSessionProvider } from "./contexts-session-context";

export default function ContextsPage(): ReactElement {
  return (
    <ContextsSessionProvider>
      <ContextsScreen />
    </ContextsSessionProvider>
  );
}
