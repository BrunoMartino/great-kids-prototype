"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import Link from "next/link";
import { FamilyNav } from "../../chrome/family-nav";
import { useFamilySession } from "../../context-switch/family-session-context";
import { CycleSessionProvider, useCycleSession } from "./cycle-session-context";
import type { CycleOfferedCommand } from "./cycle-ui-state";

const SCREEN_STYLES: string = `
[data-cycle-screen] {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
[data-cycle-scroll] {
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
[data-cycle-scroll]::-webkit-scrollbar { width: 4px; }
[data-cycle-scroll]::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-ink) 22%, transparent);
  border-radius: 999px;
}
[data-cycle-screen] h1 { margin: 0; font-size: 1.35rem; line-height: 1.25; }
[data-cycle-screen] h2 { margin: 0; font-size: 1.05rem; }
[data-cycle-screen] p { margin: 0; color: var(--color-muted); line-height: 1.45; }
[data-cycle-badge] {
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
[data-cycle-badge][data-role="Child"] {
  background: color-mix(in srgb, var(--color-child) 14%, var(--color-paper));
  color: var(--color-child);
}
[data-cycle-status] {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-secondary) 16%, var(--color-paper));
  color: var(--color-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-cycle-enter] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: cycle-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes cycle-enter {
  from { opacity: 0; transform: translate3d(0, 8px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
[data-cycle-loading-bar] {
  height: 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  transform-origin: left center;
  animation: cycle-load 900ms ease-in-out infinite;
}
@keyframes cycle-load {
  0% { opacity: 0.45; transform: scaleX(0.55); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.45; transform: scaleX(0.55); }
}
[data-cycle-card],
[data-cycle-tools] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--color-tertiary) 22%, var(--color-paper));
}
[data-cycle-screen] label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--color-muted);
  font-size: 0.85rem;
}
[data-cycle-screen] input {
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
[data-cycle-screen] input:focus,
[data-cycle-screen] button:focus,
[data-cycle-screen] a:focus { outline: 2px solid var(--color-ink); outline-offset: 2px; }
[data-cycle-screen] input:focus:not(:focus-visible),
[data-cycle-screen] button:focus:not(:focus-visible),
[data-cycle-screen] a:focus:not(:focus-visible) { outline: none; }
[data-cycle-screen] input:focus-visible,
[data-cycle-screen] button:focus-visible,
[data-cycle-screen] a:focus-visible { outline: 2px solid var(--color-ink); outline-offset: 2px; }
[data-cycle-actions] { display: flex; flex-direction: column; gap: 8px; }
[data-cycle-screen] button,
[data-cycle-screen] a[data-cycle-link] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  margin: 0;
  padding: 0 16px;
  border: 0;
  border-radius: 14px;
  background: var(--color-primary);
  color: var(--color-paper);
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
[data-cycle-screen] button[data-kind="ghost"],
[data-cycle-screen] a[data-kind="ghost"] {
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  color: var(--color-ink);
}
[data-cycle-screen] button[data-kind="choice"] {
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  color: var(--color-ink);
}
[data-cycle-screen] button[data-kind="choice"][data-on="true"] {
  background: var(--color-secondary);
  color: var(--color-paper);
}
[data-cycle-screen] button:active,
[data-cycle-screen] a[data-cycle-link]:active { opacity: 0.88; }
[data-cycle-screen] button:disabled { opacity: 0.55; cursor: not-allowed; }
[data-cycle-error] { color: var(--color-danger); font-weight: 600; }
[data-cycle-pair] { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
[data-cycle-backdrop] {
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
[data-cycle-backdrop][data-open="true"] {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-cycle-sheet] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding: 20px 16px 16px;
  border-radius: 20px 20px 16px 16px;
  background: var(--color-paper);
  opacity: 0;
  transform: translate3d(0, 8px, 0);
  transition: transform 160ms ease-in, opacity 160ms ease-in;
}
[data-cycle-backdrop][data-open="true"] [data-cycle-sheet] {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-cycle-sheet] button { width: 100%; }
[data-cycle-pair] button { width: auto; }
@media (hover: hover) and (pointer: fine) {
  [data-cycle-screen] button:hover:not(:disabled),
  [data-cycle-screen] a[data-cycle-link]:hover { opacity: 0.92; }
}
@media (prefers-reduced-motion: reduce) {
  [data-cycle-screen] *,
  [data-cycle-screen] *::before,
  [data-cycle-screen] *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

function commandLabel(p_command: CycleOfferedCommand): string {
  if (p_command === "start") {
    return "Começar";
  }
  return "Concluir";
}

function CycleScreenBody(): ReactElement {
  const cycle: ReturnType<typeof useCycleSession> = useCycleSession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const role: string = session.snapshot?.role ?? "none";
  const presentation = cycle.presentation;
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const onApply = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    cycle.applyIds();
  };

  const historyHref: string =
    cycle.familyId.length === 0
      ? "/missions/completed"
      : `/missions/completed?id=${encodeURIComponent(cycle.familyId)}`;

  return (
    <div data-cycle-screen>
      <style href="cycle-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-cycle-scroll inert={cycle.isClosingOpen}>
        <FamilyNav familyId={cycle.familyId} active="cycle" />
        <span data-cycle-badge data-role={role}>
          Visão {role === "none" ? "sessão" : role}
        </span>
        <form data-cycle-tools onSubmit={onApply}>
          <label>
            Id da família
            <input
              type="text"
              name="family-id"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={cycle.idDraft}
              onChange={(p_event: ChangeEvent<HTMLInputElement>): void => {
                cycle.setIdDraft(p_event.currentTarget.value);
              }}
            />
          </label>
          <label>
            Id da missão aceita
            <input
              type="text"
              name="cycle-id"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={cycle.cycleDraft}
              onChange={(p_event: ChangeEvent<HTMLInputElement>): void => {
                cycle.setCycleDraft(p_event.currentTarget.value);
              }}
            />
          </label>
          <button type="submit" data-kind="ghost">
            Abrir ciclo
          </button>
        </form>
        {presentation.kind === "loading" || session.isLoading ? (
          <div data-cycle-enter aria-live="polite" aria-busy="true">
            <h1>Carregando o ciclo</h1>
            <div data-cycle-loading-bar />
          </div>
        ) : null}
        {presentation.kind === "need-family" && !session.isLoading ? (
          <div data-cycle-enter>
            <h1>Ciclo da missão</h1>
            <p>Informe o id da família. A surpresa entrega o id aceito.</p>
          </div>
        ) : null}
        {presentation.kind === "need-cycle" && !session.isLoading ? (
          <div data-cycle-enter>
            <h1>Ciclo da missão</h1>
            <p>Aceite uma surpresa para começar. Transições ilegais não aparecem.</p>
          </div>
        ) : null}
        {presentation.kind === "denied" ? (
          <div data-cycle-enter role="alert">
            <h1>Ciclo só para Parent</h1>
            <p>A visão Child não avança nem conclui a missão.</p>
          </div>
        ) : null}
        {presentation.kind === "missing" ? (
          <div data-cycle-enter>
            <h1>Missão não encontrada</h1>
            <p>Esse id não abre o ciclo.</p>
          </div>
        ) : null}
        {presentation.kind === "error" ? (
          <div data-cycle-enter role="alert">
            <h1>Ciclo da missão</h1>
            <p>{presentation.message}</p>
          </div>
        ) : null}
        {isReady && presentation.kind === "ready" && !session.isLoading ? (
          <div data-cycle-enter data-cycle-card data-status={presentation.status}>
            <span data-cycle-status>{presentation.status}</span>
            <h1>
              {presentation.title.length > 0 ? presentation.title : "Missão da família"}
            </h1>
            {presentation.status === "Accepted" ? (
              <p>A família aceitou. Só dá para começar — concluir agora não é oferecido.</p>
            ) : null}
            {presentation.status === "Doing" ? (
              <p>Estão a fazer. A pergunta de fechamento só abre ao concluir.</p>
            ) : null}
            {presentation.status === "Completed" && presentation.closing !== null ? (
              <p>
                Fechamento: {presentation.closing.do_again ? "fariam de novo" : "não repetir"}
                {"; "}
                {presentation.closing.save_memory ? "guardar na memória" : "não guardar"}.
              </p>
            ) : null}
            {cycle.formError !== null ? (
              <p data-cycle-error role="alert">
                {cycle.formError}
              </p>
            ) : null}
            <div data-cycle-actions>
              {presentation.offered.map((p_command: CycleOfferedCommand) => (
                <button
                  key={p_command}
                  type="button"
                  data-cycle-command={p_command}
                  disabled={cycle.isSaving}
                  onClick={(): void => {
                    if (p_command === "start") {
                      void cycle.startDoing();
                      return;
                    }
                    cycle.openClosing();
                  }}
                >
                  {commandLabel(p_command)}
                </button>
              ))}
              {presentation.status === "Completed" ? (
                <Link href={historyHref} data-cycle-link data-kind="ghost">
                  Ver completas
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      <div
        data-cycle-backdrop
        data-open={cycle.isClosingOpen ? "true" : "false"}
        role="presentation"
        aria-hidden={!cycle.isClosingOpen}
        inert={!cycle.isClosingOpen}
      >
        <form
          data-cycle-sheet
          role="dialog"
          aria-modal="true"
          aria-labelledby="closing-title"
          onSubmit={(p_event: FormEvent<HTMLFormElement>): void => {
            p_event.preventDefault();
            void cycle.completeMission();
          }}
        >
          <h2 id="closing-title">Fechar a missão</h2>
          <p>As duas respostas vão com o Completed, na mesma transação.</p>
          <p>Fariam de novo?</p>
          <div data-cycle-pair>
            <button
              type="button"
              data-kind="choice"
              data-on={cycle.doAgain === true ? "true" : "false"}
              onClick={(): void => {
                cycle.setDoAgain(true);
              }}
            >
              Sim
            </button>
            <button
              type="button"
              data-kind="choice"
              data-on={cycle.doAgain === false ? "true" : "false"}
              onClick={(): void => {
                cycle.setDoAgain(false);
              }}
            >
              Não
            </button>
          </div>
          <p>Vale guardar na memória?</p>
          <div data-cycle-pair>
            <button
              type="button"
              data-kind="choice"
              data-on={cycle.saveMemory === true ? "true" : "false"}
              onClick={(): void => {
                cycle.setSaveMemory(true);
              }}
            >
              Sim
            </button>
            <button
              type="button"
              data-kind="choice"
              data-on={cycle.saveMemory === false ? "true" : "false"}
              onClick={(): void => {
                cycle.setSaveMemory(false);
              }}
            >
              Não
            </button>
          </div>
          {cycle.formError !== null && cycle.isClosingOpen ? (
            <p data-cycle-error role="alert">
              {cycle.formError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={cycle.isSaving || cycle.doAgain === null || cycle.saveMemory === null}
          >
            Concluir
          </button>
          <button
            type="button"
            data-kind="ghost"
            onClick={(): void => {
              cycle.closeClosing();
            }}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}

export function CycleScreen(): ReactElement {
  return (
    <CycleSessionProvider>
      <CycleScreenBody />
    </CycleSessionProvider>
  );
}
