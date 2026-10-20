"use client";

import { useState, type MouseEvent, type ReactElement } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFamilySession } from "../context-switch/family-session-context";

type DrawerItem = {
  href: string;
  label: string;
};

const PARENT_ITEMS: readonly DrawerItem[] = [
  { href: "/quiz", label: "Quiz" },
  { href: "/calendar", label: "Calendar" },
  { href: "/forecast", label: "Forecast" },
  { href: "/missions/surprise", label: "Surprise" },
  { href: "/missions/cycle", label: "Cycle" },
  { href: "/diary", label: "Diary" },
];

const DRAWER_STYLES: string = `
[data-phone-hamburger] {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 11;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 14px;
  background: color-mix(in srgb, var(--color-ink) 8%, var(--color-paper));
  color: var(--color-ink);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
[data-phone-hamburger]:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
[data-phone-hamburger]:focus:not(:focus-visible) {
  outline: none;
}
[data-phone-hamburger]:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
[data-phone-hamburger-bars],
[data-phone-hamburger-bars]::before,
[data-phone-hamburger-bars]::after {
  display: block;
  width: 18px;
  height: 2px;
  border-radius: 999px;
  background: var(--color-ink);
}
[data-phone-hamburger-bars] {
  position: relative;
}
[data-phone-hamburger-bars]::before,
[data-phone-hamburger-bars]::after {
  content: "";
  position: absolute;
  left: 0;
}
[data-phone-hamburger-bars]::before { top: -6px; }
[data-phone-hamburger-bars]::after { top: 6px; }
[data-phone-drawer-backdrop] {
  position: absolute;
  inset: 0;
  z-index: 9;
  background: color-mix(in srgb, var(--color-ink) 36%, transparent);
  opacity: 0;
  pointer-events: none;
  transition: opacity 160ms ease-in;
}
[data-phone-drawer-backdrop][data-open="true"] {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-phone-drawer] {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  width: 78%;
  max-width: 320px;
  height: 100%;
  padding: 72px 16px 24px;
  box-sizing: border-box;
  background: var(--color-paper);
  color: var(--color-ink);
  opacity: 0;
  transform: translate3d(12px, 0, 0);
  pointer-events: none;
  transition: opacity 160ms ease-in, transform 160ms ease-in;
}
[data-phone-drawer][data-open="true"] {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  pointer-events: auto;
  transition: opacity 240ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
[data-phone-drawer-nav],
[data-phone-drawer-footer] {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
[data-phone-drawer-nav] { flex: 1 1 auto; }
[data-phone-drawer-footer] {
  flex: 0 0 auto;
  padding-top: 16px;
  border-top: 1px solid color-mix(in srgb, var(--color-ink) 10%, transparent);
}
[data-phone-drawer] a,
[data-phone-drawer] button {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin: 0;
  padding: 0 14px;
  border: 0;
  border-radius: 14px;
  background: color-mix(in srgb, var(--color-ink) 6%, var(--color-paper));
  color: var(--color-ink);
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  text-align: left;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
[data-phone-drawer] a[data-active="true"] {
  background: var(--color-primary);
  color: var(--color-paper);
}
[data-phone-drawer] button[data-kind="child"] {
  background: color-mix(in srgb, var(--color-child) 16%, var(--color-paper));
  color: var(--color-child);
}
[data-phone-drawer] button[data-kind="parent"] {
  background: color-mix(in srgb, var(--color-primary) 16%, var(--color-paper));
  color: var(--color-primary);
}
[data-phone-drawer] a:focus,
[data-phone-drawer] button:focus {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
[data-phone-drawer] a:focus:not(:focus-visible),
[data-phone-drawer] button:focus:not(:focus-visible) {
  outline: none;
}
[data-phone-drawer] a:focus-visible,
[data-phone-drawer] button:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  [data-phone-drawer],
  [data-phone-drawer-backdrop] {
    transition: none !important;
  }
}
`;

export function FamilyDrawer(): ReactElement {
  const pathname: string = usePathname();
  const router: ReturnType<typeof useRouter> = useRouter();
  const session: ReturnType<typeof useFamilySession> = useFamilySession();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const isChildRoute: boolean = pathname === "/child";
  const role: string = session.snapshot?.role ?? "Parent";
  const isParent: boolean = role === "Parent" && !isChildRoute;

  const close = (): void => {
    setIsOpen(false);
  };

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
    router.push("/quiz");
  };

  return (
    <>
      <style href="family-drawer" precedence="medium">
        {DRAWER_STYLES}
      </style>
      <button
        type="button"
        data-phone-hamburger
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="family-drawer"
        onClick={(): void => {
          setIsOpen((p_open: boolean) => !p_open);
        }}
      >
        <span data-phone-hamburger-bars aria-hidden="true" />
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
              Child's home
            </a>
          </div>
        )}
        <div data-phone-drawer-footer>
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
                Plan
              </a>
              <button
                type="button"
                data-kind="child"
                disabled={session.isSwitching}
                onClick={(): void => {
                  void seeAsChild();
                }}
              >
                See as child
              </button>
            </>
          ) : (
            <button
              type="button"
              data-kind="parent"
              disabled={session.isSwitching}
              onClick={(): void => {
                void seeAsParent();
              }}
            >
              See as parent
            </button>
          )}
          <button
            type="button"
            disabled={session.isSwitching}
            onClick={(): void => {
              void logout();
            }}
          >
            Sign out
          </button>
        </div>
      </nav>
    </>
  );
}
