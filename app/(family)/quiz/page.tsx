import { Suspense, type ReactElement } from "react";
import { QuizScreen } from "./quiz-screen";

function QuizFallback(): ReactElement {
  return (
    <div data-quiz-screen>
      <div data-quiz-scroll>
        <div aria-live="polite" aria-busy="true">
          <h1>Carregando o quiz</h1>
        </div>
      </div>
    </div>
  );
}

export default function QuizPage(): ReactElement {
  return (
    <Suspense fallback={<QuizFallback />}>
      <QuizScreen />
    </Suspense>
  );
}
