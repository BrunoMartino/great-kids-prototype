"use client";

import type { FormEvent, ReactElement } from "react";
import { PANEL_SCREEN_STYLES } from "../shell/panel-screen-styles";
import {
  StaffSessionToolbar,
  staffRoleLabel,
  type StaffRole,
} from "../shell/staff-session-toolbar";
import type { PanelPlanRow } from "./plans-facade";
import { usePlansSession } from "./plans-session-context";

function statusLabel(p_status: string): string {
  if (p_status === "active") {
    return "Active";
  }
  if (p_status === "inactive") {
    return "Inactive";
  }
  return p_status;
}

export function PlansScreen(): ReactElement {
  const session: ReturnType<typeof usePlansSession> = usePlansSession();

  const onSwitchRole = (p_role: StaffRole): void => {
    void session.switchRole(p_role);
  };

  const onCreateSubmit = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    const form: HTMLFormElement = p_event.currentTarget;
    const data: FormData = new FormData(form);
    void session
      .createPlan({
        name: String(data.get("name") ?? "").trim(),
        status: String(data.get("status") ?? "active"),
      })
      .then((p_ok: boolean): void => {
        if (p_ok) {
          form.reset();
        }
      });
  };

  return (
    <div data-panel-page data-panel-plans>
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
          <span data-panel-role>Plans</span>
          <h1>Loading plans</h1>
          <div data-panel-loading-bar />
        </div>
      ) : null}
      {!session.isLoading && session.isForbidden ? (
        <div data-panel-forbidden role="alert">
          <span data-panel-role>Plans</span>
          <h1>Access denied</h1>
          <p>This list is staff only.</p>
        </div>
      ) : null}
      {!session.isLoading &&
      !session.isForbidden &&
      session.errorMessage !== null ? (
        <div data-panel-error role="alert">
          <span data-panel-role>Plans</span>
          <h1>Could not load plans</h1>
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
          <h1>Plans</h1>
          <p>Platform plans. No hard delete.</p>
          <form data-panel-form onSubmit={onCreateSubmit}>
            <label data-panel-field>
              <span>Name</span>
              <input name="name" type="text" autoComplete="off" required />
            </label>
            <label data-panel-field>
              <span>Status</span>
              <select name="status" defaultValue="active">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <button type="submit" data-variant="primary">
              Create
            </button>
            {session.formError !== null ? (
              <p data-panel-form-error role="alert">
                {session.formError}
              </p>
            ) : null}
          </form>
          <div data-panel-table-wrap>
            {session.plans.length === 0 ? (
              <p data-panel-empty>No plans.</p>
            ) : (
              <table data-panel-table>
                <caption>Plans</caption>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {session.plans.map((p_plan: PanelPlanRow): ReactElement => {
                    const nextStatus: string =
                      p_plan.status === "active" ? "inactive" : "active";
                    return (
                      <tr data-panel-row key={p_plan.id}>
                        <td>{p_plan.name}</td>
                        <td>
                          <span data-status-chip data-status={p_plan.status}>
                            {statusLabel(p_plan.status)}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={(): void => {
                              void session.patchPlanStatus(p_plan.id, nextStatus);
                            }}
                          >
                            {nextStatus === "inactive" ? "Deactivate" : "Activate"}
                          </button>
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
