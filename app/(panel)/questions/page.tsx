import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { QuestionsSessionProvider } from "./questions-session-context";

const QuestionsScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { QuestionsScreen: ComponentType } = await import("./questions-screen");
    return { default: loaded.QuestionsScreen };
  },
);

export default function QuestionsPage(): ReactElement {
  return (
    <QuestionsSessionProvider>
      <QuestionsScreen />
    </QuestionsSessionProvider>
  );
}
