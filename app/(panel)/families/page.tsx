import type { ReactElement } from "react";
import { FamiliesScreen } from "./families-screen";
import { FamiliesSessionProvider } from "./families-session-context";

export default function FamiliesPage(): ReactElement {
  return (
    <FamiliesSessionProvider>
      <FamiliesScreen />
    </FamiliesSessionProvider>
  );
}
