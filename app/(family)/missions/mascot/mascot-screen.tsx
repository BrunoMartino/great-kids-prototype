"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import { WarningIcon } from "@/app/design-system/icons";
import { FamilyThumbShell } from "../../chrome/family-thumb-shell";
import { LoadingCard, StateCard } from "../../chrome/family-ui";
import { SEEDED_PUBLISHED_MISSIONS } from "../../chrome/seeded-family";
import { MascotRevealedCopy } from "./mascot-revealed-copy";
import {
  MascotMissionProvider,
  useMascotMission,
  type MascotPresentation,
} from "./mascot-mission-context";

const MASCOT_FORM_ID: string = "mascot-open-form";

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
      <FamilyThumbShell
        sub="A message from the mascot"
        title="Today's mission"
        content={
          <>
            {presentation.kind === "loading" ||
            (presentation.kind === "published" && !isReady) ? (
              <div data-mascot-loading>
                <LoadingCard label="Loading mission" />
              </div>
            ) : null}
            {presentation.kind === "unpublished" ? (
              <div data-mascot-empty-state>
                <StateCard icon={WarningIcon} title="No published missions.">
                  <p>Unpublished missions never reach the family.</p>
                </StateCard>
              </div>
            ) : null}
            {presentation.kind === "empty" ? (
              <MascotRevealedCopy title="" description="" prefersReduced={prefersReduced} />
            ) : null}
            {isReady && presentation.kind === "published" ? (
              <MascotRevealedCopy
                title={presentation.mission.getTitle()}
                description={presentation.mission.getDescription()}
                prefersReduced={prefersReduced}
              />
            ) : null}
            <form id={MASCOT_FORM_ID} data-gk-card data-mascot-tools onSubmit={onSubmit}>
              <label data-gk-field>
                Published mission
                <select
                  data-gk-input
                  name="mission-id"
                  value={mascot.idDraft}
                  onChange={(p_event: ChangeEvent<HTMLSelectElement>): void => {
                    mascot.setIdDraft(p_event.currentTarget.value);
                  }}
                >
                  {SEEDED_PUBLISHED_MISSIONS.map((p_mission) => (
                    <option key={p_mission.id} value={p_mission.id}>
                      {p_mission.title}
                    </option>
                  ))}
                </select>
              </label>
              <div data-gk-chips data-mascot-actions>
                <button
                  type="button"
                  data-gk-chip
                  data-kind="empty"
                  aria-pressed={presentation.kind === "empty"}
                  onClick={(): void => {
                    mascot.showEmptyPreview();
                  }}
                >
                  View empty
                </button>
                <button
                  type="button"
                  data-gk-chip
                  data-kind="unpublished"
                  aria-pressed={presentation.kind === "unpublished"}
                  onClick={(): void => {
                    mascot.showUnpublishedPreview();
                  }}
                >
                  View unpublished
                </button>
              </div>
            </form>
          </>
        }
        actions={
          <div data-gk-action-row>
            <button type="submit" form={MASCOT_FORM_ID} data-gk-btn="primary">
              Open mission
            </button>
          </div>
        }
      />
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
