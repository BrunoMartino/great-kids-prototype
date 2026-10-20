"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import { FamilyNav } from "../chrome/family-nav";
import { useFamilySession } from "../context-switch/family-session-context";
import {
  AchievementsLeaf,
  QuizAnswerLeaf,
  RhythmsLeaf,
} from "./gps-composite";
import {
  ProfileSessionProvider,
  useProfileSession,
} from "./profile-session-context";

const SCREEN_STYLES: string = `
[data-profile-screen] {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
[data-profile-scroll] {
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
  scrollbar-color: #c4b8ac transparent;
  scrollbar-color: color-mix(in srgb, var(--color-ink) 22%, transparent) transparent;
}
[data-profile-scroll]::-webkit-scrollbar { width: 4px; }
[data-profile-scroll]::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-ink) 22%, transparent);
  border-radius: 999px;
}
[data-profile-screen] h1 { margin: 0; font-size: 1.35rem; line-height: 1.25; }
[data-profile-screen] h2 { margin: 0; font-size: 1.05rem; }
[data-profile-screen] p { margin: 0; color: var(--color-muted); line-height: 1.45; }
[data-profile-badge] {
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
[data-profile-badge][data-role="Child"] {
  background: color-mix(in srgb, var(--color-child) 14%, var(--color-paper));
  color: var(--color-child);
}
[data-profile-enter] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: profile-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes profile-enter {
  from { opacity: 0; transform: translate3d(0, 8px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
[data-profile-loading-bar] {
  height: 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  transform-origin: left center;
  animation: profile-load 900ms ease-in-out infinite;
}
@keyframes profile-load {
  0% { opacity: 0.45; transform: scaleX(0.55); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.45; transform: scaleX(0.55); }
}
[data-profile-card],
[data-profile-tools] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--color-tertiary) 22%, var(--color-paper));
}
[data-profile-screen] label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--color-muted);
  font-size: 0.85rem;
}
[data-profile-screen] input,
[data-profile-screen] textarea {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  padding: 10px 14px;
  border: 1px solid color-mix(in srgb, var(--color-ink) 14%, var(--color-tertiary));
  border-radius: 14px;
  background: var(--color-paper);
  color: var(--color-ink);
  font: inherit;
  font-size: 16px;
  -webkit-appearance: none;
  appearance: none;
}
[data-profile-screen] textarea { min-height: 88px; resize: none; }
[data-profile-screen] input:focus,
[data-profile-screen] textarea:focus,
[data-profile-screen] button:focus { outline: 2px solid var(--color-ink); outline-offset: 2px; }
[data-profile-screen] input:focus:not(:focus-visible),
[data-profile-screen] textarea:focus:not(:focus-visible),
[data-profile-screen] button:focus:not(:focus-visible) { outline: none; }
[data-profile-screen] input:focus-visible,
[data-profile-screen] textarea:focus-visible,
[data-profile-screen] button:focus-visible { outline: 2px solid var(--color-ink); outline-offset: 2px; }
[data-profile-actions] { display: flex; gap: 8px; }
[data-profile-screen] button {
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
[data-profile-screen] button[data-kind="ghost"] {
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  color: var(--color-ink);
}
[data-profile-screen] button[data-kind="danger"] { background: var(--color-danger); }
[data-profile-screen] button:active { opacity: 0.88; }
[data-profile-screen] button:disabled { opacity: 0.55; cursor: not-allowed; }
[data-profile-error] { color: var(--color-danger); font-weight: 600; }
[data-profile-source] {
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  word-break: break-all;
}
[data-profile-backdrop] {
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
[data-profile-backdrop][data-open="true"] {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-profile-sheet] {
  width: 100%;
  padding: 20px 16px 16px;
  border-radius: 20px 20px 16px 16px;
  background: var(--color-paper);
  opacity: 0;
  transform: translate3d(0, 8px, 0);
  transition: transform 160ms ease-in, opacity 160ms ease-in;
}
[data-profile-backdrop][data-open="true"] [data-profile-sheet] {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-profile-sheet] h2 { margin-bottom: 8px; }
[data-profile-sheet] button { width: 100%; margin-top: 12px; }
@media (hover: hover) and (pointer: fine) {
  [data-profile-screen] button:hover:not(:disabled) { opacity: 0.92; }
}
@media (prefers-reduced-motion: reduce) {
  [data-profile-screen] *,
  [data-profile-screen] *::before,
  [data-profile-screen] *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

function ProfileScreenBody(): ReactElement {
  const profile: ReturnType<typeof useProfileSession> = useProfileSession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const role: string = session.snapshot?.role ?? "none";
  const presentation = profile.presentation;
  const isModalOpen: boolean =
    profile.editingQuestionId !== null || profile.deletingQuestionId !== null;

  const onApply = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    profile.applyId();
  };

  return (
    <div data-profile-screen>
      <style href="profile-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-profile-scroll inert={isModalOpen}>
        <FamilyNav familyId={profile.familyId} active="profile" />
        <span data-profile-badge data-role={role}>
          Visão {role === "none" ? "sessão" : role}
        </span>
        <form data-profile-tools onSubmit={onApply}>
          <label>
            Id da família
            <input
              type="text"
              name="family-id"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={profile.idDraft}
              onChange={(p_event: ChangeEvent<HTMLInputElement>): void => {
                profile.setIdDraft(p_event.currentTarget.value);
              }}
            />
          </label>
          <button type="submit">Abrir</button>
        </form>
        {presentation.kind === "loading" || session.isLoading ? (
          <div data-profile-enter aria-live="polite" aria-busy="true">
            <h1>Carregando o GPS</h1>
            <div data-profile-loading-bar />
          </div>
        ) : null}
        {presentation.kind === "need-family" && !session.isLoading ? (
          <div data-profile-enter>
            <h1>GPS da família</h1>
            <p>Informe o id da família para ver o que sabemos.</p>
          </div>
        ) : null}
        {presentation.kind === "denied" ? (
          <div data-profile-enter role="alert">
            <h1>GPS só para Parent</h1>
            <p>A visão Child não edita nem apaga o que sabemos sobre vocês.</p>
          </div>
        ) : null}
        {presentation.kind === "missing" ? (
          <div data-profile-enter>
            <h1>Família não encontrada</h1>
            <p>Esse id não abre o GPS.</p>
          </div>
        ) : null}
        {presentation.kind === "error" ? (
          <div data-profile-enter role="alert">
            <h1>GPS da família</h1>
            <p>{presentation.message}</p>
          </div>
        ) : null}
        {presentation.kind === "ready" ? (
          <div data-profile-enter>
            <h1>GPS da família</h1>
            <p>{presentation.composite.label()}</p>
            {presentation.composite.getChildren().map((p_child, p_index) => (
              <div data-profile-card key={`${p_child.label()}-${String(p_index)}`}>
                <h2>
                  {p_child instanceof QuizAnswerLeaf
                    ? "Respostas"
                    : p_child instanceof RhythmsLeaf
                      ? "Ritmos"
                      : p_child instanceof AchievementsLeaf
                        ? "Conquistas"
                        : "GPS"}
                </h2>
                <p>{p_child.label()}</p>
              </div>
            ))}
            {presentation.composite.p_profileNotes !== null &&
            presentation.composite.p_profileNotes.length > 0 ? (
              <div data-profile-card>
                <h2>Notas</h2>
                <p>{presentation.composite.p_profileNotes}</p>
              </div>
            ) : null}
            <h2>O que sabemos sobre vocês</h2>
            {presentation.answers.length === 0 ? (
              <div data-profile-card>
                <p>Ainda não há fatos guardados.</p>
              </div>
            ) : null}
            {presentation.answers.map((p_item) => (
              <div data-profile-card key={p_item.question_id}>
                <p data-profile-source>Pergunta {p_item.question_id}</p>
                <p>{p_item.answer_text}</p>
                <div data-profile-actions>
                  <button
                    type="button"
                    onClick={(): void => {
                      profile.openEdit(p_item);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    data-kind="danger"
                    onClick={(): void => {
                      profile.openDelete(p_item);
                    }}
                  >
                    Apagar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div
        data-profile-backdrop
        data-open={profile.editingQuestionId !== null ? "true" : "false"}
        role="presentation"
        aria-hidden={profile.editingQuestionId === null}
        inert={profile.editingQuestionId === null}
      >
        <form
          data-profile-sheet
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-answer-title"
          onSubmit={(p_event: FormEvent<HTMLFormElement>): void => {
            p_event.preventDefault();
            void profile.saveEdit();
          }}
        >
          <h2 id="edit-answer-title">Editar resposta</h2>
          <label>
            Resposta
            <textarea
              value={profile.editDraft}
              onChange={(p_event: ChangeEvent<HTMLTextAreaElement>): void => {
                profile.setEditDraft(p_event.currentTarget.value);
              }}
            />
          </label>
          {profile.formError !== null && profile.editingQuestionId !== null ? (
            <p data-profile-error role="alert">
              {profile.formError}
            </p>
          ) : null}
          <button type="submit" disabled={profile.isSaving}>
            Guardar
          </button>
          <button
            type="button"
            data-kind="ghost"
            onClick={(): void => {
              profile.closeModal();
            }}
          >
            Cancelar
          </button>
        </form>
      </div>
      <div
        data-profile-backdrop
        data-open={profile.deletingQuestionId !== null ? "true" : "false"}
        role="presentation"
        aria-hidden={profile.deletingQuestionId === null}
        inert={profile.deletingQuestionId === null}
      >
        <div
          data-profile-sheet
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-answer-title"
        >
          <h2 id="delete-answer-title">Apagar este fato?</h2>
          <p>A pergunta do banco permanece. Só a resposta da família some do GPS.</p>
          {profile.formError !== null && profile.deletingQuestionId !== null ? (
            <p data-profile-error role="alert">
              {profile.formError}
            </p>
          ) : null}
          <button
            type="button"
            data-kind="danger"
            disabled={profile.isSaving}
            onClick={(): void => {
              void profile.confirmDelete();
            }}
          >
            Apagar
          </button>
          <button
            type="button"
            data-kind="ghost"
            onClick={(): void => {
              profile.closeModal();
            }}
          >
            Cancelar
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
