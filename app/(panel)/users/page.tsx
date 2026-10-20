import dynamic from "next/dynamic";
import type { ComponentType, ReactElement } from "react";
import { UsersSessionProvider } from "./users-session-context";

const UsersScreen: ComponentType = dynamic(
  async (): Promise<{ default: ComponentType }> => {
    const loaded: { UsersScreen: ComponentType } = await import("./users-screen");
    return { default: loaded.UsersScreen };
  },
);

export default function UsersPage(): ReactElement {
  return (
    <UsersSessionProvider>
      <UsersScreen />
    </UsersSessionProvider>
  );
}
