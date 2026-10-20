import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { FamiliesSessionProvider } from "./families-session-context";

const FamiliesScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { FamiliesScreen: ComponentType } = await import("./families-screen");
    return { default: loaded.FamiliesScreen };
  },
);

export default function FamiliesPage(): ReactElement {
  return (
    <FamiliesSessionProvider>
      <FamiliesScreen />
    </FamiliesSessionProvider>
  );
}
