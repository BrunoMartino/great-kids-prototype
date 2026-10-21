"use client";

import { useEffect, useState, type MouseEvent, type ReactElement } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowsClockwiseIcon,
  BookOpenTextIcon,
  CalendarBlankIcon,
  CloudSunIcon,
  CreditCardIcon,
  GiftIcon,
  HouseIcon,
  type Icon,
  ListIcon,
  PauseIcon,
  PlayIcon,
  QuestionIcon,
  SignOutIcon,
  UserCircleIcon,
  XIcon,
} from "@/app/design-system/icons";
import { useFamilySession } from "../context-switch/family-session-context";
import { useTidePreference } from "./tide-preference-context";

type DrawerItem = {
  href: string;
  label: string;
  icon: Icon;
};

const PARENT_ITEMS: readonly DrawerItem[] = [
  { href: "/context-switch", label: "Home", icon: HouseIcon },
  { href: "/quiz", label: "Quiz", icon: QuestionIcon },
  { href: "/calendar", label: "Calendar", icon: CalendarBlankIcon },
  { href: "/forecast", label: "Forecast", icon: CloudSunIcon },
  { href: "/missions/surprise", label: "Surprise", icon: GiftIcon },
  { href: "/missions/cycle", label: "Cycle", icon: ArrowsClockwiseIcon },
  { href: "/diary", label: "Diary", icon: BookOpenTextIcon },
];

type DrawerGlyphProps = {
  icon: Icon;
};

function DrawerGlyph(p_props: DrawerGlyphProps): ReactElement {
  const Glyph: Icon = p_props.icon;
  return <Glyph data-phone-drawer-glyph size={24} weight="regular" aria-hidden="true" />;
}

const DRAWER_STYLES: string = `
[data-phone-hamburger] {
  position: absolute;
  top: 63px;
  right: 20px;
  z-index: 22;
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--r-md);
  background: var(--gk-surface);
  box-shadow: var(--el-1);
  color: var(--gk-ink);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: transform var(--dur-micro) var(--ease-state), background-color var(--dur-micro) var(--ease-state), color var(--dur-micro) var(--ease-state);
}
[data-phone-screen]:has([data-gk-hero]) [data-phone-hamburger][aria-expanded="false"] {
  background: var(--app-hero-control);
  box-shadow: none;
  color: var(--app-on-hero);
}
[data-phone-hamburger]:active {
  transform: scale(0.96);
}
[data-phone-hamburger]:focus-visible,
[data-phone-drawer] a:focus-visible,
[data-phone-drawer] button:focus-visible {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}
[data-phone-drawer-backdrop] {
  position: absolute;
  inset: 0;
  z-index: 20;
  background: var(--gk-scrim);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--dur-exit) var(--ease-exit);
}
[data-phone-drawer-backdrop][data-open="true"] {
  opacity: 1;
  pointer-events: auto;
  transition: opacity var(--dur-drawer) var(--ease-enter);
}
[data-phone-drawer] {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 21;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 84%;
  max-width: 360px;
  padding: 63px 18px 34px;
  box-sizing: border-box;
  overflow-y: auto;
  border-radius: 32px 0 0 32px;
  background: var(--gk-surface);
  box-shadow: var(--el-3);
  color: var(--gk-ink);
  transform: translate3d(104%, 0, 0);
  visibility: hidden;
  pointer-events: none;
  scrollbar-width: none;
  transition: transform var(--dur-exit) var(--ease-exit), visibility 0s linear var(--dur-exit);
}
[data-phone-drawer][data-open="true"] {
  transform: translate3d(0, 0, 0);
  visibility: visible;
  pointer-events: auto;
  transition: transform var(--dur-drawer) var(--ease-enter), visibility 0s linear 0s;
}
[data-phone-drawer-title] {
  display: flex;
  align-items: center;
  min-height: 44px;
  margin: 0 0 10px;
  padding: 0 10px;
  color: var(--gk-ink);
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
  font-variation-settings: "SOFT" 100, "WONK" 0;
}
[data-phone-drawer-nav],
[data-phone-drawer-footer] {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
[data-phone-drawer-footer] {
  gap: 4px;
}
[data-phone-drawer-footer] {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--gk-border);
}
[data-phone-drawer] a,
[data-phone-drawer] button {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 56px;
  margin: 0;
  padding: 0 12px;
  border: 0;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--gk-ink);
  font: inherit;
  font-size: 17px;
  font-weight: 600;
  text-decoration: none;
  text-align: left;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background-color var(--dur-micro) var(--ease-state), transform var(--dur-micro) var(--ease-state);
}
[data-phone-drawer] a:active,
[data-phone-drawer] button:active {
  transform: scale(0.98);
}
[data-phone-drawer-glyph] {
  flex: none;
  color: var(--gk-link);
}
[data-phone-drawer] a[data-active="true"] {
  background: var(--gk-surface-2);
}
[data-phone-drawer] button[role="switch"] {
  justify-content: space-between;
  min-height: 48px;
  padding: 10px 12px;
  font-size: 16px;
}
[data-phone-drawer-track] {
  position: relative;
  flex: none;
  width: 44px;
  height: 26px;
  border-radius: var(--r-pill);
  background: var(--gk-border-strong);
  transition: background-color var(--dur-ui) var(--ease-state);
}
[data-phone-drawer-track]::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--gk-surface);
  box-shadow: var(--el-1);
  transition: transform var(--dur-ui) var(--ease-enter);
}
[data-phone-drawer] button[aria-checked="true"] [data-phone-drawer-track] {
  background: var(--gk-link);
}
[data-phone-drawer] button[aria-checked="true"] [data-phone-drawer-track]::after {
  transform: translate3d(18px, 0, 0);
}
[data-phone-drawer] button[data-kind="tide"] {
  min-height: 44px;
  color: var(--gk-ink-muted);
  font-size: var(--fs-body-sm);
}
[data-phone-drawer] button[data-kind="tide"] [data-phone-drawer-glyph] {
  color: var(--gk-ink-muted);
}
[data-phone-drawer] button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
@media (hover: hover) and (pointer: fine) {
  [data-phone-drawer] a:not([data-active="true"]):hover,
  [data-phone-drawer] button:not(:disabled):hover {
    background: var(--gk-surface-2);
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-phone-drawer],
  [data-phone-drawer-backdrop],
  [data-phone-hamburger],
  [data-phone-drawer-track],
  [data-phone-drawer-track]::after {
    transition: none !important;
  }
}
`;

