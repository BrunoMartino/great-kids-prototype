import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import { LoadingCard } from "../chrome/family-ui";

function DiaryFallback(): ReactElement {
  return (
    <div data-diary-screen>
      <FamilyThumbShell content={<LoadingCard label="Loading the diary" />} />
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
