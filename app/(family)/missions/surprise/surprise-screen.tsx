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
import { MascotRevealedCopy } from "../mascot/mascot-revealed-copy";
import {
  SurpriseSessionProvider,
  useSurpriseSession,
} from "./surprise-session-context";

const SCREEN_STYLES: string = `
[data-surprise-screen] {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
[data-surprise-scroll] {
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
[data-surprise-scroll]::-webkit-scrollbar { width: 4px; }
[data-surprise-scroll]::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-ink) 22%, transparent);
  border-radius: 999px;
}
[data-surprise-screen] h1 { margin: 0; font-size: 1.35rem; line-height: 1.25; }
[data-surprise-screen] p { margin: 0; color: var(--color-muted); line-height: 1.45; }
[data-surprise-badge] {
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
[data-surprise-badge][data-role="Child"] {
  background: color-mix(in srgb, var(--color-child) 14%, var(--color-paper));
  color: var(--color-child);
}
[data-surprise-enter] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: surprise-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes surprise-enter {
  from { opacity: 0; transform: translate3d(0, 8px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
[data-surprise-loading-bar] {
  height: 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  transform-origin: left center;
  animation: surprise-load 900ms ease-in-out infinite;
}
@keyframes surprise-load {
  0% { opacity: 0.45; transform: scaleX(0.55); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.45; transform: scaleX(0.55); }
}
[data-surprise-card],
[data-surprise-tools] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--color-tertiary) 22%, var(--color-paper));
}
[data-surprise-screen] label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--color-muted);
  font-size: 0.85rem;
}
[data-surprise-screen] input {
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
[data-surprise-screen] input:focus,
[data-surprise-screen] button:focus,
[data-surprise-screen] a[data-surprise-cycle]:focus { outline: 2px solid var(--color-ink); outline-offset: 2px; }
[data-surprise-screen] input:focus:not(:focus-visible),
[data-surprise-screen] button:focus:not(:focus-visible),
[data-surprise-screen] a[data-surprise-cycle]:focus:not(:focus-visible) { outline: none; }
[data-surprise-screen] input:focus-visible,
[data-surprise-screen] button:focus-visible,
[data-surprise-screen] a[data-surprise-cycle]:focus-visible { outline: 2px solid var(--color-ink); outline-offset: 2px; }
[data-surprise-screen] button {
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
[data-surprise-screen] button[data-kind="ghost"] {
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  color: var(--color-ink);
}
[data-surprise-screen] a[data-surprise-cycle] {
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
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
[data-surprise-screen] button:active,
[data-surprise-screen] a[data-surprise-cycle]:active { opacity: 0.88; }
[data-surprise-screen] button:disabled { opacity: 0.55; cursor: not-allowed; }
[data-surprise-empty] { font-weight: 600; }
[data-mascot-thread] {
  display: flex;
  flex-direction: column;
  gap: 8px;
  contain: layout;
  opacity: 1;
  transform: translate3d(0, 0, 0);
  animation: surprise-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
[data-mascot-sender] {
  display: flex;
  align-items: center;
  gap: 10px;
}
[data-mascot-avatar] {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-primary) 58%, var(--color-tertiary));
  box-shadow: inset 0 -8px 0 color-mix(in srgb, var(--color-primary) 72%, #2c2a28);
}
[data-mascot-voice] {
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-mascot-message] {
  display: flex;
  flex-direction: column;
  gap: 8px;
  contain: layout;
  padding: 14px 16px;
  border-radius: 18px 18px 18px 6px;
  background: color-mix(in srgb, var(--color-tertiary) 28%, var(--color-paper));
  color: var(--color-ink);
}
[data-mascot-title],
[data-mascot-body] {
  display: grid;
  margin: 0;
  color: var(--color-ink);
  line-height: 1.45;
}
[data-mascot-sizer],
[data-mascot-typed] { grid-area: 1 / 1; }
[data-mascot-sizer] {
  visibility: hidden;
  pointer-events: none;
  -webkit-user-select: none;
  user-select: none;
}
[data-mascot-title] { font-size: 1.05rem; font-weight: 700; }
[data-mascot-empty-copy] { color: var(--color-muted); font-weight: 600; }
[data-mascot-cursor] {
  display: inline-block;
  width: 0.45em;
  height: 1em;
  margin-left: 2px;
  vertical-align: -0.12em;
  background: var(--color-ink);
  opacity: 1;
  transform: translateZ(0);
  animation: surprise-caret 900ms ease-in-out infinite;
}
@keyframes surprise-caret {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@media (hover: hover) and (pointer: fine) {
  [data-surprise-screen] button:hover:not(:disabled),
  [data-surprise-screen] a[data-surprise-cycle]:hover { opacity: 0.92; }
}
@media (prefers-reduced-motion: reduce) {
  [data-surprise-screen] *,
  [data-surprise-screen] *::before,
  [data-surprise-screen] *::after {
    animation: none !important;
    transition: none !important;
  }
  [data-mascot-cursor] { display: none; opacity: 0; }
}
`;

