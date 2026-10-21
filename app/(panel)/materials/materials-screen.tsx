"use client";

import type { ChangeEvent, DragEvent, FormEvent, ReactElement, RefObject } from "react";
import { useRef, useState } from "react";
import { PANEL_SCREEN_STYLES } from "../shell/panel-screen-styles";
import {
  ImageFileIcon,
  PdfFileIcon,
  TrashIcon,
  UploadIcon,
} from "../shell/panel-icons";
import {
  StaffSessionToolbar,
  staffRoleLabel,
  type StaffRole,
} from "../shell/staff-session-toolbar";
import { MATERIAL_TYPES, type PanelMaterialRow } from "./materials-facade";
import { useMaterialsSession } from "./materials-session-context";

const FILE_ACCEPT: string = "image/*,application/pdf";


function isAllowedMaterialFile(p_file: File): boolean {
  if (p_file.type.startsWith("image/")) {
    return true;
  }
  return p_file.type === "application/pdf";
}

function assignInputFile(p_input: HTMLInputElement, p_file: File): void {
  const transfer: DataTransfer = new DataTransfer();
  transfer.items.add(p_file);
  p_input.files = transfer.files;
}

function fileLabel(p_row: PanelMaterialRow): string {
  if (p_row.feat_img_path !== null) {
    return "Image";
  }
  if (p_row.file_path !== null) {
    return "File";
  }
  return "—";
}

