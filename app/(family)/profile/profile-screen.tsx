"use client";

import type { ChangeEvent, FormEvent, ReactElement } from "react";
import {
  ArrowsClockwiseIcon,
  CompassIcon,
  type Icon,
  LockIcon,
  NotePencilIcon,
  PencilSimpleIcon,
  QuestionIcon,
  TrashIcon,
  TrophyIcon,
  WarningIcon,
} from "@/app/design-system/icons";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import { LoadingCard, StateCard, Well } from "../chrome/family-ui";
import { useFamilySession } from "../context-switch/family-session-context";
import {
  AchievementsLeaf,
  type GpsComponent,
  QuizAnswerLeaf,
  RhythmsLeaf,
} from "./gps-composite";
import {
  ProfileSessionProvider,
  useProfileSession,
} from "./profile-session-context";

const SCREEN_STYLES: string = `
[data-profile-fact-actions] {
  display: flex;
  gap: 8px;
}
[data-profile-fact] [data-profile-answer] {
  color: var(--gk-ink);
  font-size: 16px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
[data-profile-tiles] [data-gk-card] {
  gap: 8px;
  padding: 16px;
}
`;

type GpsTile = {
  count: string;
  title: string;
  icon: Icon;
  tone: "sea" | "warm";
};

function tileFor(p_child: GpsComponent): GpsTile {
  const count: string = p_child.label().split(" ")[0] ?? "0";
  if (p_child instanceof QuizAnswerLeaf) {
    return { count, title: "Answers", icon: QuestionIcon, tone: "sea" };
  }
  if (p_child instanceof RhythmsLeaf) {
    return { count, title: "Rhythms", icon: ArrowsClockwiseIcon, tone: "sea" };
  }
  if (p_child instanceof AchievementsLeaf) {
    return { count, title: "Achievements", icon: TrophyIcon, tone: "warm" };
  }
  return { count, title: "GPS", icon: CompassIcon, tone: "sea" };
}

