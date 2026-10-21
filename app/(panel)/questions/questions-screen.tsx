"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
  type WheelEvent,
} from "react";
import type {
  PanelQuestionRow,
  QuestionKind,
  QuestionStatus,
} from "./questions-facade";
import {
  useQuestionsSession,
  type SwitchableRole,
} from "./questions-session-context";
import { PencilIcon, TrashIcon } from "../shell/panel-icons";
import {
  StaffSessionToolbar,
  staffRoleLabel,
} from "../shell/staff-session-toolbar";

const SCREEN_STYLES: string = `
[data-panel-questions] {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 1120px;
  min-width: 0;
}
[data-panel-questions] h1 {
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0;
  font-size: var(--fs-adm-h1);
  line-height: 1.25;
}
[data-panel-questions] p {
  margin: 0;
  color: var(--gk-ink-muted);
  line-height: 1.45;
}
[data-panel-role] {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 28px;
  padding: 0 10px;
  border-radius: var(--r-pill);
  background: var(--gk-surface-2);
  background: color-mix(in srgb, var(--gk-primary) 14%, var(--gk-surface));
  color: var(--gk-primary);
  font-size: var(--fs-caption);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-panel-loading],
[data-panel-forbidden],
[data-panel-error],
[data-panel-success] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  max-width: 100%;
  opacity: 1;
  transform: translate3d(0, 0, 0);
  animation: panel-enter 200ms var(--ease-enter) both;
}
[data-panel-loading-bar] {
  width: 100%;
  height: 12px;
  border-radius: var(--r-pill);
  background: var(--gk-surface-2);
  transform-origin: left center;
  transform: translateZ(0);
  animation: panel-load 900ms ease-in-out infinite;
}
[data-panel-toolbar],
[data-panel-filters] {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
[data-panel-toolbar-label],
[data-panel-filters-label] {
  color: var(--gk-ink-muted);
  font-size: var(--fs-caption);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-panel-questions] button,
[data-panel-questions] select,
[data-panel-questions] input {
  font: inherit;
  color: inherit;
}
[data-panel-questions] button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 40px;
  min-width: 36px;
  padding: 0 14px;
  border: 1px solid var(--gk-border-strong);
  border-radius: var(--r-sm);
  background: var(--gk-surface);
  color: var(--gk-primary);
  font-size: var(--fs-body-sm);
  font-weight: 600;
  cursor: pointer;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background-color var(--dur-micro) var(--ease-state), color var(--dur-micro) var(--ease-state), transform var(--dur-micro) var(--ease-state);
}
[data-panel-questions] button::-moz-focus-inner {
  border: 0;
  padding: 0;
}
[data-panel-questions] button[data-pressed="true"],
[data-panel-filters] button[data-pressed="true"] {
  border-color: var(--gk-primary);
  background: var(--gk-primary);
  color: var(--gk-on-primary);
}
[data-panel-questions] button[data-variant="primary"] {
  border-color: var(--gk-primary);
  background: var(--gk-primary);
  color: var(--gk-on-primary);
}
[data-panel-questions] button[data-variant="danger"] {
  border-color: transparent;
  background: var(--gk-danger-soft);
  color: var(--gk-danger-ink);
}
[data-panel-questions] button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
[data-panel-questions] button:active:not(:disabled) {
  transform: scale(0.98);
}
[data-panel-questions] input,
[data-panel-questions] select {
  min-height: 40px;
  width: 100%;
  padding: 0 12px;
  border: 1px solid var(--gk-border-strong);
  border-radius: var(--r-sm);
  background: var(--gk-surface);
  color: var(--gk-ink);
  font-size: 16px;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: opacity 120ms ease-out;
}
[data-panel-questions] input[type="search"]::-webkit-search-decoration,
[data-panel-questions] input[type="search"]::-webkit-search-cancel-button,
[data-panel-questions] input[type="search"]::-webkit-search-results-button,
[data-panel-questions] input[type="search"]::-webkit-search-results-decoration {
  -webkit-appearance: none;
}
[data-panel-questions] select {
  padding-right: 32px;
  background-color: var(--gk-surface);
  background-image:
    linear-gradient(45deg, transparent 50%, var(--gk-ink-muted) 50%),
    linear-gradient(135deg, var(--gk-ink-muted) 50%, transparent 50%);
  background-repeat: no-repeat;
  background-position: calc(100% - 17px) 50%, calc(100% - 12px) 50%;
  background-size: 5px 5px, 5px 5px;
}
[data-panel-questions] input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
[data-panel-questions] input[type="number"]::-webkit-outer-spin-button,
[data-panel-questions] input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
[data-panel-questions] input:disabled,
[data-panel-questions] select:disabled {
  opacity: 0.55;
}
[data-panel-questions] button:focus,
[data-panel-questions] input:focus,
[data-panel-questions] select:focus {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}
[data-panel-questions] button:focus:not(:focus-visible),
[data-panel-questions] input:focus:not(:focus-visible),
[data-panel-questions] select:focus:not(:focus-visible) {
  outline: none;
}
[data-panel-questions] button:focus-visible,
[data-panel-questions] input:focus-visible,
[data-panel-questions] select:focus-visible {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}
[data-panel-form] {
  display: grid;
  gap: 12px;
  padding: 20px;
  border: 1px solid var(--gk-border);
  border-radius: var(--r-md);
  background: var(--gk-surface);
  box-shadow: var(--el-1);
}
[data-panel-field] {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
[data-panel-field] span {
  color: var(--gk-ink-muted);
  font-size: var(--fs-caption);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-panel-form-error] {
  color: var(--gk-danger-ink);
  font-size: var(--fs-body-sm);
}
[data-panel-table-wrap] {
  display: block;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  overflow-anchor: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--gk-border-strong) transparent;
  border: 1px solid var(--gk-border);
  border-radius: var(--r-md);
  background: var(--gk-surface);
  box-shadow: var(--el-1);
}
[data-panel-table] {
  width: -webkit-max-content;
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
}
[data-panel-table] caption {
  padding: 16px 16px 0;
  color: var(--gk-ink-muted);
  font-size: var(--fs-body-sm);
  text-align: left;
}
[data-panel-table] th,
[data-panel-table] td {
  min-width: 0;
  padding: 12px 16px;
  text-align: left;
  vertical-align: middle;
  overflow-wrap: break-word;
  overflow-wrap: anywhere;
}
[data-panel-table] th {
  color: var(--gk-ink-muted);
  font-size: var(--fs-caption);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  height: 44px;
  background: var(--gk-surface-2);
  border-bottom: 1px solid var(--gk-border);
}
[data-panel-table] td {
  height: 52px;
  border-bottom: 1px solid var(--gk-border);
  font-variant-numeric: tabular-nums;
}
[data-panel-row] {
  opacity: 1;
  animation: panel-row-enter 200ms var(--ease-enter) both;
}
[data-panel-row][data-deleted="true"] {
  opacity: 0.64;
}
[data-panel-row-actions] {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
[data-panel-questions] button[data-icon="true"] {
  padding: 0;
  width: 36px;
}
[data-tooltip] {
  position: relative;
}
[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  right: calc(100% + 8px);
  top: 50%;
  z-index: 3;
  padding: 6px 10px;
  border-radius: var(--r-sm);
  background: var(--gk-ink);
  color: var(--gk-on-primary);
  font-size: var(--fs-caption);
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transform: translate3d(4px, -50%, 0);
  transition: opacity 120ms ease-out, transform 120ms ease-out;
}
[data-panel-search] {
  min-width: 180px;
  flex: 1 1 220px;
}
[data-status-chip] {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: var(--r-pill);
  background: var(--gk-surface-2);
  background: color-mix(in srgb, var(--gk-ink-muted) 16%, var(--gk-surface));
  color: var(--gk-ink-muted);
  font-size: var(--fs-caption);
  font-weight: 700;
}
[data-status-chip][data-status="active"] {
  background: var(--gk-success-soft);
  background: color-mix(in srgb, var(--gk-success) 16%, var(--gk-surface));
  color: var(--gk-success-ink);
}
[data-status-chip][data-status="inactive"] {
  background: var(--gk-warning-soft);
  background: color-mix(in srgb, var(--gk-warning) 18%, var(--gk-surface));
  color: var(--gk-warning-ink);
}
[data-status-chip][data-status="deleted"] {
  background: var(--gk-danger-soft);
  background: color-mix(in srgb, var(--gk-danger) 14%, var(--gk-surface));
  color: var(--gk-danger-ink);
}
[data-panel-empty] {
  padding: 24px 16px;
  color: var(--gk-ink-muted);
}
@keyframes panel-enter {
  from { opacity: 0; transform: translate3d(0, 4px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes panel-row-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes panel-load {
  0% { opacity: 0.45; transform: scaleX(0.55); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.45; transform: scaleX(0.55); }
}
[data-panel-table] input,
[data-panel-table] select {
  min-width: 72px;
}
@media (min-width: 768px) {
  [data-panel-form] {
    grid-template-columns: minmax(0, 1fr) 160px 96px 140px auto;
    align-items: end;
  }
  [data-panel-form] [data-panel-form-error] {
    grid-column: 1 / -1;
  }
}
@media (hover: hover) and (pointer: fine) {
  [data-tooltip]:hover::after {
    opacity: 1;
    transform: translate3d(0, -50%, 0);
  }
  [data-panel-questions] button:hover:not(:disabled) {
    background: var(--gk-surface-2);
  }
  [data-panel-questions] button[data-pressed="true"]:hover:not(:disabled),
  [data-panel-filters] button[data-pressed="true"]:hover:not(:disabled),
  [data-panel-questions] button[data-variant="primary"]:hover:not(:disabled) {
    border-color: var(--gk-primary-hover);
    background: var(--gk-primary-hover);
    color: var(--gk-on-primary);
  }
  [data-panel-table] tbody tr:hover td {
    background: var(--adm-row-hover);
  }
  [data-panel-questions] button[data-variant="danger"]:hover:not(:disabled) {
    background: var(--gk-danger);
    color: var(--gk-on-primary);
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-panel-loading],
  [data-panel-forbidden],
  [data-panel-error],
  [data-panel-success],
  [data-panel-row],
  [data-panel-loading-bar],
  [data-panel-questions] button,
  [data-panel-questions] input,
  [data-panel-questions] select,
  [data-tooltip]::after {
    animation: none !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition: none !important;
    opacity: 1;
    transform: none;
  }
}
`;

