import type { ReactElement } from "react";
import { UsersScreen } from "./users-screen";
import { UsersSessionProvider } from "./users-session-context";

export default function UsersPage(): ReactElement {
  return (
    <UsersSessionProvider>
      <UsersScreen />
    </UsersSessionProvider>
  );
}
