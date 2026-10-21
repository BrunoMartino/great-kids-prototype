"use client";

import { startTransition, useEffect, useState, type ReactElement } from "react";
import { InstantRevealStrategy } from "./instant-reveal-strategy";
import type { RevealStrategy } from "./reveal-strategy";
import { TypewriterRevealStrategy } from "./typewriter-reveal-strategy";
import { MascotGlyph } from "../../chrome/family-ui";

/** Mascot message as the preview mission card (MASTER §9.3): tide gradient, Fraunces copy, typed out. */
const THREAD_STYLES: string = `
[data-mascot-thread] {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px;
  overflow: hidden;
  border-radius: var(--r-xl);
  background: var(--app-hero-from);
  background: var(--grad-tide);
  box-shadow: var(--el-3);
  color: var(--app-on-hero);
  contain: layout;
  animation: mascot-enter var(--dur-enter) var(--ease-enter) both;
}
@keyframes mascot-enter {
  from { opacity: 0; transform: translate3d(0, 8px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
[data-mascot-sender] {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
[data-mascot-voice] {
  color: var(--app-on-hero-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
[data-mascot-message] {
  display: flex;
  flex-direction: column;
  gap: 10px;
  contain: layout;
}
[data-mascot-title],
[data-mascot-body] {
  display: grid;
  margin: 0;
  color: var(--app-on-hero);
}
[data-mascot-surface] :where(h2) {
  color: var(--app-on-hero);
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
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 500;
  line-height: 1.3;
  font-variation-settings: "SOFT" 100, "WONK" 0;
}
[data-mascot-body] {
  color: var(--app-on-hero-muted);
  font-size: 15px;
  line-height: 1.5;
}
[data-mascot-empty-copy] {
  font-weight: 600;
  opacity: 0.85;
}
[data-mascot-cursor] {
  display: inline-block;
  width: 2px;
  height: 1.05em;
  margin-left: 2px;
  vertical-align: -0.15em;
  background: currentColor;
  animation: mascot-caret 1s steps(1) infinite;
}
@keyframes mascot-caret {
  50% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  [data-mascot-thread],
  [data-mascot-cursor] {
    animation: none !important;
  }
}
`;

type MascotRevealedCopyProps = {
  title: string;
  description: string;
  prefersReduced: boolean;
};

function selectRevealStrategy(p_prefersReduced: boolean): RevealStrategy {
  if (p_prefersReduced) {
    return new InstantRevealStrategy();
  }
  return new TypewriterRevealStrategy();
}

export function MascotRevealedCopy(
  p_props: MascotRevealedCopyProps,
): ReactElement {
  const title: string = p_props.title;
  const description: string = p_props.description;
  const copyIsEmpty: boolean =
    title.trim().length === 0 && description.trim().length === 0;
  const titleIsEmpty: boolean = title.trim().length === 0;
  const descriptionIsEmpty: boolean = description.trim().length === 0;
  const revealKind: "empty" | "instant" | "typewriter" = copyIsEmpty
    ? "empty"
    : p_props.prefersReduced
      ? "instant"
      : "typewriter";
  const [shownTitle, setShownTitle] = useState<string>("");
  const [shownDescription, setShownDescription] = useState<string>("");
  const [titleDone, setTitleDone] = useState<boolean>(true);
  const [descriptionDone, setDescriptionDone] = useState<boolean>(true);
  const showTitleCursor: boolean =
    revealKind === "typewriter" && !titleIsEmpty && !titleDone;
  const showDescriptionCursor: boolean =
    revealKind === "typewriter" &&
    !descriptionIsEmpty &&
    titleDone &&
    !descriptionDone;

  useEffect(() => {
    if (copyIsEmpty) {
      setShownTitle("");
      setShownDescription("");
      setTitleDone(true);
      setDescriptionDone(true);
      return;
    }
    const strategy: RevealStrategy = selectRevealStrategy(
      p_props.prefersReduced,
    );
    const cancelFns: Array<() => void> = [];
    setTitleDone(titleIsEmpty);
    setDescriptionDone(descriptionIsEmpty);

    const startDescription = (): void => {
      if (descriptionIsEmpty) {
        setShownDescription("");
        setDescriptionDone(true);
        return;
      }
      cancelFns.push(
        strategy.getRevealed(description, (p_shown: string): void => {
          startTransition((): void => {
            setShownDescription(p_shown);
          });
          if (p_shown === description) {
            setDescriptionDone(true);
          }
        }),
      );
    };

    if (titleIsEmpty) {
      setShownTitle("");
      setTitleDone(true);
      startDescription();
    } else {
      cancelFns.push(
        strategy.getRevealed(title, (p_shown: string): void => {
          startTransition((): void => {
            setShownTitle(p_shown);
          });
          if (p_shown === title) {
            setTitleDone(true);
            startDescription();
          }
        }),
      );
    }

    return (): void => {
      for (const cancel of cancelFns) {
        cancel();
      }
    };
  }, [
    copyIsEmpty,
    description,
    descriptionIsEmpty,
    p_props.prefersReduced,
    title,
    titleIsEmpty,
  ]);

  return (
    <div
      data-mascot-thread
      data-mascot-surface
      data-mascot-reveal={revealKind}
      data-mascot-published="true"
    >
      <style href="mascot-thread" precedence="medium">
        {THREAD_STYLES}
      </style>
      <div data-mascot-sender>
        <span data-mascot-voice>Mascot</span>
        <MascotGlyph />
      </div>
      <div data-mascot-message data-mascot-bubble aria-live="polite">
        {copyIsEmpty ? (
          <>
            <h2 data-mascot-title data-mascot-empty-copy>
              Empty mission
            </h2>
            <p data-mascot-body data-mascot-empty-copy>
              No title and no description.
            </p>
          </>
        ) : titleIsEmpty ? (
          <p data-mascot-title data-mascot-empty-copy>
            Empty title
          </p>
        ) : (
          <p data-mascot-title>
            {revealKind === "typewriter" ? (
              <span data-mascot-sizer aria-hidden="true">
                {title}
              </span>
            ) : null}
            <span data-mascot-typed>
              {shownTitle}
              {showTitleCursor ? (
                <span data-mascot-cursor aria-hidden="true" />
              ) : null}
            </span>
          </p>
        )}
        {copyIsEmpty ? null : descriptionIsEmpty ? (
          <p data-mascot-body data-mascot-empty-copy>
            Empty description
          </p>
        ) : (
          <p data-mascot-body>
            {revealKind === "typewriter" ? (
              <span data-mascot-sizer aria-hidden="true">
                {description}
              </span>
            ) : null}
            <span data-mascot-typed>
              {shownDescription}
              {showDescriptionCursor ? (
                <span data-mascot-cursor aria-hidden="true" />
              ) : null}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
