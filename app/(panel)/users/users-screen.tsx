"use client";

import type { ReactElement } from "react";
import { PANEL_SCREEN_STYLES } from "../shell/panel-screen-styles";
import {
  StaffSessionToolbar,
  staffRoleLabel,
  type StaffRole,
} from "../shell/staff-session-toolbar";
import type { PanelUserRow } from "./users-facade";
import { useUsersSession } from "./users-session-context";

function userRoleLabel(p_role: string): string {
  if (p_role === "Admin") {
    return "Admin";
  }
  if (p_role === "Operator") {
    return "Operator";
  }
  if (p_role === "Parent") {
    return "Holder";
  }
  if (p_role === "Child") {
    return "Child";
  }
  return p_role;
}

function statusLabel(p_status: string): string {
  if (p_status === "active") {
    return "Active";
  }
  if (p_status === "inactive") {
    return "Inactive";
  }
  if (p_status === "blocked") {
    return "Blocked";
  }
  if (p_status === "suspended") {
    return "Suspended";
  }
  return p_status;
}

export function UsersScreen(): ReactElement {
  const session: ReturnType<typeof useUsersSession> = useUsersSession();

  const onSwitchRole = (p_role: StaffRole): void => {
    void session.switchRole(p_role);
  };

  return (
    <div data-panel-page data-panel-users>
      <style href="panel-page" precedence="medium">
        {PANEL_SCREEN_STYLES}
      </style>
      <StaffSessionToolbar
        activeRole={session.activeRole}
        onSwitchRole={onSwitchRole}
        isBusy={session.isLoading}
      />
      {session.isLoading ? (
        <div data-panel-loading aria-live="polite" aria-busy="true">
          <span data-panel-role>Users</span>
          <h1>Loading users</h1>
          <div data-panel-loading-bar />
        </div>
      ) : null}
      {!session.isLoading && session.isForbidden ? (
        <div data-panel-forbidden role="alert">
          <span data-panel-role>Users</span>
          <h1>Access denied</h1>
          <p>This list is staff only.</p>
        </div>
      ) : null}
      {!session.isLoading &&
      !session.isForbidden &&
      session.errorMessage !== null ? (
        <div data-panel-error role="alert">
          <span data-panel-role>Users</span>
          <h1>Could not load users</h1>
          <p>{session.errorMessage}</p>
        </div>
      ) : null}
      {!session.isLoading &&
      !session.isForbidden &&
      session.errorMessage === null &&
      session.role !== null ? (
        <div data-panel-success>
          <span data-panel-role data-role={session.role}>
            {staffRoleLabel(session.role)}
          </span>
          <h1>Users</h1>
          <p>
            {session.canWrite
              ? "Admin can block accounts. The row stays in the list."
              : "Operator can view the list. Changes are disabled."}
          </p>
          {session.formError !== null ? (
            <p data-panel-form-error role="alert">
              {session.formError}
            </p>
          ) : null}
          <div data-panel-table-wrap>
            {session.users.length === 0 ? (
              <p data-panel-empty>No users.</p>
            ) : (
              <table data-panel-table>
                <caption>Users</caption>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Handle</th>
                    <th scope="col">Email</th>
                    <th scope="col">Role</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {session.users.map((p_user: PanelUserRow): ReactElement => {
                    const displayName: string =
                      p_user.name === null || p_user.name.length === 0
                        ? p_user.nick_name
                        : p_user.name;
                    const displayEmail: string =
                      p_user.email === null || p_user.email.length === 0
                        ? "—"
                        : p_user.email;
                    const isBlocked: boolean = p_user.status === "blocked";
                    return (
                      <tr data-panel-row key={p_user.id}>
                        <td>{displayName}</td>
                        <td>{p_user.nick_name}</td>
                        <td>{displayEmail}</td>
                        <td>{userRoleLabel(p_user.role)}</td>
                        <td>
                          <span data-status-chip data-status={p_user.status}>
                            {statusLabel(p_user.status)}
                          </span>
                        </td>
                        <td>
                          {session.canWrite ? (
                            <button
                              type="button"
                              data-variant="danger"
                              disabled={isBlocked}
                              onClick={(): void => {
                                void session.blockUser(p_user.id);
                              }}
                            >
                              {isBlocked ? "Blocked" : "Block"}
                            </button>
                          ) : (
                            <button type="button" disabled>
                              Block
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
