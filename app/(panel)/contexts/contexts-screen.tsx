"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { PANEL_SCREEN_STYLES } from "../shell/panel-screen-styles";
import { PencilIcon } from "../shell/panel-icons";
import {
  StaffSessionToolbar,
  staffRoleLabel,
  type StaffRole,
} from "../shell/staff-session-toolbar";
import type { PanelContextRow } from "./contexts-facade";
import { useContextsSession } from "./contexts-session-context";

function submitHtmlForm(p_form: HTMLFormElement | null): void {
  if (p_form === null) {
    return;
  }
  if (typeof p_form.requestSubmit === "function") {
    p_form.requestSubmit();
    return;
  }
  p_form.dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true }),
  );
}

export function ContextsScreen(): ReactElement {
  const session: ReturnType<typeof useContextsSession> = useContextsSession();
  const [editingId, setEditingId] = useState<string | null>(null);

  const onSwitchRole = (p_role: StaffRole): void => {
    void session.switchRole(p_role);
  };

  const onPatchSubmit = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    const form: HTMLFormElement = p_event.currentTarget;
    const data: FormData = new FormData(form);
    const id: string = String(data.get("id") ?? "");
    const name: string = String(data.get("name") ?? "").trim();
    void session.patchContextName(id, name).then((p_ok: boolean): void => {
      if (p_ok) {
        setEditingId(null);
      }
    });
  };

  return (
    <div data-panel-page data-panel-contexts>
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
          <span data-panel-role>Contexts</span>
          <h1>Loading contexts</h1>
          <div data-panel-loading-bar />
        </div>
      ) : null}
      {!session.isLoading && session.isForbidden ? (
        <div data-panel-forbidden role="alert">
          <span data-panel-role>Contexts</span>
          <h1>Access denied</h1>
          <p>This list is staff only.</p>
        </div>
      ) : null}
      {!session.isLoading &&
      !session.isForbidden &&
      session.errorMessage !== null ? (
        <div data-panel-error role="alert">
          <span data-panel-role>Contexts</span>
          <h1>Could not load contexts</h1>
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
          <h1>Contexts</h1>
          <p>Forecast context names. The internal identifier does not change.</p>
          {session.formError !== null ? (
            <p data-panel-form-error role="alert">
              {session.formError}
            </p>
          ) : null}
          <div data-panel-table-wrap>
            {session.contexts.length === 0 ? (
              <p data-panel-empty>No contexts.</p>
            ) : (
              <table data-panel-table>
                <caption>Forecast contexts</caption>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Key</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {session.contexts.map((p_row: PanelContextRow): ReactElement => {
                    const isEditing: boolean = editingId === p_row.id;
                    const formId: string = `context-edit-${p_row.id}`;
                    return (
                      <tr data-panel-row key={p_row.id}>
                        <td>
                          <input
                            form={formId}
                            name="name"
                            type="text"
                            autoComplete="off"
                            defaultValue={p_row.name}
                            disabled={!isEditing}
                            aria-label="Name"
                          />
                        </td>
                        <td>{p_row.slug}</td>
                        <td>
                          <form id={formId} onSubmit={onPatchSubmit}>
                            <input type="hidden" name="id" value={p_row.id} />
                            <button
                              type="button"
                              data-icon="true"
                              data-pressed={isEditing ? "true" : "false"}
                              aria-pressed={isEditing}
                              aria-label={
                                isEditing ? "Done editing" : "Edit context"
                              }
                              onClick={(): void => {
                                if (isEditing) {
                                  const form: HTMLFormElement | null =
                                    document.getElementById(
                                      formId,
                                    ) as HTMLFormElement | null;
                                  submitHtmlForm(form);
                                  return;
                                }
                                setEditingId(p_row.id);
                              }}
                            >
                              <PencilIcon label="Edit context" />
                            </button>
                          </form>
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
