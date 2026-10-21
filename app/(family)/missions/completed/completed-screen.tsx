"use client";

import type { ReactElement } from "react";
import { CheckIcon, LockIcon, TrophyIcon, WarningIcon } from "@/app/design-system/icons";
import { FamilyThumbShell } from "../../chrome/family-thumb-shell";
import { LoadingCard, StateCard, Well } from "../../chrome/family-ui";
import { useFamilySession } from "../../context-switch/family-session-context";
import type { CompletedMissionItem } from "./completed-payload";
import {
  CompletedSessionProvider,
  useCompletedSession,
} from "./completed-session-context";

function dateOf(p_value: string | null): string {
  if (p_value === null) {
    return "No date";
  }
  const parsed: Date = new Date(p_value);
  if (Number.isNaN(parsed.getTime())) {
    return p_value;
  }
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function closingCopy(p_item: CompletedMissionItem): string {
  if (p_item.closing === null) {
    return "No closing";
  }
  const again: string = p_item.closing.do_again ? "would do again" : "do not repeat";
  const memory: string = p_item.closing.save_memory
    ? "save in memory"
    : "do not save";
  return `${again}; ${memory}`;
}

function CompletedScreenBody(): ReactElement {
  const history: ReturnType<typeof useCompletedSession> = useCompletedSession();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const presentation = history.presentation;

  return (
    <div data-completed-screen>
      <FamilyThumbShell
        sub="Family history"
        title="Completed missions"
        content={
          <>
            {presentation.kind === "loading" || session.isLoading ? (
              <LoadingCard label="Loading completed missions" />
            ) : null}
            {presentation.kind === "need-family" && !session.isLoading ? (
              <StateCard icon={TrophyIcon} tone="warm" title="Completed missions">
                <p>Opening family history.</p>
              </StateCard>
            ) : null}
            {presentation.kind === "denied" ? (
              <StateCard icon={LockIcon} title="History is Parent only" role="alert">
                <p>Child view does not list completed missions.</p>
              </StateCard>
            ) : null}
            {presentation.kind === "missing" ? (
              <StateCard icon={WarningIcon} title="Family not found">
                <p>That id does not open history.</p>
              </StateCard>
            ) : null}
            {presentation.kind === "error" ? (
              <StateCard icon={WarningIcon} title="Completed missions" role="alert">
                <p>{presentation.message}</p>
              </StateCard>
            ) : null}
            {presentation.kind === "empty" ? (
              <div data-completed-empty-state="true">
                <StateCard icon={TrophyIcon} tone="warm" title="No completed missions.">
                  <p>The envelope arrives empty. Drafts and in-progress missions stay out.</p>
                </StateCard>
              </div>
            ) : null}
            {presentation.kind === "ready" ? (
              <section data-gk-stack data-gk-enter data-completed-list aria-labelledby="completed-title">
                <h2 data-gk-sec id="completed-title">
                  {String(presentation.missions.length)} completed
                </h2>
                <div data-gk-list>
                  {presentation.missions.map((p_item: CompletedMissionItem) => (
                    <article key={p_item.id} data-gk-row data-completed-item>
                      <Well icon={TrophyIcon} tone="warm" size="sm" />
                      <span data-gk-row-text>
                        <strong>{p_item.title}</strong>
                        <span data-completed-meta>
                          {dateOf(p_item.completed_at)} · {closingCopy(p_item)}
                        </span>
                      </span>
                      <span data-gk-badge="success">
                        <CheckIcon size={14} weight="bold" aria-hidden="true" />
                        Done
                      </span>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        }
      />
    </div>
  );
}

export function CompletedScreen(): ReactElement {
  return (
    <CompletedSessionProvider>
      <CompletedScreenBody />
    </CompletedSessionProvider>
  );
}