export function MaterialsScreen(): ReactElement {
  const session: ReturnType<typeof useMaterialsSession> = useMaterialsSession();
  const fileInputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragDepth, setDragDepth] = useState<number>(0);

  const onSwitchRole = (p_role: StaffRole): void => {
    void session.switchRole(p_role);
  };

  const onCreateSubmit = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    const form: HTMLFormElement = p_event.currentTarget;
    const data: FormData = new FormData(form);
    const fileValue: FormDataEntryValue | null = data.get("file");
    const file: File | null =
      fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
    void session
      .createMaterial({
        type: String(data.get("type") ?? ""),
        title: String(data.get("title") ?? "").trim(),
        description: String(data.get("description") ?? ""),
        file,
      })
      .then((p_ok: boolean): void => {
        if (p_ok) {
          form.reset();
          setFileName(null);
          setDragDepth(0);
        }
      });
  };

  const onFileChange = (p_event: ChangeEvent<HTMLInputElement>): void => {
    const file: File | undefined = p_event.target.files?.[0];
    if (file === undefined) {
      setFileName(null);
      return;
    }
    setFileName(file.name);
  };

  const onDragEnter = (p_event: DragEvent<HTMLLabelElement>): void => {
    p_event.preventDefault();
    p_event.stopPropagation();
    setDragDepth((p_prev: number): number => {
      return p_prev + 1;
    });
  };

  const onDragOver = (p_event: DragEvent<HTMLLabelElement>): void => {
    p_event.preventDefault();
    p_event.stopPropagation();
  };

  const onDragLeave = (p_event: DragEvent<HTMLLabelElement>): void => {
    p_event.preventDefault();
    p_event.stopPropagation();
    setDragDepth((p_prev: number): number => {
      return Math.max(0, p_prev - 1);
    });
  };

  const onDrop = (p_event: DragEvent<HTMLLabelElement>): void => {
    p_event.preventDefault();
    p_event.stopPropagation();
    setDragDepth(0);
    const input: HTMLInputElement | null = fileInputRef.current;
    const dropped: File | undefined = p_event.dataTransfer.files[0];
    if (input === null || dropped === undefined || !isAllowedMaterialFile(dropped)) {
      return;
    }
    assignInputFile(input, dropped);
    setFileName(dropped.name);
  };

  const onRowFile = (
    p_id: string,
    p_event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const file: File | undefined = p_event.target.files?.[0];
    p_event.target.value = "";
    if (file === undefined) {
      return;
    }
    void session.uploadMaterialFile(p_id, file);
  };

  return (
    <div data-panel-page data-panel-materials>
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
          <span data-panel-role>Materials</span>
          <h1>Loading materials</h1>
          <div data-panel-loading-bar />
        </div>
      ) : null}
      {!session.isLoading && session.isForbidden ? (
        <div data-panel-forbidden role="alert">
          <span data-panel-role>Materials</span>
          <h1>Access denied</h1>
          <p>This catalog is staff only.</p>
        </div>
      ) : null}
      {!session.isLoading &&
      !session.isForbidden &&
      session.errorMessage !== null ? (
        <div data-panel-error role="alert">
          <span data-panel-role>Materials</span>
          <h1>Could not load materials</h1>
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
          <h1>Materials</h1>
          <p>Books, activities, and other curated materials.</p>
          <form data-panel-form onSubmit={onCreateSubmit} aria-labelledby="materials-form-title">
            <div data-panel-form-head>
              <h2 id="materials-form-title">Add material</h2>
              <p>Books, activities and printables the family can use. Image or PDF, optional.</p>
            </div>
            <label data-panel-field>
              <span>Type</span>
              <select name="type" defaultValue="Book">
                {MATERIAL_TYPES.map((p_type: string): ReactElement => {
                  return (
                    <option key={p_type} value={p_type}>
                      {p_type}
                    </option>
                  );
                })}
              </select>
            </label>
            <label data-panel-field>
              <span>Title</span>
              <input name="title" type="text" autoComplete="off" required />
            </label>
            <label data-panel-field data-span="full">
              <span>Description</span>
              <textarea name="description" rows={3} autoComplete="off" />
            </label>
            <div data-panel-field data-file-drop-field data-span="full">
              <span>File</span>
              <label
                data-file-drop
                data-active={dragDepth > 0 ? "true" : "false"}
                data-chosen={fileName !== null ? "true" : "false"}
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <input
                  ref={fileInputRef}
                  name="file"
                  type="file"
                  accept={FILE_ACCEPT}
                  aria-label="Drop an image or PDF, or click to browse"
                  onChange={onFileChange}
                />
                <span data-file-drop-icons>
                  <span data-file-kind>
                    <ImageFileIcon label="Image" />
                  </span>
                  <span data-file-kind>
                    <PdfFileIcon label="PDF" />
                  </span>
                </span>
                <span data-file-drop-copy>
                  {fileName ?? "Drop an image or PDF here, or click to browse"}
                </span>
              </label>
            </div>
            <div data-panel-form-actions>
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
            {session.materials.length === 0 ? (
              <p data-panel-empty>No curated materials.</p>
            ) : (
              <table data-panel-table>
                <caption>Curated materials</caption>
                <thead>
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Type</th>
                    <th scope="col">Status</th>
                    <th scope="col">Attachment</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {session.materials.map((p_row: PanelMaterialRow): ReactElement => {
                    return (
                      <tr data-panel-row key={p_row.id}>
                        <td>{p_row.title}</td>
                        <td>{p_row.type}</td>
                        <td>
                          <span data-status-chip data-status={p_row.status}>
                            {p_row.status}
                          </span>
                        </td>
                        <td>{fileLabel(p_row)}</td>
                        <td>
                          <div data-panel-row-actions>
                            <label data-file-button data-tooltip="Upload file">
                              <span data-sr-only>Upload file</span>
                              <UploadIcon label="Upload file" />
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                aria-label="Upload file"
                                onChange={(
                                  p_event: ChangeEvent<HTMLInputElement>,
                                ): void => {
                                  onRowFile(p_row.id, p_event);
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              data-variant="danger"
                              data-icon="true"
                              data-tooltip="Delete material"
                              title="Delete material"
                              aria-label="Delete material"
                              onClick={(): void => {
                                void session.deleteMaterial(p_row.id);
                              }}
                            >
                              <TrashIcon label="Delete material" />
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
