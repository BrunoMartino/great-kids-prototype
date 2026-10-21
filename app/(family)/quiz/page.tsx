import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import { LoadingCard } from "../chrome/family-ui";

function QuizFallback(): ReactElement {
  return (
    <div data-quiz-screen>
      <FamilyThumbShell content={<LoadingCard label="Loading the quiz" />} />
    </div>
  );
}

const QuizScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { QuizScreen: ComponentType } = await import("./quiz-screen");
    return { default: loaded.QuizScreen };
  },
  { loading: QuizFallback },
);

export default function QuizPage(): ReactElement {
  return <QuizScreen />;
}
