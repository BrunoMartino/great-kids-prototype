"use client";

import type { ReactElement } from "react";
import {
  useIndicatorsSession,
  type SwitchableRole,
} from "./indicators-session-context";
import type { PanelMockRole } from "./indicators-facade";

const SCREEN_STYLES: string = `
[data-panel-indicators] {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 1120px;
  min-width: 0;
}
[data-panel-indicators] h1 {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.25;
}
[data-panel-indicators] h2 {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-muted);
}
[data-panel-indicators] p {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.45;
}
[data-panel-role] {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #efdfd8;
  background: color-mix(in srgb, var(--color-primary) 14%, var(--color-paper));
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-panel-toolbar] {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
[data-panel-toolbar-label] {
  color: var(--color-muted);
  font-size: 0.75rem;
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
  animation: panel-enter 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
[data-panel-loading-bar] {
  height: 12px;
  border-radius: 999px;
  background: #eae3de;
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  transform-origin: left center;
  transform: translateZ(0);
  animation: panel-load 900ms ease-in-out infinite;
}
[data-panel-indicators] button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  min-width: 36px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: var(--color-paper);
  color: var(--color-ink);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: transform 120ms ease-out, opacity 120ms ease-out;
}
[data-panel-indicators] button[data-pressed="true"] {
  background: #efdfd8;
  background: color-mix(in srgb, var(--color-primary) 14%, var(--color-paper));
  color: var(--color-primary);
}
[data-panel-indicators] button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
[data-panel-indicators] button:active:not(:disabled) {
  transform: translateY(0);
}
[data-panel-indicators] button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
[data-panel-indicators] button:focus:not(:focus-visible) {
  outline: none;
}
[data-panel-indicators] button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
[data-indicator-grid] {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  min-width: 0;
}
[data-indicator-card] {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding: 20px 16px;
  border-radius: 16px;
  background: var(--color-paper);
  box-shadow: 0 1px 0 rgba(44, 42, 40, 0.08);
  box-shadow: 0 1px 0 color-mix(in srgb, var(--color-ink) 8%, transparent);
  animation: panel-row-enter 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
[data-indicator-value] {
  margin: 0;
  color: var(--color-ink);
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
[data-panel-empty] {
  padding: 8px 0 0;
  color: var(--color-muted);
}
@keyframes panel-enter {
  from { opacity: 0; transform: translate3d(0, 4px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes panel-row-enter {
  from { opacity: 0; transform: translate3d(0, 4px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes panel-load {
  0% { opacity: 0.45; transform: scaleX(0.55); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.45; transform: scaleX(0.55); }
}
@media (min-width: 768px) {
  [data-indicator-grid] {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (hover: hover) and (pointer: fine) {
  [data-panel-indicators] button:hover:not(:disabled) {
    background: #efe4d6;
    background: color-mix(in srgb, var(--color-tertiary) 36%, var(--color-paper));
    transform: translateY(-1px);
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-panel-loading],
  [data-panel-forbidden],
  [data-panel-error],
  [data-panel-success],
  [data-indicator-card],
  [data-panel-loading-bar],
  [data-panel-indicators] button {
    animation: none !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition: none !important;
    opacity: 1;
    transform: none;
  }
}
`;

function roleLabel(p_role: PanelMockRole | SwitchableRole): string {
  if (p_role === "Admin") {
    return "Admin";
  }
  if (p_role === "Operator") {
    return "Operador";
  }
  if (p_role === "Child") {
    return "Criança";
  }
  return "Responsável";
}

export function IndicatorsScreen(): ReactElement {
  const session: ReturnType<typeof useIndicatorsSession> = useIndicatorsSession();
  const allZero: boolean =
    session.counts !== null &&
    session.counts.scheduled === 0 &&
    session.counts.completed === 0 &&
    session.counts.repeated === 0;

  const onSwitchRole = (p_role: SwitchableRole): void => {
    void session.switchRole(p_role);
  };

  return (
    <div data-panel-indicators>
      <style href="panel-indicators" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-panel-toolbar>
        <span data-panel-role data-role={session.activeRole}>
          {roleLabel(session.activeRole)}
        </span>
        <span data-panel-toolbar-label>Sessão</span>
        <button
          type="button"
          data-pressed={session.activeRole === "Admin" ? "true" : "false"}
          aria-pressed={session.activeRole === "Admin"}
          onClick={(): void => {
            onSwitchRole("Admin");
          }}
        >
          Admin
        </button>
        <button
          type="button"
          data-pressed={session.activeRole === "Operator" ? "true" : "false"}
          aria-pressed={session.activeRole === "Operator"}
          onClick={(): void => {
            onSwitchRole("Operator");
          }}
        >
          Operador
        </button>
        <button
          type="button"
          data-pressed={session.activeRole === "Parent" ? "true" : "false"}
          aria-pressed={session.activeRole === "Parent"}
          onClick={(): void => {
            onSwitchRole("Parent");
          }}
        >
          Responsável
        </button>
      </div>
      {session.isLoading ? (
        <div data-panel-loading aria-live="polite" aria-busy="true">
          <span data-panel-role>Indicadores</span>
          <h1>Carregando os indicadores</h1>
          <div data-panel-loading-bar />
        </div>
      ) : null}
      {!session.isLoading && session.isForbidden ? (
        <div data-panel-forbidden role="alert">
          <span data-panel-role>Indicadores</span>
          <h1>Acesso negado</h1>
          <p>Este painel é só para a equipe.</p>
        </div>
      ) : null}
      {!session.isLoading &&
      !session.isForbidden &&
      session.errorMessage !== null ? (
        <div data-panel-error role="alert">
          <span data-panel-role>Indicadores</span>
          <h1>Não foi possível carregar os indicadores</h1>
          <p>{session.errorMessage}</p>
        </div>
      ) : null}
      {!session.isLoading &&
      !session.isForbidden &&
      session.errorMessage === null &&
      session.role !== null &&
      session.counts !== null ? (
        <div
          data-panel-success
          data-indicators-id={session.counts.id}
          data-indicators-empty={allZero ? "true" : "false"}
        >
          <span data-panel-role data-role={session.role}>
            {roleLabel(session.role)}
          </span>
          <h1>Indicadores</h1>
          <p>O que as famílias agendaram, concluíram e repetiram.</p>
          <div data-indicator-grid>
            <article data-indicator-card data-indicator="scheduled">
              <h2>Agendadas</h2>
              <p data-indicator-value>{session.counts.scheduled}</p>
            </article>
            <article data-indicator-card data-indicator="completed">
              <h2>Concluídas</h2>
              <p data-indicator-value>{session.counts.completed}</p>
            </article>
            <article data-indicator-card data-indicator="repeated">
              <h2>Repetidas</h2>
              <p data-indicator-value>{session.counts.repeated}</p>
            </article>
          </div>
          {allZero ? (
            <p data-panel-empty>
              Nenhuma atividade ainda. Os três números ficam em zero.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
