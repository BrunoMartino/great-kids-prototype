"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import Link from "next/link";
import {
  ArrowsClockwiseIcon,
  CheckIcon,
  GiftIcon,
  LockIcon,
  StarIcon,
  WarningIcon,
} from "@/app/design-system/icons";
import { FamilyThumbShell } from "../../chrome/family-thumb-shell";
import {
  LoadingCard,
  MascotGlyph,
  StateCard,
  TypewriterCopy,
  Well,
} from "../../chrome/family-ui";
import { useFamilySession } from "../../context-switch/family-session-context";
import { CycleSessionProvider, useCycleSession } from "./cycle-session-context";
import type { CycleOfferedCommand } from "./cycle-ui-state";

const CYCLE_STEPS: readonly string[] = ["Accepted", "Doing", "Completed"];

type YesNoProps = {
  label: string;
  value: boolean | null;
  onChange: (p_value: boolean) => void;
};

function YesNo(p_props: YesNoProps): ReactElement {
  return (
    <div data-gk-stack>
      <p>{p_props.label}</p>
      <fieldset data-gk-chips aria-label={p_props.label}>
        {([true, false] as const).map((p_option: boolean) => (
          <button
            key={String(p_option)}
            type="button"
            data-gk-chip
            data-kind="choice"
            aria-pressed={p_props.value === p_option}
            onClick={(): void => {
              p_props.onChange(p_option);
            }}
          >
            <CheckIcon data-gk-check size={16} weight="bold" aria-hidden="true" />
            {p_option ? "Yes" : "No"}
          </button>
        ))}
      </fieldset>
    </div>
  );
}

function commandLabel(p_command: CycleOfferedCommand): string {
  if (p_command === "start") {
    return "Start mission";
  }
  return "Complete";
}