function statusLabel(p_status: string): string {
  if (p_status === "active") {
    return "Active";
  }
  if (p_status === "inactive") {
    return "Inactive";
  }
  return p_status;
}

function readKind(p_value: string): QuestionKind {
  if (p_value === "Say-What") {
    return "Say-What";
  }
  return "Family-Quiz";
}

function readStatus(p_value: string): QuestionStatus {
  if (p_value === "inactive") {
    return "inactive";
  }
  return "active";
}

function readWeight(p_value: string): number {
  const weight: number = Number(p_value);
  if (Number.isFinite(weight) && weight >= 0) {
    return weight;
  }
  return 0;
}

function blurNumberOnWheel(p_event: WheelEvent<HTMLInputElement>): void {
  if (p_event.currentTarget !== document.activeElement) {
    return;
  }
  p_event.preventDefault();
  p_event.currentTarget.blur();
}

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

export function QuestionsScreen(): ReactElement {
  const session: ReturnType<typeof useQuestionsSession> = useQuestionsSession();
  const [searchText, setSearchText] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const visibleQuestions: PanelQuestionRow[] = session.questions.filter(
    (p_question: PanelQuestionRow): boolean => {
      const needle: string = searchText.trim().toLowerCase();
      if (needle.length === 0) {
        return true;
      }
      return p_question.question_text.toLowerCase().includes(needle);
    },
  );

  const onSwitchRole = (p_role: SwitchableRole): void => {
    void session.switchRole(p_role);
  };

  const onCreateSubmit = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    const form: HTMLFormElement = p_event.currentTarget;
    const data: FormData = new FormData(form);
    const questionText: string = String(data.get("question_text") ?? "").trim();
    if (questionText.length === 0) {
      void session.createQuestion({
        question_text: "",
        kind: "Family-Quiz",
        weight: 0,
        status: "active",
      });
      return;
    }
    const kind: QuestionKind = readKind(String(data.get("kind") ?? ""));
    const weight: number = readWeight(String(data.get("weight") ?? "0"));
    const status: QuestionStatus = readStatus(String(data.get("status") ?? ""));
    void session
      .createQuestion({
        question_text: questionText,
        kind,
        weight,
        status,
      })
      .then((p_ok: boolean): void => {
        if (p_ok) {
          form.reset();
        }
      });
  };

  const onPatchSubmit = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    const form: HTMLFormElement = p_event.currentTarget;
    const data: FormData = new FormData(form);
    const id: string = String(data.get("id") ?? "");
    const questionText: string = String(data.get("question_text") ?? "").trim();
    const kind: QuestionKind = readKind(String(data.get("kind") ?? ""));
    const weight: number = readWeight(String(data.get("weight") ?? "0"));
    const status: QuestionStatus = readStatus(String(data.get("status") ?? ""));
    void session.patchQuestion(id, {
      question_text: questionText,
      kind,
      weight,
      status,
    });
  };

  const onDelete = (p_id: string): void => {
    void session.deleteQuestion(p_id);
  };

  return (
    <div data-panel-questions>
      <style href="panel-questions" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <StaffSessionToolbar
        activeRole={session.activeRole}
        onSwitchRole={onSwitchRole}
        isBusy={session.isLoading}
      />
      {session.isLoading ? (
        <div data-panel-loading aria-live="polite" aria-busy="true">
          <span data-panel-role>Questions</span>
          <h1>Loading questions</h1>
          <div data-panel-loading-bar />
        </div>
      ) : null}
      {!session.isLoading && session.isForbidden ? (
        <div data-panel-forbidden role="alert">
          <span data-panel-role>Questions</span>
          <h1>Access denied</h1>
          <p>This bank is staff only.</p>
        </div>
      ) : null}
      {!session.isLoading &&
      !session.isForbidden &&
      session.errorMessage !== null ? (
        <div data-panel-error role="alert">
          <span data-panel-role>Questions</span>
          <h1>Could not load questions</h1>
          <p>{session.errorMessage}</p>
        </div>
      ) : null}
      {!session.isLoading &&
      !session.isForbidden &&
      session.errorMessage === null &&
      session.role !== null ? (
        <div data-panel-success data-questions-id={session.listId ?? ""}>
          <span data-panel-role data-role={session.role}>
            {staffRoleLabel(session.activeRole ?? session.role)}
          </span>
          <h1>Questions</h1>
          <p>Question bank for the family quiz and Say What?</p>
          <div data-panel-filters>
            <span data-panel-filters-label>Search</span>
            <input
              data-panel-search
              type="search"
              value={searchText}
              autoComplete="off"
              placeholder="Filter questions"
              aria-label="Filter questions"
              onChange={(p_event: ChangeEvent<HTMLInputElement>): void => {
                setSearchText(p_event.target.value);
              }}
            />
            <span data-panel-filters-label>Type</span>
            <button
              type="button"
              data-question-kind="all"
              data-pressed={session.kindFilter === null ? "true" : "false"}
              aria-pressed={session.kindFilter === null}
              onClick={(): void => {
                session.setKindFilter(null);
              }}
            >
              All
            </button>
            <button
              type="button"
              data-question-kind="Family-Quiz"
              data-pressed={
                session.kindFilter === "Family-Quiz" ? "true" : "false"
              }
              aria-pressed={session.kindFilter === "Family-Quiz"}
              onClick={(): void => {
                session.setKindFilter("Family-Quiz");
              }}
            >
              Family-Quiz
            </button>
            <button
              type="button"
              data-question-kind="Say-What"
              data-pressed={
                session.kindFilter === "Say-What" ? "true" : "false"
              }
              aria-pressed={session.kindFilter === "Say-What"}
              onClick={(): void => {
                session.setKindFilter("Say-What");
              }}
            >
              Say-What
            </button>
          </div>
          <form data-panel-form onSubmit={onCreateSubmit}>
            <label data-panel-field>
              <span>Text</span>
              <input name="question_text" type="text" autoComplete="off" />
            </label>
            <label data-panel-field>
              <span>Type</span>
              <select name="kind" defaultValue="Family-Quiz">
                <option value="Family-Quiz">Family-Quiz</option>
                <option value="Say-What">Say-What</option>
              </select>
            </label>
            <label data-panel-field>
              <span>Weight</span>
              <input
                name="weight"
                type="number"
                min={0}
                step={1}
                defaultValue={0}
                inputMode="numeric"
                onWheel={blurNumberOnWheel}
              />
            </label>
            <label data-panel-field>
              <span>Status</span>
              <select name="status" defaultValue="active">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <button type="submit" data-variant="primary">
              Add
            </button>
            {session.formError !== null ? (
              <p data-panel-form-error role="alert">
                {session.formError}
              </p>
            ) : null}
          </form>
          <div data-panel-table-wrap>
            {visibleQuestions.length === 0 ? (
              <p data-panel-empty>No questions in the bank.</p>
            ) : (
              <table data-panel-table>
                <caption>Bank questions</caption>
                <thead>
                  <tr>
                    <th scope="col">Text</th>
                    <th scope="col">Type</th>
                    <th scope="col">Status</th>
                    <th scope="col">Weight</th>
                    <th scope="col">Deleted</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleQuestions.map(
                    (p_question: PanelQuestionRow): ReactElement => {
                      const rowKey: string = `${session.listId ?? ""}-${p_question.id}`;
                      const isEditing: boolean = editingId === p_question.id;
                      if (p_question.deleted) {
                        return (
                          <tr
                            data-panel-row
                            data-question-kind={p_question.kind}
                            data-deleted="true"
                            key={rowKey}
                          >
                            <td>{p_question.question_text}</td>
                            <td>{p_question.kind}</td>
                            <td>
                              <span
                                data-status-chip
                                data-status={p_question.status}
                              >
                                {statusLabel(p_question.status)}
                              </span>
                            </td>
                            <td>{p_question.weight}</td>
                            <td>
                              <span data-status-chip data-status="deleted">
                                Deleted
                              </span>
                            </td>
                            <td>—</td>
                          </tr>
                        );
                      }
                      const formId: string = `question-edit-${p_question.id}`;
                      return (
                        <tr
                          data-panel-row
                          data-question-kind={p_question.kind}
                          data-deleted="false"
                          key={rowKey}
                        >
                          <td>
                            <input
                              form={formId}
                              name="question_text"
                              type="text"
                              autoComplete="off"
                              defaultValue={p_question.question_text}
                              aria-label="Text"
                              disabled={!isEditing}
                            />
                          </td>
                          <td>
                            <select
                              form={formId}
                              name="kind"
                              defaultValue={p_question.kind}
                              aria-label="Type"
                              disabled={!isEditing}
                            >
                              <option value="Family-Quiz">Family-Quiz</option>
                              <option value="Say-What">Say-What</option>
                            </select>
                          </td>
                          <td>
                            <select
                              form={formId}
                              name="status"
                              defaultValue={p_question.status}
                              aria-label="Status"
                              disabled={!isEditing}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </td>
                          <td>
                            <input
                              form={formId}
                              name="weight"
                              type="number"
                              min={0}
                              step={1}
                              defaultValue={p_question.weight}
                              inputMode="numeric"
                              aria-label="Weight"
                              disabled={!isEditing}
                              onWheel={blurNumberOnWheel}
                            />
                          </td>
                          <td>No</td>
                          <td>
                            <form id={formId} onSubmit={onPatchSubmit}>
                              <input
                                type="hidden"
                                name="id"
                                value={p_question.id}
                              />
                              <div data-panel-row-actions>
                                <button
                                  type="button"
                                  data-icon="true"
                                  data-pressed={isEditing ? "true" : "false"}
                                  aria-pressed={isEditing}
                                  aria-label={
                                    isEditing
                                      ? "Done editing"
                                      : "Edit question"
                                  }
                                  onClick={(): void => {
                                    if (isEditing) {
                                      const form: HTMLFormElement | null =
                                        document.getElementById(
                                          formId,
                                        ) as HTMLFormElement | null;
                                      submitHtmlForm(form);
                                      setEditingId(null);
                                      return;
                                    }
                                    setEditingId(p_question.id);
                                  }}
                                >
                                  <PencilIcon label="Edit question" />
                                </button>
                                <button
                                  type="button"
                                  data-variant="danger"
                                  data-icon="true"
                                  data-tooltip="Delete question"
                                  title="Delete question"
                                  aria-label="Delete question"
                                  onClick={(): void => {
                                    onDelete(p_question.id);
                                  }}
                                >
                                  <TrashIcon label="Delete question" />
                                </button>
                              </div>
                            </form>
                          </td>
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
