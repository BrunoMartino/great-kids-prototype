"use client";

import { useEffect, useState, type ReactElement } from "react";
import type { SuggestionItem } from "../calendar/day-composite";
import Link from "next/link";
import {
  BookOpenTextIcon,
  CalendarBlankIcon,
  CaretRightIcon,
  CheckIcon,
  CreditCardIcon,
  LockIcon,
  QuestionIcon,
  StarIcon,
  UsersThreeIcon,
  WarningIcon,
  type Icon,
} from "@/app/design-system/icons";
import { FamilyThumbShell } from "../chrome/family-thumb-shell";
import {
  HeroWaves,
  LoadingCard,
  MascotGlyph,
  StateCard,
  TypewriterCopy,
  Well,
} from "../chrome/family-ui";
import { missionTitleOf } from "../chrome/family-week";
import { SEEDED_ACCEPTED_TITLE } from "../chrome/seeded-family";
import { useFamilySession } from "./family-session-context";
import { useFamilySummary, type FamilySummary } from "./use-family-summary";

type HolderAction = "plan" | "invite";

type HomeTile = {
  href: string;
  title: string;
  count: number | null;
  icon: Icon;
  tone: "sea" | "warm";
};

function summaryTiles(p_summary: FamilySummary): HomeTile[] {
  const tiles: HomeTile[] = [
    {
      href: "/calendar",
      title: "Planned today",
      count: p_summary.plannedToday === null ? null : p_summary.plannedToday.length,
      icon: CalendarBlankIcon,
      tone: "sea",
    },
    { href: "/missions/completed", title: "Completed", count: p_summary.completedCount, icon: StarIcon, tone: "warm" },
    { href: "/quiz", title: "Quiz questions", count: p_summary.quizCount, icon: QuestionIcon, tone: "sea" },
    { href: "/diary", title: "Diary notes", count: p_summary.diaryCount, icon: BookOpenTextIcon, tone: "sea" },
  ];
  return tiles.filter((p_tile: HomeTile): boolean => p_tile.count !== null);
}

const SCREEN_STYLES: string = `
[data-home-views] {
  display: grid;
}
[data-home-view] {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  opacity: 0;
  transform: translate3d(0, 4px, 0);
  pointer-events: none;
  transition: opacity var(--dur-exit) var(--ease-exit), transform var(--dur-exit) var(--ease-exit);
}
[data-home-view][data-active="true"] {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  pointer-events: auto;
  transition: opacity var(--dur-drawer) var(--ease-enter), transform var(--dur-drawer) var(--ease-enter);
}
@media (prefers-reduced-motion: reduce) {
  [data-home-view] {
    transition: none !important;
  }
}
`;

function denyCopy(p_action: HolderAction): string {
  if (p_action === "plan") {
    return "Child view cannot change the plan. You stay in the child view.";
  }
  return "Child view cannot invite adults. You stay in the child view.";
}

function parentCopy(p_action: HolderAction): string {
  if (p_action === "plan") {
    return "Parent view: changing the plan is available to the account holder.";
  }
  return "Parent view: inviting adults is available to the account holder.";
}

