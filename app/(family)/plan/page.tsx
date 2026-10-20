import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";

const PlanScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { PlanScreen: ComponentType } = await import("./plan-screen");
    return { default: loaded.PlanScreen };
  },
);

export default function PlanPage(): ReactElement {
  return <PlanScreen />;
}