function CycleScreenBody(): ReactElement {
  const cycle: ReturnType<typeof useCycleSession> = useCycleSession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const presentation = cycle.presentation;
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const historyHref: string =
    cycle.familyId.length === 0
      ? "/missions/completed"
      : `/missions/completed?id=${encodeURIComponent(cycle.familyId)}`;

  const stepIndex: number =
    presentation.kind === "ready" ? Math.max(0, CYCLE_STEPS.indexOf(presentation.status)) : 0;
  const isShown: boolean = isReady && presentation.kind === "ready" && !session.isLoading;

  return (
    <div data-cycle-screen>
      <div data-gk-screen-frame inert={cycle.isClosingOpen}>
        <FamilyThumbShell
          sub="Accepted together"
          title="Mission cycle"
          content={
            <>
              {presentation.kind === "loading" || session.isLoading ? (
                <LoadingCard label="Loading the cycle" />
              ) : null}
              {presentation.kind === "need-family" && !session.isLoading ? (
                <StateCard icon={ArrowsClockwiseIcon} title="Mission cycle">
                  <p>Opening the accepted mission cycle.</p>
                </StateCard>
              ) : null}
              {presentation.kind === "need-cycle" && !session.isLoading ? (
                <StateCard icon={GiftIcon} tone="warm" title="No mission yet">
                  <p>Accept a surprise to start. Illegal transitions are hidden.</p>
                </StateCard>
              ) : null}
              {presentation.kind === "denied" ? (
                <StateCard icon={LockIcon} title="Cycle is Parent only" role="alert">
                  <p>Child view cannot advance or complete the mission.</p>
                </StateCard>
              ) : null}
              {presentation.kind === "missing" ? (
                <StateCard icon={WarningIcon} title="Mission not found">
                  <p>That id does not open the cycle.</p>
                </StateCard>
              ) : null}
              {presentation.kind === "error" ? (
                <StateCard icon={WarningIcon} title="Mission cycle" role="alert">
                  <p>{presentation.message}</p>
                </StateCard>
              ) : null}
              {isShown && presentation.kind === "ready" ? (
                <>
                  <div data-gk-mission data-gk-enter data-cycle-card data-status={presentation.status}>
                    <div data-gk-mission-top>
                      <p data-gk-eyebrow data-cycle-status>
                        {presentation.status}
                      </p>
                      <MascotGlyph />
                    </div>
                    <TypewriterCopy
                      text={presentation.title.length > 0 ? presentation.title : "Family mission"}
                    />
                  </div>
                  <div data-gk-stack>
                    <div data-gk-progress-meta>
                      <span>
                        Step {String(stepIndex + 1)} of {String(CYCLE_STEPS.length)}
                      </span>
                      <span>{presentation.status}</span>
                    </div>
                    <div
                      data-gk-progress
                      role="progressbar"
                      aria-label="Mission progress"
                      aria-valuemin={1}
                      aria-valuemax={CYCLE_STEPS.length}
                      aria-valuenow={stepIndex + 1}
                    >
                      <i style={{ transform: `scaleX(${String((stepIndex + 1) / CYCLE_STEPS.length)})` }} />
                    </div>
                  </div>
                  {presentation.status === "Accepted" ? (
                    <p data-gk-alert="info">
                      <ArrowsClockwiseIcon size={20} aria-hidden="true" />
                      The family accepted. You can only start — complete is not offered yet.
                    </p>
                  ) : null}
                  {presentation.status === "Doing" ? (
                    <p data-gk-alert="info">
                      <ArrowsClockwiseIcon size={20} aria-hidden="true" />
                      They are doing it. The closing question opens only when completing.
                    </p>
                  ) : null}
                  {presentation.status === "Completed" && presentation.closing !== null ? (
                    <div data-gk-reward>
                      <Well icon={StarIcon} tone="warm" />
                      <div>
                        <h2>Mission complete</h2>
                        <p>
                          {presentation.closing.do_again ? "Would do again" : "Do not repeat"}
                          {"; "}
                          {presentation.closing.save_memory ? "saved in memory" : "not saved"}.
                        </p>
                      </div>
                    </div>
                  ) : null}
                  {cycle.formError !== null && !cycle.isClosingOpen ? (
                    <p data-gk-alert="danger" role="alert">
                      <WarningIcon size={20} aria-hidden="true" />
                      {cycle.formError}
                    </p>
                  ) : null}
                </>
              ) : null}
            </>
          }
          actions={
            isShown && presentation.kind === "ready" &&
            (presentation.offered.length > 0 || presentation.status === "Completed") ? (
              <div data-gk-action-row data-cycle-actions>
                {presentation.status === "Completed" ? (
                  <Link href={historyHref} data-cycle-link data-gk-btn="secondary">
                    View completed
                  </Link>
                ) : null}
                {presentation.offered.map((p_command: CycleOfferedCommand) => (
                  <button
                    key={p_command}
                    type="button"
                    data-cycle-command={p_command}
                    data-gk-btn={p_command === "start" ? "warm" : "primary"}
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
              </div>
            ) : undefined
          }
        />
      </div>
      <div
        data-gk-sheet-backdrop
        data-open={cycle.isClosingOpen ? "true" : "false"}
        role="presentation"
        aria-hidden={!cycle.isClosingOpen}
        inert={!cycle.isClosingOpen}
      >
        <form
          data-gk-sheet
          role="dialog"
          aria-modal="true"
          aria-labelledby="closing-title"
          onSubmit={(p_event: FormEvent<HTMLFormElement>): void => {
            p_event.preventDefault();
            void cycle.completeMission();
          }}
        >
          <span data-gk-grab aria-hidden="true" />
          <h2 id="closing-title">Close the mission</h2>
          <p>Both answers go with Completed, in the same transaction.</p>
          <YesNo label="Would you do it again?" value={cycle.doAgain} onChange={cycle.setDoAgain} />
          <YesNo label="Save this in memory?" value={cycle.saveMemory} onChange={cycle.setSaveMemory} />
          {cycle.formError !== null && cycle.isClosingOpen ? (
            <p data-gk-alert="danger" role="alert">
              <WarningIcon size={20} aria-hidden="true" />
              {cycle.formError}
            </p>
          ) : null}
          <button
            type="button"
            data-gk-btn="secondary"
            onClick={(): void => {
              cycle.closeClosing();
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            data-gk-btn="primary"
            disabled={cycle.isSaving || cycle.doAgain === null || cycle.saveMemory === null}
          >
            Complete
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
