"use client";

import {
  useEffect,
  useState,
  type ReactElement,
} from "react";
import Link from "next/link";
import { GiftIcon, LockIcon, WarningIcon } from "@/app/design-system/icons";
import { FamilyThumbShell } from "../../chrome/family-thumb-shell";
import { LoadingCard, StateCard } from "../../chrome/family-ui";
import { useFamilySession } from "../../context-switch/family-session-context";
import { MascotRevealedCopy } from "../mascot/mascot-revealed-copy";
import {
  SurpriseSessionProvider,
  useSurpriseSession,
} from "./surprise-session-context";

function SurpriseScreenBody(): ReactElement {
  const surprise: ReturnType<typeof useSurpriseSession> = useSurpriseSession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
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
      <FamilyThumbShell
        sub="One tap, one idea"
        title="Surprise mission"
        content={
          <>
            {presentation.kind === "loading" || session.isLoading ? (
              <LoadingCard label="Loading the surprise" />
            ) : null}
            {(presentation.kind === "need-family" || presentation.kind === "idle") &&
            !session.isLoading ? (
              <StateCard icon={GiftIcon} tone="warm" title="Ready for a surprise?">
                <p>One tap picks a published mission. With no catalog, empty is explicit.</p>
              </StateCard>
            ) : null}
            {presentation.kind === "denied" ? (
              <StateCard icon={LockIcon} title="Surprise is Parent only" role="alert">
                <p>Child view does not open surprise missions.</p>
              </StateCard>
            ) : null}
            {presentation.kind === "missing" ? (
              <StateCard icon={WarningIcon} title="Family not found">
                <p>That id does not open the surprise.</p>
              </StateCard>
            ) : null}
            {presentation.kind === "error" ? (
              <StateCard icon={WarningIcon} title="Surprise mission" role="alert">
                <p>{presentation.message}</p>
              </StateCard>
            ) : null}
            {presentation.kind === "empty" ? (
              <div data-surprise-empty-state="true">
                <StateCard icon={GiftIcon} tone="warm" title="No published missions.">
                  <p>The catalog has nothing published yet.</p>
                </StateCard>
              </div>
            ) : null}
            {isReady && presentation.kind === "hit" ? (
              <MascotRevealedCopy
                title={presentation.title}
                description={presentation.description}
                prefersReduced={prefersReduced}
              />
            ) : null}
          </>
        }
        actions={
          <div data-gk-action-row>
            <button
              type="button"
              data-gk-btn={isReady && presentation.kind === "hit" ? "secondary" : "warm"}
              disabled={surprise.isSaving || surprise.familyId.length === 0}
              onClick={(): void => {
                void surprise.draw();
              }}
            >
              <GiftIcon size={18} weight="bold" aria-hidden="true" />
              {isReady && presentation.kind === "hit" ? "Another" : "Surprise mission"}
            </button>
            {isReady && presentation.kind === "hit" ? (
              <Link
                href={`/missions/cycle?id=${encodeURIComponent(surprise.familyId)}&cycle=${encodeURIComponent(presentation.cycleId)}&title=${encodeURIComponent(presentation.title)}`}
                data-surprise-cycle
                data-gk-btn="warm"
              >
                Do it now
              </Link>
            ) : null}
          </div>
        }
      />
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
