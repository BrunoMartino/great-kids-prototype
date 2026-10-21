"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  type ReactElement,
} from "react";
import {
  CheckIcon,
  LockIcon,
  NotePencilIcon,
  StarIcon,
  WarningIcon,
} from "@/app/design-system/icons";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import {
  HeroWaves,
  LoadingCard,
  MascotGlyph,
  StateCard,
  TypewriterCopy,
  Well,
} from "../chrome/family-ui";
import type { DiaryNoteItem } from "../diary/diary-payload";
import { labelForKind, noteKindStrategies } from "../diary/kind-strategy";
import {
  ChildSessionProvider,
  useChildSession,
} from "./child-session-context";

function ChildScreenBody(): ReactElement {
  const child: ReturnType<typeof useChildSession> = useChildSession();
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const familyNotes: DiaryNoteItem[] = child.notes === null ? [] : child.notes.family_notes.notes;
  const latestNote: DiaryNoteItem | undefined = familyNotes[0];
  const isReady: boolean = child.presentation.kind === "ready";
  const firstMission: string = child.chosen[0]?.title ?? "";

  const onSubmit = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    void child.submitNote();
  };

  const closeSheet = (): void => {
    setIsSheetOpen(false);
  };

  const hero: ReactElement = (
    <section data-gk-hero aria-labelledby="child-title">
      <HeroWaves />
      <header data-gk-head>
        <p data-gk-sub>Child view</p>
        <h1 id="child-title">Your missions</h1>
      </header>
      {isReady && firstMission.length > 0 ? (
        <div data-gk-mission>
          <div data-gk-mission-top>
            <p data-gk-eyebrow>Chosen mission</p>
            <MascotGlyph />
          </div>
          <TypewriterCopy text={firstMission} />
        </div>
      ) : null}
    </section>
  );

  return (
    <div data-child-screen>
      <div data-gk-screen-frame inert={isSheetOpen}>
        <FamilyThumbShell
          hero={hero}
          content={
            <>
              {child.presentation.kind === "loading" ? (
                <LoadingCard label="Loading missions and stories" />
              ) : null}
              {child.presentation.kind === "denied" ? (
                <StateCard icon={LockIcon} title="No session" role="alert">
                  <p>Open the child view from the Parent menu.</p>
                </StateCard>
              ) : null}
              {isReady ? (
                <>
                  <section data-gk-stack data-gk-enter aria-labelledby="child-chosen">
                    <h2 data-gk-sec id="child-chosen">Chosen missions</h2>
                    <div data-gk-list>
                      {child.chosen.map((p_item) => (
                        <div data-gk-row key={p_item.title}>
                          <Well icon={StarIcon} tone="warm" size="sm" />
                          <span data-gk-row-text>
                            <strong>{p_item.title}</strong>
                            <span>Picked by your family</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section data-gk-stack data-gk-enter aria-labelledby="child-history">
                    <h2 data-gk-sec id="child-history">History</h2>
                    {child.completedBlocked ? (
                      <StateCard icon={LockIcon} title="Not open yet">
                        <p>History does not open in this view yet.</p>
                      </StateCard>
                    ) : null}
                    {!child.completedBlocked && child.completed.length === 0 ? (
                      <StateCard icon={StarIcon} tone="warm" title="Nothing here yet">
                        <p>There are no completed missions yet.</p>
                      </StateCard>
                    ) : null}
                    {child.completed.length > 0 ? (
                      <div data-gk-list>
                        {child.completed.map((p_item) => (
                          <div data-gk-row key={p_item.id}>
                            <Well icon={CheckIcon} size="sm" />
                            <span data-gk-row-text>
                              <strong>{p_item.title}</strong>
                              <span>Completed</span>
                            </span>
                            <span data-gk-badge="success">
                              <CheckIcon size={14} weight="bold" aria-hidden="true" />
                              Done
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </section>
                  {latestNote !== undefined ? (
                    <section data-gk-stack data-gk-enter aria-labelledby="child-note">
                      <h2 data-gk-sec id="child-note">Latest note</h2>
                      <div data-gk-reward>
                        <Well icon={NotePencilIcon} tone="warm" />
                        <div>
                          <h3>{labelForKind(latestNote.kind)}</h3>
                          <p>{latestNote.text}</p>
                        </div>
                      </div>
                    </section>
                  ) : null}
                  <p data-gk-caption>Text only. No photo, no plan, no invites in this view.</p>
                </>
              ) : null}
            </>
          }
          actions={
            isReady ? (
              <div data-gk-action-row>
                <button
                  type="button"
                  data-gk-btn="warm"
                  onClick={(): void => {
                    setIsSheetOpen(true);
                  }}
                >
                  <NotePencilIcon size={18} weight="bold" aria-hidden="true" />
                  Add a note
                </button>
              </div>
            ) : undefined
          }
        />
      </div>
      <div
        data-gk-sheet-backdrop
        data-open={isSheetOpen ? "true" : "false"}
        aria-hidden={!isSheetOpen}
        inert={!isSheetOpen}
        onClick={(p_event: MouseEvent<HTMLDivElement>): void => {
          if (p_event.target === p_event.currentTarget) {
            closeSheet();
          }
        }}
      >
        <form
          data-gk-sheet
          role="dialog"
          aria-modal="true"
          aria-labelledby="child-note-title"
          onSubmit={onSubmit}
        >
          <span data-gk-grab aria-hidden="true" />
          <h2 id="child-note-title">Add note</h2>
          <p>Text only. No child photo.</p>
          <fieldset data-gk-chips aria-label="Note kind">
            {noteKindStrategies().map((p_kind) => (
              <button
                key={p_kind.kind}
                type="button"
                data-gk-chip
                aria-pressed={child.draftKind === p_kind.kind}
                onClick={(): void => {
                  child.setDraftKind(p_kind.kind);
                }}
              >
                <CheckIcon data-gk-check size={16} weight="bold" aria-hidden="true" />
                {p_kind.label}
              </button>
            ))}
          </fieldset>
          <label data-gk-field>
            Note
            <textarea
              data-gk-input
              value={child.draftText}
              onChange={(p_event: ChangeEvent<HTMLTextAreaElement>): void => {
                child.setDraftText(p_event.currentTarget.value);
              }}
            />
          </label>
          {child.formError !== null ? (
            <p data-gk-alert="danger" role="alert">
              <WarningIcon size={20} aria-hidden="true" />
              {child.formError}
            </p>
          ) : null}
          <button type="submit" data-gk-btn="primary" disabled={child.isSaving}>
            Save note
          </button>
          <button type="button" data-gk-btn="ghost" onClick={closeSheet}>
            Close
          </button>
        </form>
      </div>
    </div>
  );
}

export function ChildScreen(): ReactElement {
  return (
    <ChildSessionProvider>
      <ChildScreenBody />
    </ChildSessionProvider>
  );
}