function SurpriseScreenBody(): ReactElement {
  const surprise: ReturnType<typeof useSurpriseSession> = useSurpriseSession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const role: string = session.snapshot?.role ?? "none";
  const presentation = surprise.presentation;
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const media: MediaQueryList = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const syncMotion = (): void => {
      setPrefersReduced(media.matches);
    };
    syncMotion();
    setIsReady(true);
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", syncMotion);
      return (): void => {
        media.removeEventListener("change", syncMotion);
      };
    }
    media.addListener(syncMotion);
    return (): void => {
      media.removeListener(syncMotion);
    };
  }, []);

  const onApply = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    surprise.applyId();
  };

  return (
    <div
      data-surprise-screen
      data-surprise-empty={presentation.kind === "empty" ? "true" : undefined}
      data-reveal={
        presentation.kind === "hit"
          ? prefersReduced
            ? "instant"
            : "typewriter"
          : presentation.kind === "empty"
            ? "empty"
            : undefined
      }
    >
      <style href="surprise-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-surprise-scroll>
        <FamilyNav familyId={surprise.familyId} active="surprise" />
        <span data-surprise-badge data-role={role}>
          Visão {role === "none" ? "sessão" : role}
        </span>
        <form data-surprise-tools onSubmit={onApply}>
          <label>
            Id da família
            <input
              type="text"
              name="family-id"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={surprise.idDraft}
              onChange={(p_event: ChangeEvent<HTMLInputElement>): void => {
                surprise.setIdDraft(p_event.currentTarget.value);
              }}
            />
          </label>
          <button type="submit" data-kind="ghost">
            Abrir família
          </button>
          <button
            type="button"
            disabled={surprise.isSaving || surprise.familyId.length === 0}
            onClick={(): void => {
              void surprise.draw();
            }}
          >
            Missão surpresa
          </button>
        </form>
        {presentation.kind === "loading" || session.isLoading ? (
          <div data-surprise-enter aria-live="polite" aria-busy="true">
            <h1>Carregando a surpresa</h1>
            <div data-surprise-loading-bar />
          </div>
        ) : null}
        {presentation.kind === "need-family" && !session.isLoading ? (
          <div data-surprise-enter>
            <h1>Missão surpresa</h1>
            <p>Informe o id da família para um clique.</p>
          </div>
        ) : null}
        {presentation.kind === "idle" && !session.isLoading ? (
          <div data-surprise-enter>
            <h1>Missão surpresa</h1>
            <p>Um clique escolhe uma missão publicada. Sem catálogo, o vazio é explícito.</p>
          </div>
        ) : null}
        {presentation.kind === "denied" ? (
          <div data-surprise-enter role="alert">
            <h1>Surpresa só para Parent</h1>
            <p>A visão Child não abre missão surpresa.</p>
          </div>
        ) : null}
        {presentation.kind === "missing" ? (
          <div data-surprise-enter>
            <h1>Família não encontrada</h1>
            <p>Esse id não abre a surpresa.</p>
          </div>
        ) : null}
        {presentation.kind === "error" ? (
          <div data-surprise-enter role="alert">
            <h1>Missão surpresa</h1>
            <p>{presentation.message}</p>
          </div>
        ) : null}
        {presentation.kind === "empty" ? (
          <div data-surprise-enter data-surprise-empty-state="true">
            <div data-surprise-card>
              <h1 data-surprise-empty>Nenhuma missão publicada.</h1>
            </div>
          </div>
        ) : null}
        {isReady && presentation.kind === "hit" ? (
          <>
            <MascotRevealedCopy
              title={presentation.title}
              description={presentation.description}
              prefersReduced={prefersReduced}
            />
            <Link
              href={`/missions/cycle?id=${encodeURIComponent(surprise.familyId)}&cycle=${encodeURIComponent(presentation.cycleId)}&title=${encodeURIComponent(presentation.title)}`}
              data-surprise-cycle
            >
              Fazer agora
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function SurpriseScreen(): ReactElement {
  return (
    <SurpriseSessionProvider>
      <SurpriseScreenBody />
    </SurpriseSessionProvider>
  );
}
