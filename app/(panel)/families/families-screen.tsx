"use client";

import type { ReactElement } from "react";
import { PANEL_SCREEN_STYLES } from "../shell/panel-screen-styles";
import {
  StaffSessionToolbar,
  staffRoleLabel,
  type StaffRole,
} from "../shell/staff-session-toolbar";
import type { PanelFamilyInvite, PanelFamilyRow } from "./families-facade";
import { useFamiliesSession } from "./families-session-context";

function invitesLabel(p_invites: PanelFamilyInvite[]): string {
  if (p_invites.length === 0) {
    return "No invites";
  }
  return p_invites
    .map((p_invite: PanelFamilyInvite): string => {
      return `${p_invite.email} (${p_invite.status})`;
    })
    .join(", ");
}

export function FamiliesScreen(): ReactElement {
  const session: ReturnType<typeof useFamiliesSession> = useFamiliesSession();

  const onSwitchRole = (p_role: StaffRole): void => {
    void session.switchRole(p_role);
  };

  return (
    <div data-panel-page data-panel-families>
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
          <span data-panel-role>Families</span>
          <h1>Loading families</h1>
          <div data-panel-loading-bar />
        </div>
      ) : null}
      {!session.isLoading && session.isForbidden ? (
        <div data-panel-forbidden role="alert">
          <span data-panel-role>Families</span>
          <h1>Access denied</h1>
          <p>This list is staff only.</p>
        </div>
      ) : null}
      {!session.isLoading &&
      !session.isForbidden &&
      session.errorMessage !== null ? (
        <div data-panel-error role="alert">
          <span data-panel-role>Families</span>
          <h1>Could not load families</h1>
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
          <h1>Families</h1>
          <p>Accounts, plans, and invites.</p>
          <div data-panel-table-wrap>
            {session.families.length === 0 ? (
              <p data-panel-empty>No families.</p>
            ) : (
              <table data-panel-table>
                <caption>Families</caption>
                <thead>
                  <tr>
                    <th scope="col">Account</th>
                    <th scope="col">Status</th>
                    <th scope="col">Plan</th>
                    <th scope="col">Invites</th>
                  </tr>
                </thead>
                <tbody>
                  {session.families.map(
                    (p_family: PanelFamilyRow, p_index: number): ReactElement => {
                      const planName: string =
                        p_family.plan === null ? "No plan" : p_family.plan.name;
                      return (
                        <tr data-panel-row key={p_family.id}>
                          <td>Family {p_index + 1}</td>
                          <td>
                            <span data-status-chip data-status={p_family.status}>
                              {p_family.status}
                            </span>
                          </td>
                          <td>{planName}</td>
                          <td>{invitesLabel(p_family.invites)}</td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
