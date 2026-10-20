"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import { noteKindStrategies } from "../diary/kind-strategy";
import {
  ChildSessionProvider,
  useChildSession,
} from "./child-session-context";

const SCREEN_STYLES: string = `
[data-child-screen] {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
[data-child-scroll] {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 16px;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 8px 4px 16px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
[data-child-screen] h1 { margin: 0; font-size: 1.35rem; line-height: 1.25; }
[data-child-screen] h2 { margin: 0; font-size: 1.05rem; }
[data-child-screen] p { margin: 0; color: var(--color-muted); line-height: 1.45; }
[data-child-badge] {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-child) 14%, var(--color-paper));
  color: var(--color-child);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-child-card] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--color-tertiary) 22%, var(--color-paper));
}
[data-child-enter] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: child-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes child-enter {
  from { opacity: 0; transform: translate3d(0, 8px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
[data-child-kinds] {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
[data-child-screen] textarea {
  width: 100%;
  min-height: 96px;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid color-mix(in srgb, var(--color-ink) 14%, var(--color-tertiary));
  border-radius: 14px;
  background: var(--color-paper);
  color: var(--color-ink);
  font: inherit;
  font-size: 16px;
  resize: none;
}
[data-child-screen] button {
  min-height: 44px;
  margin: 0;
  padding: 0 16px;
  border: 0;
  border-radius: 14px;
  background: var(--color-child);
  color: var(--color-paper);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
[data-child-kinds] button {
  background: color-mix(in srgb, var(--color-ink) 8%, var(--color-paper));
  color: var(--color-ink);
}
[data-child-kinds] button[data-pressed="true"] {
  background: var(--color-child);
  color: var(--color-paper);
}
[data-child-error] { color: var(--color-danger); font-weight: 600; }
[data-child-screen] button:disabled { opacity: 0.55; cursor: not-allowed; }
@media (prefers-reduced-motion: reduce) {
  [data-child-enter] { animation: none; }
}
`;

function ChildScreenBody(): ReactElement {
  const child: ReturnType<typeof useChildSession> = useChildSession();
  const familyNotes =
    child.notes === null ? [] : child.notes.family_notes.notes;

  const onSubmit = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    void child.submitNote();
  };

  return (
    <div data-child-screen>
      <style href="child-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-child-scroll>
        <FamilyThumbShell
          content={
            <>
        <span data-child-badge>Child view</span>
        {child.presentation.kind === "loading" ? (
          <div data-child-enter>
            <h1>The child's home</h1>
            <p>Loading missions and stories.</p>
          </div>
        ) : null}
        {child.presentation.kind === "denied" ? (
          <div data-child-enter role="alert">
            <h1>No session</h1>
            <p>Open the child view from the Parent menu.</p>
          </div>
        ) : null}
        {child.presentation.kind === "ready" ? (
          <div data-child-enter>
            <h1>The child's home</h1>
            <p>Chosen missions, history, and one note. No photo. No plan or invite.</p>
            <div data-child-card>
              <h2>Chosen missions</h2>
              {child.chosen.map((p_item) => (
                <p key={p_item.title}>{p_item.title}</p>
              ))}
            </div>
            <div data-child-card>
              <h2>History</h2>
              {child.completedBlocked ? (
                <p>History does not open in this view yet.</p>
              ) : null}
              {!child.completedBlocked && child.completed.length === 0 ? (
                <p>There are no completed missions yet.</p>
              ) : null}
              {child.completed.map((p_item) => (
                <p key={p_item.id}>{p_item.title}</p>
              ))}
            </div>
            {familyNotes.length > 0 ? (
              <p>{familyNotes[0]?.text}</p>
            ) : null}
          </div>
        ) : null}
            </>
          }
          actions={
            child.presentation.kind === "ready" ? (
            <form data-child-card onSubmit={onSubmit}>
              <h2>Mission note</h2>
              <p>About a finished mission. Text only. No photo.</p>
              <div data-child-kinds>
                {noteKindStrategies().map((p_kind) => (
                  <button
                    key={p_kind.kind}
                    type="button"
                    data-pressed={child.draftKind === p_kind.kind ? "true" : "false"}
                    onClick={(): void => {
                      child.setDraftKind(p_kind.kind);
                    }}
                  >
                    {p_kind.label}
                  </button>
                ))}
              </div>
              <textarea
                value={child.draftText}
                onChange={(p_event: ChangeEvent<HTMLTextAreaElement>): void => {
                  child.setDraftText(p_event.currentTarget.value);
                }}
              />
              {child.formError !== null ? (
                <p data-child-error role="alert">
                  {child.formError}
                </p>
              ) : null}
              <button type="submit" disabled={child.isSaving}>
                Save note
              </button>
            </form>
            ) : undefined
          }
        />
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
