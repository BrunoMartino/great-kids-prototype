"use client";

import { startTransition, useEffect, useState, type ReactElement } from "react";
import { InstantRevealStrategy } from "./instant-reveal-strategy";
import type { RevealStrategy } from "./reveal-strategy";
import { TypewriterRevealStrategy } from "./typewriter-reveal-strategy";

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
      data-mascot-reveal={revealKind}
      data-mascot-published="true"
    >
      <div data-mascot-sender>
        <span data-mascot-avatar aria-hidden="true" />
        <span data-mascot-voice>Mascote</span>
      </div>
      <div data-mascot-message data-mascot-bubble aria-live="polite">
        {copyIsEmpty ? (
          <>
            <h1 data-mascot-title data-mascot-empty-copy>
              Missão vazia
            </h1>
            <p data-mascot-body data-mascot-empty-copy>
              Sem título e sem descrição.
            </p>
          </>
        ) : titleIsEmpty ? (
          <p data-mascot-title data-mascot-empty-copy>
            Título vazio
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
            Descrição vazia
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
