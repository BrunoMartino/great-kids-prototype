"use client";

import type { ChangeEvent, FormEvent, ReactElement } from "react";
import type { PanelCategoryRow, PanelMissionRow } from "./panel-catalog-facade";
import { usePanelSession } from "./panel-session-context";
import { TrashIcon, UploadIcon } from "../shell/panel-icons";
import { PANEL_SCREEN_STYLES } from "../shell/panel-screen-styles";
import {
  StaffSessionToolbar,
  type StaffRole,
} from "../shell/staff-session-toolbar";

const CATALOG_EXTRAS: string = `
[data-review-chip] {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #ece6df;
  background: color-mix(in srgb, var(--color-muted) 16%, var(--color-paper));
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 700;
}
[data-review-chip][data-review-status="published"] {
  background: #e4ecdf;
  background: color-mix(in srgb, var(--color-success) 16%, var(--color-paper));
  color: var(--color-success);
}
[data-review-chip][data-review-status="in_review"] {
  background: #f3ead4;
  background: color-mix(in srgb, var(--color-warning) 18%, var(--color-paper));
  color: var(--color-warning);
}
@media (min-width: 768px) {
  [data-panel-catalog] [data-panel-form] {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) minmax(0, 1fr) auto;
    align-items: end;
  }
}
`;

function reviewLabel(p_status: string): string {
  if (p_status === "draft") {
    return "Draft";
  }
  if (p_status === "in_review") {
    return "In review";
  }
  if (p_status === "published") {
    return "Published";
  }
  return p_status;
}

function categoryName(
  p_categoryId: string,
  p_categories: PanelCategoryRow[],
): string {
  for (let i: number = 0; i < p_categories.length; i += 1) {
    const category: PanelCategoryRow = p_categories[i];
    if (category.id === p_categoryId) {
      return category.name;
    }
  }
  return "Category";
}

export function CatalogScreen(): ReactElement {
  const session: ReturnType<typeof usePanelSession> = usePanelSession();

  const onSwitchRole = (p_role: StaffRole): void => {
    void session.switchRole(p_role);
  };

  const onCreateSubmit = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    const form: HTMLFormElement = p_event.currentTarget;
    const data: FormData = new FormData(form);
    const title: string = String(data.get("title") ?? "").trim();
    const categoryId: string = String(data.get("category_id") ?? "");
    const fileValue: FormDataEntryValue | null = data.get("file");
    const file: File | null =
      fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
    void session
      .createMission({ category_id: categoryId, title, file })
      .then((p_ok: boolean): void => {
        if (p_ok) {
          form.reset();
        }
      });
  };

  const onRowImage = (
    p_id: string,
    p_event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const file: File | undefined = p_event.target.files?.[0];
    p_event.target.value = "";
    if (file === undefined) {
      return;
    }
    void session.uploadMissionImage(p_id, file);
  };

  return (
    <div data-panel-page data-panel-catalog>
      <style href="panel-page" precedence="medium">
        {PANEL_SCREEN_STYLES}
      </style>
      <style href="panel-catalog" precedence="medium">
        {CATALOG_EXTRAS}
      </style>
      <StaffSessionToolbar
        activeRole={session.activeRole}
        onSwitchRole={onSwitchRole}
        isBusy={session.isLoading}
      />
      {session.isLoading ? (
        <div data-panel-loading aria-live="polite" aria-busy="true">
          <h1>Loading the catalog</h1>
          <div data-panel-loading-bar />
        </div>
      ) : null}
      {!session.isLoading && session.isForbidden ? (
        <div data-panel-forbidden role="alert">
          <h1>Access denied</h1>
          <p>This catalog is staff only.</p>
        </div>
      ) : null}
      {!session.isLoading &&
      !session.isForbidden &&
      session.errorMessage !== null ? (
        <div data-panel-error role="alert">
          <h1>Could not load the catalog</h1>
          <p>{session.errorMessage}</p>
        </div>
      ) : null}
      {!session.isLoading &&
      !session.isForbidden &&
      session.errorMessage === null &&
      session.role !== null ? (
        <div data-panel-success>
          <h1>Catalog</h1>
          <p>Staff missions, including drafts and review.</p>
          <form data-panel-form onSubmit={onCreateSubmit}>
            <label data-panel-field>
              <span>Category</span>
              <select name="category_id" required defaultValue="">
                <option value="" disabled>
                  Choose
                </option>
                {session.categories.map(
                  (p_category: PanelCategoryRow): ReactElement => {
                    return (
                      <option key={p_category.id} value={p_category.id}>
                        {p_category.name}
                      </option>
                    );
                  },
                )}
              </select>
            </label>
            <label data-panel-field>
              <span>Title</span>
              <input name="title" type="text" autoComplete="off" required />
            </label>
            <label data-panel-field>
              <span>Image</span>
              <input name="file" type="file" accept="image/*" />
            </label>
            <div data-panel-field data-panel-submit>
              <span>Create</span>
              <button type="submit" data-variant="primary">
                Create
              </button>
            </div>
            {session.formError !== null ? (
              <p data-panel-form-error role="alert">
                {session.formError}
              </p>
            ) : null}
          </form>
          <div data-panel-table-wrap>
            {session.missions.length === 0 ? (
              <p data-panel-empty>No missions in the catalog.</p>
            ) : (
              <table data-panel-table>
                <caption>Catalog missions</caption>
                <thead>
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Category</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {session.missions.map((p_mission: PanelMissionRow): ReactElement => {
                    return (
                      <tr data-panel-row key={p_mission.id}>
                        <td>{p_mission.title}</td>
                        <td>
                          {categoryName(p_mission.category_id, session.categories)}
                        </td>
                        <td>
                          <span
                            data-review-chip
                            data-review-status={p_mission.review_status}
                          >
                            {reviewLabel(p_mission.review_status)}
                          </span>
                        </td>
                        <td>
                          <div data-panel-row-actions>
                            <label data-file-button data-tooltip="Upload image">
                              <span data-sr-only>Upload image</span>
                              <UploadIcon label="Upload image" />
                              <input
                                type="file"
                                accept="image/*"
                                aria-label="Upload image"
                                onChange={(
                                  p_event: ChangeEvent<HTMLInputElement>,
                                ): void => {
                                  onRowImage(p_mission.id, p_event);
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              data-variant="danger"
                              data-icon="true"
                              data-tooltip="Delete mission"
                              title="Delete mission"
                              aria-label="Delete mission"
                              onClick={(): void => {
                                void session.deleteMission(p_mission.id);
                              }}
                            >
                              <TrashIcon label="Delete mission" />
                            </button>
                          </div>
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
