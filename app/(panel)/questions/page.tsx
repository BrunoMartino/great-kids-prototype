import type { ReactElement } from "react";
import { QuestionsScreen } from "./questions-screen";
import { QuestionsSessionProvider } from "./questions-session-context";

export default function QuestionsPage(): ReactElement {
  return (
    <QuestionsSessionProvider>
      <QuestionsScreen />
    </QuestionsSessionProvider>
  );
}
