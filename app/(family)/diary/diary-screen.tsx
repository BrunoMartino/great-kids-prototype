"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import { FamilyNav } from "../chrome/family-nav";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import { useFamilySession } from "../context-switch/family-session-context";
import type { CompletedMissionItem } from "../missions/completed/completed-payload";
import type { DiaryMissionNoteItem, DiaryNoteItem } from "./diary-payload";
import {
  DiarySessionProvider,
  useDiarySession,
} from "./diary-session-context";
import {
  labelForKind,
  noteKindStrategies,
  type NoteKindPresentationStrategy,
} from "./kind-strategy";

const SCREEN_STYLES: string = `
[data-diary-screen] {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
[data-diary-scroll] {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 16px;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overflow-anchor: none;
  padding: 8px 4px 16px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--color-ink) 22%, transparent) transparent;
}
[data-diary-scroll]::-webkit-scrollbar { width: 4px; }
[data-diary-scroll]::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-ink) 22%, transparent);
  border-radius: 999px;
}
[data-diary-screen] h1 { margin: 0; font-size: 1.35rem; line-height: 1.25; }
[data-diary-screen] h2 { margin: 0; font-size: 1.05rem; }
[data-diary-screen] p { margin: 0; color: var(--color-muted); line-height: 1.45; }
[data-diary-badge] {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-primary) 14%, var(--color-paper));
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-diary-badge][data-role="Child"] {
  background: color-mix(in srgb, var(--color-child) 14%, var(--color-paper));
  color: var(--color-child);
}
[data-diary-enter] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: diary-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes diary-enter {
  from { opacity: 0; transform: translate3d(0, 8px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
[data-diary-loading-bar] {
  height: 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  transform-origin: left center;
  animation: diary-load 900ms ease-in-out infinite;
}
@keyframes diary-load {
  0% { opacity: 0.45; transform: scaleX(0.55); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.45; transform: scaleX(0.55); }
}
[data-diary-card],
[data-diary-tools],
[data-diary-item] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--color-tertiary) 22%, var(--color-paper));
}
[data-diary-list] {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
[data-diary-item] {
  animation: diary-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
[data-diary-kind-chip] {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-secondary) 14%, var(--color-paper));
  color: var(--color-secondary);
  font-size: 0.75rem;
  font-weight: 700;
}
[data-diary-screen] label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--color-muted);
  font-size: 0.85rem;
}
[data-diary-screen] input,
[data-diary-screen] textarea,
[data-diary-screen] select {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  padding: 0 14px;
  border: 1px solid color-mix(in srgb, var(--color-ink) 14%, var(--color-tertiary));
  border-radius: 14px;
  background: var(--color-paper);
  color: var(--color-ink);
  font: inherit;
  font-size: 16px;
  -webkit-appearance: none;
  appearance: none;
}
[data-diary-screen] textarea {
  min-height: 96px;
  padding: 12px 14px;
  resize: none;
}
[data-diary-screen] select {
  padding-right: 32px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%232c2a28' d='M1.2 1.4 L6 6.2 L10.8 1.4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px 8px;
}
[data-diary-screen] input:focus,
[data-diary-screen] textarea:focus,
[data-diary-screen] select:focus,
[data-diary-screen] button:focus { outline: 2px solid var(--color-ink); outline-offset: 2px; }
[data-diary-screen] input:focus:not(:focus-visible),
[data-diary-screen] textarea:focus:not(:focus-visible),
[data-diary-screen] select:focus:not(:focus-visible),
[data-diary-screen] button:focus:not(:focus-visible) { outline: none; }
[data-diary-screen] input:focus-visible,
[data-diary-screen] textarea:focus-visible,
[data-diary-screen] select:focus-visible,
[data-diary-screen] button:focus-visible { outline: 2px solid var(--color-ink); outline-offset: 2px; }
[data-diary-screen] button {
  min-height: 44px;
  margin: 0;
  padding: 0 16px;
  border: 0;
  border-radius: 14px;
  background: var(--color-primary);
  color: var(--color-paper);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
[data-diary-screen] button[data-kind="ghost"] {
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  color: var(--color-ink);
}
[data-diary-kinds] {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
[data-diary-kinds] button {
  background: color-mix(in srgb, var(--color-ink) 8%, var(--color-paper));
  color: var(--color-ink);
}
[data-diary-kinds] button[data-pressed="true"] {
  background: var(--color-primary);
  color: var(--color-paper);
}
[data-diary-screen] button:active { opacity: 0.88; }
[data-diary-screen] button:disabled { opacity: 0.55; cursor: not-allowed; }
[data-diary-empty] { font-weight: 600; }
[data-diary-error] { color: var(--color-danger); font-weight: 600; }
[data-diary-backdrop] {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  align-items: flex-end;
  padding: 12px;
  background: color-mix(in srgb, var(--color-ink) 38%, transparent);
  opacity: 0;
  pointer-events: none;
  transition: opacity 160ms ease-in;
}
[data-diary-backdrop][data-open="true"] {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-diary-sheet] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-height: 86%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 20px 16px 16px;
  border-radius: 20px 20px 16px 16px;
  background: var(--color-paper);
  opacity: 0;
  transform: translate3d(0, 8px, 0);
  transition: transform 160ms ease-in, opacity 160ms ease-in;
}
[data-diary-backdrop][data-open="true"] [data-diary-sheet] {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-diary-sheet] button { width: 100%; }
@media (hover: hover) and (pointer: fine) {
  [data-diary-screen] button:hover:not(:disabled) { opacity: 0.92; }
}
@media (prefers-reduced-motion: reduce) {
  [data-diary-screen] *,
  [data-diary-screen] *::before,
  [data-diary-screen] *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

function missionKeyFor(p_item: CompletedMissionItem): string {
  return `${p_item.mission_id}|${p_item.id}`;
}

function DiaryScreenBody(): ReactElement {
  const diary: ReturnType<typeof useDiarySession> = useDiarySession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const role: string = session.snapshot?.role ?? "none";
  const presentation = diary.presentation;
  const familyNotes: DiaryNoteItem[] =
    presentation.kind === "ready" ? presentation.payload.family_notes.notes : [];
  const missionNotes: DiaryMissionNoteItem[] =
    presentation.kind === "ready" ? presentation.payload.mission_note.notes : [];
  const parentPersonalNotes: DiaryNoteItem[] = familyNotes.filter(
    (p_note: DiaryNoteItem): boolean => {
      return p_note.author !== "Child";
    },
  );
  const parentMissionNotes: DiaryMissionNoteItem[] = missionNotes.filter(
    (p_item: DiaryMissionNoteItem): boolean => {
      return p_item.note.author !== "Child";
    },
  );
  const childMissionNotes: DiaryMissionNoteItem[] = missionNotes.filter(
    (p_item: DiaryMissionNoteItem): boolean => {
      return p_item.note.author === "Child";
    },
  );
  const isEmpty: boolean =
    presentation.kind === "ready" &&
    parentPersonalNotes.length === 0 &&
    parentMissionNotes.length === 0 &&
    childMissionNotes.length === 0;

  const onSubmitNote = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    void diary.submitNote();
  };

  return (
    <div data-diary-screen>
      <style href="diary-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-diary-scroll inert={diary.isComposerOpen}>
        <FamilyThumbShell
          content={
            <>
        <FamilyNav familyId={diary.familyId} active="diary" />
        <span data-diary-badge data-role={role}>
          View {role === "none" ? "session" : role}
        </span>
        {presentation.kind === "loading" || session.isLoading ? (
          <div data-diary-enter aria-live="polite" aria-busy="true">
            <h1>Loading the diary</h1>
            <div data-diary-loading-bar />
          </div>
        ) : null}
        {presentation.kind === "need-family" && !session.isLoading ? (
          <div data-diary-enter>
            <h1>Family diary</h1>
            <p>Opening the family diary.</p>
          </div>
        ) : null}
        {presentation.kind === "denied" ? (
          <div data-diary-enter role="alert">
            <h1>Diary is family only</h1>
            <p>This view does not open the notes.</p>
          </div>
        ) : null}
        {presentation.kind === "missing" ? (
          <div data-diary-enter>
            <h1>Family not found</h1>
            <p>That id does not open the diary.</p>
          </div>
        ) : null}
        {presentation.kind === "error" ? (
          <div data-diary-enter role="alert">
            <h1>Family diary</h1>
            <p>{presentation.message}</p>
          </div>
        ) : null}
        {presentation.kind === "ready" ? (
          <div data-diary-enter data-diary-list>
            <h1>Family diary</h1>
            <p>No photo. Story only.</p>
            {presentation.canAuthor ? null : (
              <p>Child can add notes on chosen missions from Child home.</p>
            )}
            {isEmpty ? (
              <div data-diary-card data-diary-empty-state="true">
                <h2 data-diary-empty>No stories yet.</h2>
                <p>The envelope arrives empty. No photo. Text only.</p>
              </div>
            ) : null}
            {parentPersonalNotes.length > 0 ? (
              <div data-diary-card>
                <h2>Parent notes</h2>
                {parentPersonalNotes.map((p_note: DiaryNoteItem): ReactElement => {
                  return (
                    <article
                      key={p_note.id}
                      data-diary-item
                      data-diary-kind={p_note.kind}
                      data-diary-author="Parent"
                    >
                      <span data-diary-kind-chip>
                        {labelForKind(p_note.kind)}
                      </span>
                      <p>{p_note.text}</p>
                    </article>
                  );
                })}
              </div>
            ) : null}
            {parentMissionNotes.length > 0 ? (
              <div data-diary-card>
                <h2>Parent mission notes</h2>
                {parentMissionNotes.map(
                  (p_item: DiaryMissionNoteItem): ReactElement => {
                    return (
                      <article
                        key={p_item.note.id}
                        data-diary-item
                        data-diary-kind={p_item.note.kind}
                        data-diary-author="Parent"
                        data-mission-id={p_item.mission_id}
                      >
                        <span data-diary-kind-chip>
                          {labelForKind(p_item.note.kind)}
                        </span>
                        <p>{p_item.note.text}</p>
                        <p>Linked to a completed mission.</p>
                      </article>
                    );
                  },
                )}
              </div>
            ) : null}
            {childMissionNotes.length > 0 ? (
              <div data-diary-card>
                <h2>Child mission notes</h2>
                {childMissionNotes.map(
                  (p_item: DiaryMissionNoteItem): ReactElement => {
                    return (
                      <article
                        key={p_item.note.id}
                        data-diary-item
                        data-diary-kind={p_item.note.kind}
                        data-diary-author="Child"
                        data-mission-id={p_item.mission_id}
                      >
                        <span data-diary-kind-chip>
                          {labelForKind(p_item.note.kind)}
                        </span>
                        <p>{p_item.note.text}</p>
                        <p>From the child about a mission.</p>
                      </article>
                    );
                  },
                )}
              </div>
            ) : null}
          </div>
        ) : null}
            </>
          }
          actions={
            presentation.kind === "ready" && presentation.canAuthor ? (
              <button
                type="button"
                onClick={(): void => {
                  diary.openComposer();
                }}
              >
                Add note
              </button>
            ) : undefined
          }
        />
      </div>
      <div
        data-diary-backdrop
        data-open={diary.isComposerOpen ? "true" : "false"}
        role="presentation"
        aria-hidden={!diary.isComposerOpen}
        inert={!diary.isComposerOpen}
      >
        <form
          data-diary-sheet
          role="dialog"
          aria-modal="true"
          aria-labelledby="diary-compose-title"
          onSubmit={onSubmitNote}
        >
          <h2 id="diary-compose-title">New note</h2>
          <p>Five kinds. Text only. No photo.</p>
          <div data-diary-kinds role="group" aria-label="Note kind">
            {noteKindStrategies().map(
              (p_strategy: NoteKindPresentationStrategy): ReactElement => {
                const pressed: boolean = diary.draftKind === p_strategy.kind;
                return (
                  <button
                    key={p_strategy.kind}
                    type="button"
                    data-diary-kind={p_strategy.kind}
                    data-pressed={pressed ? "true" : "false"}
                    aria-pressed={pressed}
                    onClick={(): void => {
                      diary.setDraftKind(p_strategy.kind);
                    }}
                  >
                    {p_strategy.label}
                  </button>
                );
              },
            )}
          </div>
          <label>
            Story
            <textarea
              name="diary-text"
              autoComplete="off"
              value={diary.draftText}
              onChange={(p_event: ChangeEvent<HTMLTextAreaElement>): void => {
                diary.setDraftText(p_event.currentTarget.value);
              }}
            />
          </label>
          {diary.completedMissions.length > 0 ? (
            <label>
              Link to a completed mission
              <select
                name="diary-mission"
                value={diary.draftMissionKey}
                onChange={(p_event: ChangeEvent<HTMLSelectElement>): void => {
                  diary.setDraftMissionKey(p_event.currentTarget.value);
                }}
              >
                <option value="">No mission</option>
                {diary.completedMissions.map(
                  (p_item: CompletedMissionItem): ReactElement => {
                    const key: string = missionKeyFor(p_item);
                    return (
                      <option key={p_item.id} value={key}>
                        {p_item.title}
                      </option>
                    );
                  },
                )}
              </select>
            </label>
          ) : null}
          {diary.formError !== null ? (
            <p data-diary-error role="alert">
              {diary.formError}
            </p>
          ) : null}
          <button type="submit" disabled={diary.isSaving}>
            Save
          </button>
          <button
            type="button"
            data-kind="ghost"
            onClick={(): void => {
              diary.closeComposer();
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export function DiaryScreen(): ReactElement {
  return (
    <DiarySessionProvider>
      <DiaryScreenBody />
    </DiarySessionProvider>
  );
}
