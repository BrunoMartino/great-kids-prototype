import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import { LoadingCard } from "../chrome/family-ui";

function ProfileFallback(): ReactElement {
  return (
    <div data-profile-screen>
      <FamilyThumbShell content={<LoadingCard label="Loading GPS" />} />
    </div>
  );
}

const ProfileScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { ProfileScreen: ComponentType } = await import("./profile-screen");
    return { default: loaded.ProfileScreen };
  },
  { loading: ProfileFallback },
);

export default function ProfilePage(): ReactElement {
  return <ProfileScreen />;
}
