import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import { LoadingCard } from "../chrome/family-ui";

function CalendarFallback(): ReactElement {
  return (
    <div data-calendar-screen>
      <FamilyThumbShell content={<LoadingCard label="Loading the calendar" />} />
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
