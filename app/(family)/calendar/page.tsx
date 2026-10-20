import { Suspense, type ReactElement } from "react";
import { CalendarScreen } from "./calendar-screen";

function CalendarFallback(): ReactElement {
  return (
    <div data-calendar-screen>
      <div data-calendar-scroll>
        <div aria-live="polite" aria-busy="true">
          <h1>Carregando o calendário</h1>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage(): ReactElement {
  return (
    <Suspense fallback={<CalendarFallback />}>
      <CalendarScreen />
    </Suspense>
  );
}
