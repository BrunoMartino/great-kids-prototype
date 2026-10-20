import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";

function DiaryFallback(): ReactElement {
  return (
    <div data-diary-screen>
      <div data-diary-scroll>
        <div aria-live="polite" aria-busy="true">
          <h1>Loading the diary</h1>
        </div>
      </div>
    </div>
  );
}

const DiaryScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { DiaryScreen: ComponentType } = await import("./diary-screen");
    return { default: loaded.DiaryScreen };
  },
  { loading: DiaryFallback },
);

export default function DiaryPage(): ReactElement {
  return <DiaryScreen />;
}