function greetingFor(p_hour: number): string {
  if (p_hour < 12) {
    return "Good morning";
  }
  if (p_hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function ContextSwitchScreen(): ReactElement {
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const [denyAction, setDenyAction] = useState<HolderAction | null>(null);
  const [lastDenyAction, setLastDenyAction] = useState<HolderAction>("plan");
  const [parentAction, setParentAction] = useState<HolderAction | null>(null);
  const [dateLabel, setDateLabel] = useState<string>("Today");
  const [greeting, setGreeting] = useState<string>("Hello");
  const role: "Parent" | "Child" | null = session.snapshot?.role ?? null;
  const isParent: boolean = role === "Parent";
  const isChild: boolean = role === "Child";
  const isDenyOpen: boolean = denyAction !== null && isChild;

  const summary: FamilySummary = useFamilySummary(session.familyId, isParent);
  const tiles: HomeTile[] = summaryTiles(summary);
  const todayMission: SuggestionItem | undefined = (summary.plannedToday ?? []).find(
    (p_item: SuggestionItem): boolean => p_item.status === "scheduled",
  );
  const missionTitle: string =
    todayMission === undefined ? SEEDED_ACCEPTED_TITLE : missionTitleOf(todayMission.mission_id);

  useEffect(() => {
    setDateLabel(todayLabel());
    setGreeting(greetingFor(new Date().getHours()));
  }, []);

  const onHolderAction = (p_action: HolderAction): void => {
    if (session.snapshot === null) {
      return;
    }
    if (session.snapshot.role === "Child") {
      setParentAction(null);
      setLastDenyAction(p_action);
      setDenyAction(p_action);
      return;
    }
    setDenyAction(null);
    setParentAction(p_action);
  };

  const hero: ReactElement = (
    <section data-gk-hero aria-labelledby="home-title">
      <HeroWaves />
      <header data-gk-head>
        <p data-gk-sub>{dateLabel}</p>
        <h1 id="home-title">{isChild ? "Child view" : `${greeting}, family`}</h1>
      </header>
      <div data-gk-mission>
        <div data-gk-mission-top>
          <p data-gk-eyebrow>{todayMission === undefined ? "Accepted mission" : "Today's mission"}</p>
          <MascotGlyph />
        </div>
        <TypewriterCopy text={missionTitle} />
        <div data-gk-row-inline>
          <Link href="/missions/cycle" data-gk-btn="warm">
            Start mission
          </Link>
          <Link href="/missions/surprise" data-gk-btn="ghost">
            Surprise
          </Link>
        </div>
      </div>
    </section>
  );

  const holderRows: ReactElement = (
    <div data-gk-list>
      <button
        type="button"
        data-gk-row
        data-kind="plan"
        onClick={(): void => {
          onHolderAction("plan");
        }}
      >
        <Well icon={isChild ? LockIcon : CreditCardIcon} size="sm" />
        <span data-gk-row-text>
          <strong>Change plan</strong>
          <span>Account holder only</span>
        </span>
        <span data-gk-row-trail>
          <CaretRightIcon size={18} aria-hidden="true" />
        </span>
      </button>
      <button
        type="button"
        data-gk-row
        data-kind="invite"
        onClick={(): void => {
          onHolderAction("invite");
        }}
      >
        <Well icon={isChild ? LockIcon : UsersThreeIcon} size="sm" />
        <span data-gk-row-text>
          <strong>Invite family member</strong>
          <span>Parent or Child, no photo</span>
        </span>
        <span data-gk-row-trail>
          <CaretRightIcon size={18} aria-hidden="true" />
        </span>
      </button>
    </div>
  );

  return (
    <div
      data-context-switch-screen
      data-session-role={role ?? "none"}
      data-presentation={session.snapshot?.presentation ?? "none"}
    >
      <style href="context-switch-screen" precedence="medium">
        {SCREEN_STYLES}
      </style>
      <div data-gk-screen-frame inert={isDenyOpen}>
        <FamilyThumbShell
          hero={hero}
          content={
            <>
              {session.isLoading ? <LoadingCard label="Loading the family view" /> : null}
              {!session.isLoading && session.snapshot === null ? (
                <StateCard icon={WarningIcon} title="No mock session" role="alert">
                  <p>{session.errorMessage}</p>
                </StateCard>
              ) : null}
              {session.snapshot !== null ? (
                <div data-home-views>
                  <section
                    data-home-view="parent"
                    data-active={isParent ? "true" : "false"}
                    aria-hidden={!isParent}
                    inert={!isParent}
                  >
                    <h2 data-gk-sec>
                      This week <Link href="/calendar">See all</Link>
                    </h2>
                    {summary.isLoading && isParent ? <LoadingCard label="Loading today's summary" /> : null}
                    {!summary.isLoading && tiles.length > 0 ? (
                      <div data-gk-tiles data-home-summary>
                        {tiles.map((p_tile: HomeTile) => (
                          <Link key={p_tile.href} href={p_tile.href} data-gk-pebble>
                            <Well icon={p_tile.icon} tone={p_tile.tone} />
                            <span data-gk-num>{String(p_tile.count ?? 0)}</span>
                            <h3>{p_tile.title}</h3>
                            <CaretRightIcon data-gk-go size={18} aria-hidden="true" />
                          </Link>
                        ))}
                      </div>
                    ) : null}
                    <h2 data-gk-sec>Account holder</h2>
                    {holderRows}
                    {parentAction !== null && isParent ? (
                      <p data-gk-alert="success" role="status">
                        <CheckIcon size={20} aria-hidden="true" />
                        {parentCopy(parentAction)}
                      </p>
                    ) : null}
                  </section>
                  <section
                    data-home-view="child"
                    data-active={isChild ? "true" : "false"}
                    aria-hidden={!isChild}
                    inert={!isChild}
                  >
                    <p data-gk-alert="info">
                      <LockIcon size={20} aria-hidden="true" />
                      <span>
                        <strong>Context switch only</strong>
                        No Child login is created. Plan and invites stay locked.
                      </span>
                    </p>
                    <h2 data-gk-sec>Account holder</h2>
                    {holderRows}
                  </section>
                </div>
              ) : null}
            </>
          }
        />
      </div>
      <div
        data-gk-sheet-backdrop
        data-open={isDenyOpen ? "true" : "false"}
        role="presentation"
        aria-hidden={!isDenyOpen}
        inert={!isDenyOpen}
      >
        <div data-gk-sheet role="dialog" aria-modal="true" aria-labelledby="child-deny-title">
          <span data-gk-grab aria-hidden="true" />
          <h2 id="child-deny-title">Action blocked</h2>
          <p>{denyCopy(lastDenyAction)}</p>
          <button
            type="button"
            data-gk-btn="primary"
            onClick={(): void => {
              setDenyAction(null);
            }}
          >
            Stay in Child view
          </button>
        </div>
      </div>
    </div>
  );
}
