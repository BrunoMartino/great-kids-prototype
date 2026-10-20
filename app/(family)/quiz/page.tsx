import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";

function QuizFallback(): ReactElement {
  return (
    <div data-quiz-screen>
      <div data-quiz-scroll>
        <div aria-live="polite" aria-busy="true">
          <h1>Loading the quiz</h1>
        </div>
      </div>
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
