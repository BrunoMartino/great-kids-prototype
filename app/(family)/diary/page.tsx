import { Suspense, type ReactElement } from "react";
import { DiaryScreen } from "./diary-screen";

function DiaryFallback(): ReactElement {
  return (
    <div data-diary-screen>
      <div data-diary-scroll>
        <div aria-live="polite" aria-busy="true">
          <h1>Carregando o diário</h1>
        </div>
      </div>
    </div>
  );
}

export default function DiaryPage(): ReactElement {
  return (
    <Suspense fallback={<DiaryFallback />}>
      <DiaryScreen />
    </Suspense>
  );
}
