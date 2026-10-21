"use client";

import type { ChangeEvent, FormEvent, ReactElement } from "react";
import {
  BookOpenTextIcon,
  CheckIcon,
  LockIcon,
  NotePencilIcon,
  StarIcon,
  WarningIcon,
} from "@/app/design-system/icons";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import { LoadingCard, StateCard, Well } from "../chrome/family-ui";
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
[data-diary-item-head] {
  display: flex;
  align-items: center;
  gap: 12px;
}
[data-diary-item] [data-diary-text] {
  color: var(--gk-ink);
  font-size: 16px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}
`;

function missionKeyFor(p_item: CompletedMissionItem): string {
  return `${p_item.mission_id}|${p_item.id}`;
}

function DiaryScreenBody(): ReactElement {
  const diary: ReturnType<typeof useDiarySession> = useDiarySession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const presentation = diary.presentation;
  const familyNotes: DiaryNoteItem[] =
    presentation.kind === "ready" ? presentation.payload.family_notes.notes : [];
  const missionNotes: DiaryMissionNoteItem[] =
    presentation.kind === "ready" ? presentation.payload.mission_note.notes : [];
  const isEmpty: boolean =
    presentation.kind === "ready" && familyNotes.length === 0 && missionNotes.length === 0;
  const canAuthor: boolean = presentation.kind === "ready" && presentation.canAuthor;

  const onSubmitNote = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    void diary.submitNote();
  };

  return (
    <div data-diary-screen>
      <style href="diary-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-gk-screen-frame inert={diary.isComposerOpen}>
        <FamilyThumbShell
          sub="Stories, never photos"
          title="Family diary"
          content={
            <>
              {presentation.kind === "loading" || session.isLoading ? (
                <LoadingCard label="Loading the diary" />
              ) : null}
              {presentation.kind === "need-family" && !session.isLoading ? (
                <StateCard icon={BookOpenTextIcon} title="Family diary">
                  <p>Opening the family diary.</p>
                </StateCard>
              ) : null}
              {presentation.kind === "denied" ? (
                <StateCard icon={LockIcon} title="Diary is family only" role="alert">
                  <p>This view does not open the notes.</p>
                </StateCard>
              ) : null}
              {presentation.kind === "missing" ? (
                <StateCard icon={WarningIcon} title="Family not found">
                  <p>That id does not open the diary.</p>
                </StateCard>
              ) : null}
              {presentation.kind === "error" ? (
                <StateCard icon={WarningIcon} title="Family diary" role="alert">
                  <p>{presentation.message}</p>
                </StateCard>
              ) : null}
              {presentation.kind === "ready" ? (
                <section data-gk-stack data-diary-list aria-label="Stories">
                  {canAuthor ? null : (
                    <p data-gk-alert="info">
                      <LockIcon size={20} aria-hidden="true" />
                      Child view reads the stories. It does not write.
                    </p>
                  )}
                  {isEmpty ? (
                    <StateCard icon={BookOpenTextIcon} tone="warm" title="No stories yet.">
                      <p>The envelope arrives empty. No photo. Text only.</p>
                    </StateCard>
                  ) : null}
                  {familyNotes.map((p_note: DiaryNoteItem): ReactElement => (
                    <article
                      key={p_note.id}
                      data-gk-card
                      data-gk-enter
                      data-diary-item
                      data-diary-kind={p_note.kind}
                    >
                      <div data-diary-item-head>
                        <Well icon={NotePencilIcon} tone="warm" size="sm" />
                        <span data-gk-badge="warm">{labelForKind(p_note.kind)}</span>
                      </div>
                      <p data-diary-text>{p_note.text}</p>
                    </article>
                  ))}
                  {missionNotes.map((p_item: DiaryMissionNoteItem): ReactElement => (
                    <article
                      key={p_item.note.id}
                      data-gk-card
                      data-gk-enter
                      data-diary-item
                      data-diary-kind={p_item.note.kind}
                      data-mission-id={p_item.mission_id}
                    >
                      <div data-diary-item-head>
                        <Well icon={StarIcon} size="sm" />
                        <span data-gk-badge="warm">{labelForKind(p_item.note.kind)}</span>
                        <span data-gk-badge="success">
                          <CheckIcon size={14} weight="bold" aria-hidden="true" />
                          Mission
                        </span>
                      </div>
                      <p data-diary-text>{p_item.note.text}</p>
                      <p>Linked to a completed mission.</p>
                    </article>
                  ))}
                </section>
              ) : null}
            </>
          }
          actions={
            canAuthor ? (
              <div data-gk-action-row>
                <button
                  type="button"
                  data-gk-btn="primary"
                  onClick={(): void => {
                    diary.openComposer();
                  }}
                >
                  <NotePencilIcon size={18} weight="bold" aria-hidden="true" />
                  Add note
                </button>
              </div>
            ) : undefined
          }
        />
      </div>
      <div
        data-gk-sheet-backdrop
        data-open={diary.isComposerOpen ? "true" : "false"}
        role="presentation"
        aria-hidden={!diary.isComposerOpen}
        inert={!diary.isComposerOpen}
      >
        <form
          data-gk-sheet
          role="dialog"
          aria-modal="true"
          aria-labelledby="diary-compose-title"
          onSubmit={onSubmitNote}
        >
          <span data-gk-grab aria-hidden="true" />
          <h2 id="diary-compose-title">New note</h2>
          <p>Five kinds. Text only. No photo.</p>
          <fieldset data-gk-chips aria-label="Note kind">
            {noteKindStrategies().map(
              (p_strategy: NoteKindPresentationStrategy): ReactElement => (
                <button
                  key={p_strategy.kind}
                  type="button"
                  data-gk-chip
                  data-diary-kind={p_strategy.kind}
                  aria-pressed={diary.draftKind === p_strategy.kind}
                  onClick={(): void => {
                    diary.setDraftKind(p_strategy.kind);
                  }}
                >
                  <CheckIcon data-gk-check size={16} weight="bold" aria-hidden="true" />
                  {p_strategy.label}
                </button>
              ),
            )}
          </fieldset>
          <label data-gk-field>
            Story
            <textarea
              data-gk-input
              name="diary-text"
              autoComplete="off"
              value={diary.draftText}
              onChange={(p_event: ChangeEvent<HTMLTextAreaElement>): void => {
                diary.setDraftText(p_event.currentTarget.value);
              }}
            />
          </label>
          {diary.completedMissions.length > 0 ? (
            <label data-gk-field>
              Link to a completed mission
              <select
                data-gk-input
                name="diary-mission"
                value={diary.draftMissionKey}
                onChange={(p_event: ChangeEvent<HTMLSelectElement>): void => {
                  diary.setDraftMissionKey(p_event.currentTarget.value);
                }}
              >
                <option value="">No mission</option>
                {diary.completedMissions.map(
                  (p_item: CompletedMissionItem): ReactElement => (
                    <option key={p_item.id} value={missionKeyFor(p_item)}>
                      {p_item.title}
                    </option>
                  ),
                )}
              </select>
            </label>
          ) : null}
          {diary.formError !== null ? (
            <p data-gk-alert="danger" role="alert">
              <WarningIcon size={20} aria-hidden="true" />
              {diary.formError}
            </p>
          ) : null}
          <button
            type="button"
            data-gk-btn="secondary"
            onClick={(): void => {
              diary.closeComposer();
            }}
          >
            Cancel
          </button>
          <button type="submit" data-gk-btn="primary" disabled={diary.isSaving}>
            Save
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