export function FamilyDrawer(): ReactElement {
  const pathname: string = usePathname();
  const router: ReturnType<typeof useRouter> = useRouter();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const tide: ReturnType<typeof useTidePreference> = useTidePreference();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const isChildRoute: boolean = pathname === "/child";
  const role: string = session.snapshot?.role ?? "Parent";
  const isParent: boolean = role === "Parent" && !isChildRoute;

  const close = (): void => {
    setIsOpen(false);
  };

  useEffect((): (() => void) | undefined => {
    if (!isOpen) {
      return undefined;
    }
    const onKeyDown = (p_event: KeyboardEvent): void => {
      if (p_event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return (): void => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const go = (p_href: string): void => {
    close();
    router.push(p_href);
  };

  const logout = async (): Promise<void> => {
    await session.switchRole("Parent");
    close();
    router.push("/context-switch");
  };

  const seeAsChild = async (): Promise<void> => {
    await session.switchRole("Child");
    close();
    router.push("/child");
  };

  const seeAsParent = async (): Promise<void> => {
    await session.switchRole("Parent");
    close();
    router.push("/context-switch");
  };

  return (
    <>
      <style href="family-drawer" precedence="medium">
        {DRAWER_STYLES}
      </style>
      <button
        type="button"
        data-phone-hamburger
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="family-drawer"
        onClick={(): void => {
          setIsOpen((p_open: boolean) => !p_open);
        }}
      >
        {isOpen ? (
          <XIcon size={22} weight="regular" aria-hidden="true" />
        ) : (
          <ListIcon size={22} weight="regular" aria-hidden="true" />
        )}
      </button>
      <div
        data-phone-drawer-backdrop
        data-open={isOpen ? "true" : "false"}
        role="presentation"
        onClick={close}
      />
      <nav
        id="family-drawer"
        data-phone-drawer
        data-open={isOpen ? "true" : "false"}
        aria-label="Family menu"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <p data-phone-drawer-title>Menu</p>
        {isParent ? (
          <div data-phone-drawer-nav>
            {PARENT_ITEMS.map((p_item: DrawerItem) => (
              <a
                key={p_item.href}
                href={p_item.href}
                data-active={pathname === p_item.href ? "true" : "false"}
                onClick={(p_event: MouseEvent<HTMLAnchorElement>): void => {
                  p_event.preventDefault();
                  go(p_item.href);
                }}
              >
                <DrawerGlyph icon={p_item.icon} />
                {p_item.label}
              </a>
            ))}
          </div>
        ) : (
          <div data-phone-drawer-nav>
            <a
              href="/child"
              data-active={isChildRoute ? "true" : "false"}
              onClick={(p_event: MouseEvent<HTMLAnchorElement>): void => {
                p_event.preventDefault();
                go("/child");
              }}
            >
              <DrawerGlyph icon={HouseIcon} />
              Child's home
            </a>
          </div>
        )}
        <div data-phone-drawer-footer>
          <button
            type="button"
            role="switch"
            data-kind={isParent ? "child" : "parent"}
            aria-checked={!isParent}
            disabled={session.isSwitching}
            onClick={(): void => {
              if (isParent) {
                void seeAsChild();
                return;
              }
              void seeAsParent();
            }}
          >
            View as child
            <span data-phone-drawer-track aria-hidden="true" />
          </button>
          {isParent ? (
            <>
              <a
                href="/profile"
                data-active={pathname === "/profile" ? "true" : "false"}
                onClick={(p_event: MouseEvent<HTMLAnchorElement>): void => {
                  p_event.preventDefault();
                  go("/profile");
                }}
              >
                <DrawerGlyph icon={UserCircleIcon} />
                Profile
              </a>
              <a
                href="/plan"
                data-active={pathname === "/plan" ? "true" : "false"}
                onClick={(p_event: MouseEvent<HTMLAnchorElement>): void => {
                  p_event.preventDefault();
                  go("/plan");
                }}
              >
                <DrawerGlyph icon={CreditCardIcon} />
                Plan
              </a>
            </>
          ) : null}
          <button
            type="button"
            disabled={session.isSwitching}
            onClick={(): void => {
              void logout();
            }}
          >
            <DrawerGlyph icon={SignOutIcon} />
            Sign out
          </button>
          <button
            type="button"
            data-kind="tide"
            aria-pressed={tide.isPaused}
            onClick={tide.togglePaused}
          >
            <DrawerGlyph icon={tide.isPaused ? PlayIcon : PauseIcon} />
            {tide.isPaused ? "Play background" : "Pause background"}
          </button>
        </div>
      </nav>
    </>
  );
}
