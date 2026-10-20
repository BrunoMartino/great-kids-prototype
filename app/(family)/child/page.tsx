import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";

const ChildScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { ChildScreen: ComponentType } = await import("./child-screen");
    return { default: loaded.ChildScreen };
  },
);

export default function ChildPage(): ReactElement {
  return <ChildScreen />;
}
