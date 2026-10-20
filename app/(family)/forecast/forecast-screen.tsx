"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import { FamilyNav } from "../chrome/family-nav";
import { SuggestionLeaf } from "../calendar/day-composite";
import { useFamilySession } from "../context-switch/family-session-context";
import {
  ForecastSessionProvider,
  useForecastSession,
} from "./forecast-session-context";
import type { WeekSuggestionItem } from "./week-suggestion";

const SCREEN_STYLES: string = `
[data-forecast-screen] {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
[data-forecast-scroll] {
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
[data-forecast-scroll]::-webkit-scrollbar { width: 4px; }
[data-forecast-scroll]::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-ink) 22%, transparent);
  border-radius: 999px;
}
[data-forecast-screen] h1 { margin: 0; font-size: 1.35rem; line-height: 1.25; }
[data-forecast-screen] h2 { margin: 0; font-size: 1.05rem; }
[data-forecast-screen] p { margin: 0; color: var(--color-muted); line-height: 1.45; }
[data-forecast-badge] {
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
[data-forecast-badge][data-role="Child"] {
  background: color-mix(in srgb, var(--color-child) 14%, var(--color-paper));
  color: var(--color-child);
}
[data-forecast-enter] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: forecast-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes forecast-enter {
  from { opacity: 0; transform: translate3d(0, 8px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
[data-forecast-loading-bar] {
  height: 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  transform-origin: left center;
  animation: forecast-load 900ms ease-in-out infinite;
}
@keyframes forecast-load {
  0% { opacity: 0.45; transform: scaleX(0.55); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.45; transform: scaleX(0.55); }
}
[data-forecast-card],
[data-forecast-tools] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--color-tertiary) 22%, var(--color-paper));
}
[data-forecast-screen] label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--color-muted);
  font-size: 0.85rem;
}
[data-forecast-screen] input {
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
[data-forecast-screen] input:focus,
[data-forecast-screen] button:focus { outline: 2px solid var(--color-ink); outline-offset: 2px; }
[data-forecast-screen] input:focus:not(:focus-visible),
[data-forecast-screen] button:focus:not(:focus-visible) { outline: none; }
[data-forecast-screen] input:focus-visible,
[data-forecast-screen] button:focus-visible { outline: 2px solid var(--color-ink); outline-offset: 2px; }
[data-forecast-actions] { display: flex; flex-direction: column; gap: 8px; }
[data-forecast-screen] button {
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
[data-forecast-screen] button[data-kind="ghost"] {
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  color: var(--color-ink);
}
[data-forecast-screen] button[data-kind="secondary"] {
  background: var(--color-secondary);
  color: var(--color-paper);
}
[data-forecast-screen] button:active { opacity: 0.88; }
[data-forecast-screen] button:disabled { opacity: 0.55; cursor: not-allowed; }
[data-forecast-error] { color: var(--color-danger); font-weight: 600; }
[data-forecast-empty] { font-weight: 600; }
[data-forecast-status] {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-secondary);
}
[data-forecast-backdrop] {
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
[data-forecast-backdrop][data-open="true"] {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-forecast-sheet] {
  width: 100%;
  padding: 20px 16px 16px;
  border-radius: 20px 20px 16px 16px;
  background: var(--color-paper);
  opacity: 0;
  transform: translate3d(0, 8px, 0);
  transition: transform 160ms ease-in, opacity 160ms ease-in;
}
[data-forecast-backdrop][data-open="true"] [data-forecast-sheet] {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-forecast-sheet] h2 { margin-bottom: 8px; }
[data-forecast-sheet] button { width: 100%; margin-top: 12px; }
@media (hover: hover) and (pointer: fine) {
  [data-forecast-screen] button:hover:not(:disabled) { opacity: 0.92; }
}
@media (prefers-reduced-motion: reduce) {
  [data-forecast-screen] *,
  [data-forecast-screen] *::before,
  [data-forecast-screen] *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

function ForecastScreenBody(): ReactElement {
  const forecast: ReturnType<typeof useForecastSession> = useForecastSession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const role: string = session.snapshot?.role ?? "none";
  const presentation = forecast.presentation;
  const isModalOpen: boolean = forecast.proposal !== null;

  const onApply = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    forecast.applyId();
  };

  return (
    <div data-forecast-screen>
      <style href="forecast-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-forecast-scroll inert={isModalOpen}>
        <FamilyNav familyId={forecast.familyId} active="forecast" />
        <span data-forecast-badge data-role={role}>
          Visão {role === "none" ? "sessão" : role}
        </span>
        <form data-forecast-tools onSubmit={onApply}>
          <label>
            Id da família
            <input
              type="text"
              name="family-id"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={forecast.idDraft}
              onChange={(p_event: ChangeEvent<HTMLInputElement>): void => {
                forecast.setIdDraft(p_event.currentTarget.value);
              }}
            />
          </label>
          <label>
            Dia
            <input
              type="date"
              name="day"
              value={forecast.day}
              onChange={(p_event: ChangeEvent<HTMLInputElement>): void => {
                forecast.setDay(p_event.currentTarget.value);
              }}
            />
          </label>
          <button type="submit">Abrir previsão</button>
        </form>
        {presentation.kind === "loading" || session.isLoading ? (
          <div data-forecast-enter aria-live="polite" aria-busy="true">
            <h1>Carregando a previsão</h1>
            <div data-forecast-loading-bar />
          </div>
        ) : null}
        {presentation.kind === "need-family" && !session.isLoading ? (
          <div data-forecast-enter>
            <h1>Previsão da semana</h1>
            <p>Informe o id da família para ver as sugestões.</p>
          </div>
        ) : null}
        {presentation.kind === "denied" ? (
          <div data-forecast-enter role="alert">
            <h1>Previsão só para Parent</h1>
            <p>A visão Child não coloca sugestões no calendário.</p>
          </div>
        ) : null}
        {presentation.kind === "missing" ? (
          <div data-forecast-enter>
            <h1>Família não encontrada</h1>
            <p>Esse id não abre a previsão.</p>
          </div>
        ) : null}
        {presentation.kind === "error" ? (
          <div data-forecast-enter role="alert">
            <h1>Previsão da semana</h1>
            <p>{presentation.message}</p>
          </div>
        ) : null}
        {presentation.kind === "ready" ? (
          <div data-forecast-enter>
            <h1>Previsão da semana</h1>
            <p>Lista finita. Só missões publicadas. Sem dia, não cai no calendário.</p>
            {presentation.suggestions.length === 0 ? (
              <div data-forecast-card data-forecast-empty-state="true">
                <p data-forecast-empty>Nenhuma sugestão publicada.</p>
              </div>
            ) : null}
            {presentation.suggestions.map((p_item: WeekSuggestionItem) => (
              <div data-forecast-card key={p_item.mission_id}>
                <h2>{p_item.title}</h2>
                <div data-forecast-actions>
                  <button
                    type="button"
                    disabled={forecast.isSaving || forecast.day.trim().length === 0}
                    onClick={(): void => {
                      void forecast.drop(p_item.mission_id);
                    }}
                  >
                    Colocar neste dia
                  </button>
                </div>
              </div>
            ))}
            <div data-forecast-card>
              <h2>Neste dia</h2>
              <p>
                {presentation.day.p_day} · {presentation.day.statusLabel()}
              </p>
              {presentation.day.getChildren().length === 0 ? (
                <p>Nenhuma sugestão neste dia.</p>
              ) : null}
              {presentation.day.getChildren().map((p_child, p_index) => {
                if (!(p_child instanceof SuggestionLeaf)) {
                  return null;
                }
                return (
                  <div
                    data-forecast-card
                    key={`${p_child.p_item.id}-${String(p_index)}`}
                  >
                    <p data-forecast-status>{p_child.statusLabel()}</p>
                    <p>{p_child.p_item.mission_id}</p>
                    {p_child.p_item.status === "scheduled" ? (
                      <div data-forecast-actions>
                        <button
                          type="button"
                          data-kind="secondary"
                          disabled={forecast.isSaving}
                          onClick={(): void => {
                            void forecast.markDone(p_child.p_item);
                          }}
                        >
                          Marcar feita
                        </button>
                        <label>
                          Mover para o dia
                          <input
                            type="date"
                            name="target-day"
                            value={forecast.targetDay}
                            onChange={(p_event: ChangeEvent<HTMLInputElement>): void => {
                              forecast.setTargetDay(p_event.currentTarget.value);
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          data-kind="ghost"
                          disabled={forecast.isSaving}
                          onClick={(): void => {
                            void forecast.moveDay(p_child.p_item);
                          }}
                        >
                          Mover
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            {forecast.formError !== null ? (
              <p data-forecast-error role="alert">
                {forecast.formError}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      <div
        data-forecast-backdrop
        data-open={isModalOpen ? "true" : "false"}
        role="presentation"
        aria-hidden={!isModalOpen}
        inert={!isModalOpen}
      >
        <div
          data-forecast-sheet
          role="dialog"
          aria-modal="true"
          aria-labelledby="rhythm-proposal-title"
        >
          <h2 id="rhythm-proposal-title">Transformar em ritmo?</h2>
          <p>
            Esta missão se repetiu. Aceitar grava o ritmo. Dispensar não escreve
            nada.
          </p>
          {forecast.proposal !== null ? (
            <p>{forecast.proposal.weekday}</p>
          ) : null}
          {forecast.formError !== null && isModalOpen ? (
            <p data-forecast-error role="alert">
              {forecast.formError}
            </p>
          ) : null}
          <button
            type="button"
            disabled={forecast.isSaving}
            onClick={(): void => {
              void forecast.acceptProposal();
            }}
          >
            Aceitar ritmo
          </button>
          <button
            type="button"
            data-kind="ghost"
            disabled={forecast.isSaving}
            onClick={(): void => {
              void forecast.dismissProposal();
            }}
          >
            Dispensar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ForecastScreen(): ReactElement {
  return (
    <ForecastSessionProvider>
      <ForecastScreenBody />
    </ForecastSessionProvider>
  );
}
