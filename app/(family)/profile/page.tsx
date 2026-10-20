import { Suspense, type ReactElement } from "react";
import { ProfileScreen } from "./profile-screen";

function ProfileFallback(): ReactElement {
  return (
    <div data-profile-screen>
      <div data-profile-scroll>
        <div aria-live="polite" aria-busy="true">
          <h1>Carregando o GPS</h1>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage(): ReactElement {
  return (
    <Suspense fallback={<ProfileFallback />}>
      <ProfileScreen />
    </Suspense>
  );
}
