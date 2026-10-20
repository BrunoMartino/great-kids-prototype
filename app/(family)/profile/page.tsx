import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";

function ProfileFallback(): ReactElement {
  return (
    <div data-profile-screen>
      <div data-profile-scroll>
        <div aria-live="polite" aria-busy="true">
          <h1>Loading GPS</h1>
        </div>
      </div>
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
