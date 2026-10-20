import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";

function CalendarFallback(): ReactElement {
  return (
    <div data-calendar-screen>
      <div data-calendar-scroll>
        <div aria-live="polite" aria-busy="true">
          <h1>Loading the calendar</h1>
        </div>
      </div>
    </div>
  );
}

const CalendarScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { CalendarScreen: ComponentType } = await import("./calendar-screen");
    return { default: loaded.CalendarScreen };
  },
  { loading: CalendarFallback },
);

export default function CalendarPage(): ReactElement {
  return <CalendarScreen />;
}