function ProfileScreenBody(): ReactElement {
  const profile: ReturnType<typeof useProfileSession> = useProfileSession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const presentation = profile.presentation;
  const isModalOpen: boolean =
    profile.editingQuestionId !== null || profile.deletingQuestionId !== null;

  return (
    <div data-profile-screen>
      <style href="profile-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-gk-screen-frame inert={isModalOpen}>
        <FamilyThumbShell
          sub="What we know about you"
          title="Family GPS"
          content={
            <>
              {presentation.kind === "loading" || session.isLoading ? (
                <LoadingCard label="Loading GPS" />
              ) : null}
              {presentation.kind === "need-family" && !session.isLoading ? (
                <StateCard icon={CompassIcon} title="Family GPS">
                  <p>Opening family GPS.</p>
                </StateCard>
              ) : null}
              {presentation.kind === "denied" ? (
                <StateCard icon={LockIcon} title="GPS is Parent only" role="alert">
                  <p>Child view cannot edit or delete what we know about you.</p>
                </StateCard>
              ) : null}
              {presentation.kind === "missing" ? (
                <StateCard icon={WarningIcon} title="Family not found">
                  <p>That id does not open GPS.</p>
                </StateCard>
              ) : null}
              {presentation.kind === "error" ? (
                <StateCard icon={WarningIcon} title="Family GPS" role="alert">
                  <p>{presentation.message}</p>
                </StateCard>
              ) : null}
              {presentation.kind === "ready" ? (
                <>
                  <div data-gk-tiles data-profile-tiles data-gk-enter>
                    {presentation.composite.getChildren().map((p_child: GpsComponent, p_index: number) => {
                      const tile: GpsTile = tileFor(p_child);
                      return (
                        <div data-gk-card key={`${tile.title}-${String(p_index)}`}>
                          <Well icon={tile.icon} tone={tile.tone} />
                          <span data-gk-num>{tile.count}</span>
                          <h2>{tile.title}</h2>
                        </div>
                      );
                    })}
                  </div>
                  {presentation.composite.p_profileNotes !== null &&
                  presentation.composite.p_profileNotes.length > 0 ? (
                    <div data-gk-reward>
                      <Well icon={NotePencilIcon} tone="warm" />
                      <div>
                        <h2>Notes</h2>
                        <p>{presentation.composite.p_profileNotes}</p>
                      </div>
                    </div>
                  ) : null}
                  <section data-gk-stack aria-labelledby="profile-facts">
                    <h2 data-gk-sec id="profile-facts">Your answers</h2>
                    {presentation.answers.length === 0 ? (
                      <StateCard icon={QuestionIcon} title="Nothing stored yet">
                        <p>No facts stored yet. Answer the family quiz to start.</p>
                      </StateCard>
                    ) : null}
                    {presentation.answers.map((p_item) => (
                      <div data-gk-card data-profile-fact key={p_item.question_id}>
                        <p data-profile-answer>{p_item.answer_text}</p>
                        <p>From the family quiz</p>
                        <div data-profile-fact-actions>
                          <button
                            type="button"
                            data-gk-btn="secondary"
                            data-size="sm"
                            onClick={(): void => {
                              profile.openEdit(p_item);
                            }}
                          >
                            <PencilSimpleIcon size={16} weight="bold" aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            data-gk-btn="ghost"
                            data-size="sm"
                            data-kind="danger"
                            onClick={(): void => {
                              profile.openDelete(p_item);
                            }}
                          >
                            <TrashIcon size={16} weight="bold" aria-hidden="true" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </section>
                </>
              ) : null}
            </>
          }
        />
      </div>
      <div
        data-gk-sheet-backdrop
        data-open={profile.editingQuestionId !== null ? "true" : "false"}
        role="presentation"
        aria-hidden={profile.editingQuestionId === null}
        inert={profile.editingQuestionId === null}
      >
        <form
          data-gk-sheet
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-answer-title"
          onSubmit={(p_event: FormEvent<HTMLFormElement>): void => {
            p_event.preventDefault();
            void profile.saveEdit();
          }}
        >
          <span data-gk-grab aria-hidden="true" />
          <h2 id="edit-answer-title">Edit answer</h2>
          <label data-gk-field>
            Answer
            <textarea
              data-gk-input
              value={profile.editDraft}
              onChange={(p_event: ChangeEvent<HTMLTextAreaElement>): void => {
                profile.setEditDraft(p_event.currentTarget.value);
              }}
            />
          </label>
          {profile.formError !== null && profile.editingQuestionId !== null ? (
            <p data-gk-alert="danger" role="alert">
              <WarningIcon size={20} aria-hidden="true" />
              {profile.formError}
            </p>
          ) : null}
          <button
            type="button"
            data-gk-btn="secondary"
            onClick={(): void => {
              profile.closeModal();
            }}
          >
            Cancel
          </button>
          <button type="submit" data-gk-btn="primary" disabled={profile.isSaving}>
            Save
          </button>
        </form>
      </div>
      <div
        data-gk-sheet-backdrop
        data-open={profile.deletingQuestionId !== null ? "true" : "false"}
        role="presentation"
        aria-hidden={profile.deletingQuestionId === null}
        inert={profile.deletingQuestionId === null}
      >
        <div data-gk-sheet role="dialog" aria-modal="true" aria-labelledby="delete-answer-title">
          <span data-gk-grab aria-hidden="true" />
          <h2 id="delete-answer-title">Delete this fact?</h2>
          <p>The bank question stays. Only the family answer leaves GPS.</p>
          {profile.formError !== null && profile.deletingQuestionId !== null ? (
            <p data-gk-alert="danger" role="alert">
              <WarningIcon size={20} aria-hidden="true" />
              {profile.formError}
            </p>
          ) : null}
          <button
            type="button"
            data-gk-btn="secondary"
            onClick={(): void => {
              profile.closeModal();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            data-gk-btn="danger"
            disabled={profile.isSaving}
            onClick={(): void => {
              void profile.confirmDelete();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfileScreen(): ReactElement {
  return (
    <ProfileSessionProvider>
      <ProfileScreenBody />
    </ProfileSessionProvider>
  );
}
