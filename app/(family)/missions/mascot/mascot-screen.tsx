"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import { MascotRevealedCopy } from "./mascot-revealed-copy";
import {
  MascotMissionProvider,
  useMascotMission,
  type MascotPresentation,
} from "./mascot-mission-context";

const SCREEN_STYLES: string = `
[data-mascot-screen] {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
[data-mascot-scroll] {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 16px;
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
[data-mascot-scroll]::-webkit-scrollbar {
  width: 4px;
}
[data-mascot-scroll]::-webkit-scrollbar-thumb {
  background: #c4b8ac;
  background: color-mix(in srgb, var(--color-ink) 22%, transparent);
  border-radius: 999px;
}
[data-mascot-screen] h1 {
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.25;
}
[data-mascot-screen] p {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.45;
}
[data-mascot-thread] {
  display: flex;
  flex-direction: column;
  gap: 8px;
  contain: layout;
  opacity: 1;
  transform: translate3d(0, 0, 0);
  animation: mascot-enter 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes mascot-enter {
  from {
    opacity: 0;
    transform: translate3d(0, 8px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
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
  background: #c48a78;
  background: color-mix(in srgb, var(--color-primary) 58%, var(--color-tertiary));
  box-shadow: inset 0 -8px 0 #a86d5e;
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
  background: #f7eee4;
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
[data-mascot-typed] {
  grid-area: 1 / 1;
}
[data-mascot-sizer] {
  visibility: hidden;
  pointer-events: none;
  -webkit-user-select: none;
  user-select: none;
}
[data-mascot-title] {
  font-size: 1.05rem;
  font-weight: 700;
}
[data-mascot-empty-copy] {
  color: var(--color-muted);
  font-weight: 600;
}
[data-mascot-cursor] {
  display: inline-block;
  width: 0.45em;
  height: 1em;
  margin-left: 2px;
  vertical-align: -0.12em;
  background: var(--color-ink);
  opacity: 1;
  transform: translateZ(0);
  animation: mascot-caret 900ms ease-in-out infinite;
}
@keyframes mascot-caret {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
[data-mascot-empty-state] {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 20px;
  background: #f3e6d8;
  background: color-mix(in srgb, var(--color-tertiary) 28%, var(--color-paper));
}
[data-mascot-loading-bar] {
  height: 12px;
  border-radius: 999px;
  background: #eae3de;
  background: color-mix(in srgb, var(--color-ink) 10%, var(--color-paper));
  transform-origin: left center;
  transform: translateZ(0);
  animation: mascot-load 900ms ease-in-out infinite;
}
@keyframes mascot-load {
  0% { opacity: 0.45; transform: scaleX(0.55); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0.45; transform: scaleX(0.55); }
}
[data-mascot-tools] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
  padding: 16px;
  border-radius: 20px;
  background: #f3e6d8;
  background: color-mix(in srgb, var(--color-tertiary) 22%, var(--color-paper));
}
[data-mascot-tools] label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--color-muted);
  font-size: 0.85rem;
}
[data-mascot-tools] input {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  padding: 0 14px;
  border: 1px solid #ddd2c6;
  border: 1px solid color-mix(in srgb, var(--color-ink) 14%, var(--color-tertiary));
  border-radius: 14px;
  background: var(--color-paper);
  color: var(--color-ink);
  font: inherit;
  font-size: 16px;
  -webkit-appearance: none;
  appearance: none;
}
[data-mascot-tools] input:focus {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
[data-mascot-tools] input:focus:not(:focus-visible) {
  outline: none;
}
[data-mascot-tools] input:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
[data-mascot-actions] {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
[data-mascot-actions] button {
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
[data-mascot-actions] button[data-kind="empty"] {
  background: var(--color-secondary);
}
[data-mascot-actions] button[data-kind="unpublished"] {
  background: #d9d3ce;
  background: color-mix(in srgb, var(--color-ink) 18%, var(--color-paper));
  color: var(--color-ink);
}
[data-mascot-actions] button:focus {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
[data-mascot-actions] button:focus:not(:focus-visible) {
  outline: none;
}
[data-mascot-actions] button:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
[data-mascot-actions] button:active {
  opacity: 0.88;
}
[data-mascot-actions] button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
@media (hover: hover) and (pointer: fine) {
  [data-mascot-actions] button:hover:not(:disabled) {
    opacity: 0.92;
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-mascot-screen] *,
  [data-mascot-screen] *::before,
  [data-mascot-screen] *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
  [data-mascot-thread] {
    opacity: 1;
    transform: none;
  }
  [data-mascot-cursor] {
    display: none;
    opacity: 0;
  }
  [data-mascot-loading-bar] {
    animation: none !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    opacity: 1;
    transform: none;
  }
}
`;

function revealAttr(
  p_presentation: MascotPresentation,
  p_prefersReduced: boolean,
): string | undefined {
  if (p_presentation.kind === "empty") {
    return "empty";
  }
  if (p_presentation.kind === "published") {
    return p_prefersReduced ? "instant" : "typewriter";
  }
  return undefined;
}

function MascotScreenBody(): ReactElement {
  const mascot: ReturnType<typeof useMascotMission> = useMascotMission();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);
  const presentation: MascotPresentation = mascot.presentation;
  const reveal: string | undefined = revealAttr(presentation, prefersReduced);

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

  const onSubmit = (p_event: FormEvent<HTMLFormElement>): void => {
    p_event.preventDefault();
    mascot.applyId();
  };

  return (
    <div
      data-mascot-screen
      data-reveal={reveal}
      data-mascot-empty={presentation.kind === "empty" ? "true" : undefined}
      data-mascot-unpublished={
        presentation.kind === "unpublished" ? "true" : undefined
      }
    >
      <style href="mascot-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-mascot-scroll>
        {presentation.kind === "loading" ||
        (presentation.kind === "published" && !isReady) ? (
          <div data-mascot-loading aria-live="polite" aria-busy="true">
            <h1>Carregando missão</h1>
            <div data-mascot-loading-bar />
          </div>
        ) : null}
        {presentation.kind === "unpublished" ? (
          <div data-mascot-empty-state>
            <h1>Nenhuma missão publicada.</h1>
          </div>
        ) : null}
        {presentation.kind === "empty" ? (
          <MascotRevealedCopy
            title=""
            description=""
            prefersReduced={prefersReduced}
          />
        ) : null}
        {isReady && presentation.kind === "published" ? (
          <MascotRevealedCopy
            title={presentation.mission.getTitle()}
            description={presentation.mission.getDescription()}
            prefersReduced={prefersReduced}
          />
        ) : null}
        <form data-mascot-tools onSubmit={onSubmit}>
          <label>
            Id da missão
            <input
              type="text"
              name="mission-id"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={mascot.idDraft}
              onChange={(p_event: ChangeEvent<HTMLInputElement>): void => {
                mascot.setIdDraft(p_event.currentTarget.value);
              }}
            />
          </label>
          <div data-mascot-actions>
            <button type="submit">Abrir</button>
            <button
              type="button"
              data-kind="empty"
              onClick={(): void => {
                mascot.showEmptyPreview();
              }}
            >
              Ver vazio
            </button>
            <button
              type="button"
              data-kind="unpublished"
              onClick={(): void => {
                mascot.showUnpublishedPreview();
              }}
            >
              Ver não publicada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MascotScreen(): ReactElement {
  return (
    <MascotMissionProvider>
      <MascotScreenBody />
    </MascotMissionProvider>
  );
}
