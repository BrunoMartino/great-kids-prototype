"use client";

import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SurfaceModeSwitch } from "@/app/(family)/chrome/surface-mode-switch";
import { PanelThemeToggle } from "./panel-theme";
import {
  BooksIcon,
  ChartLineUpIcon,
  FoldersIcon,
  type Icon,
  ListIcon,
  MapPinIcon,
  QuestionIcon,
  TagIcon,
  UserGearIcon,
  UsersThreeIcon,
  WavesIcon,
  XIcon,
} from "@/app/design-system/icons";

type PanelFrameProps = {
  children: ReactNode;
};

type PanelNavItem = {
  href: string;
  label: string;
  icon: Icon;
};

type PanelNavGroup = {
  label: string;
  items: readonly PanelNavItem[];
};

/** Sidebar groups (MASTER §9.4): Content · People · Business. Same routes as before. */
const PANEL_NAV_GROUPS: readonly PanelNavGroup[] = [
  {
    label: "Content",
    items: [
      { href: "/catalog", label: "Catalog", icon: BooksIcon },
      { href: "/materials", label: "Materials", icon: FoldersIcon },
      { href: "/questions", label: "Questions", icon: QuestionIcon },
      { href: "/contexts", label: "Contexts", icon: MapPinIcon },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/families", label: "Families", icon: UsersThreeIcon },
      { href: "/users", label: "Users", icon: UserGearIcon },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/plans", label: "Plans", icon: TagIcon },
      { href: "/indicators", label: "Indicators", icon: ChartLineUpIcon },
    ],
  },
];

const PANEL_FRAME_STYLES: string = `
[data-panel-shell] {
  --adm-sidebar-width: 264px;
  position: relative;
  display: grid;
  grid-template-columns: var(--adm-sidebar-width) minmax(0, 1fr);
  width: 100%;
  max-width: 1920px;
  min-width: 0;
  min-height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0 auto;
}
[data-panel-sidebar] {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: var(--z-drawer);
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100vh;
  height: 100dvh;
  padding: 20px 12px;
  padding-left: max(12px, env(safe-area-inset-left, 0px));
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--adm-sidebar);
  color: var(--adm-sidebar-ink);
}
[data-panel-brand] {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 0 10px;
  border-radius: var(--r-sm);
  color: var(--adm-sidebar-ink);
  font-size: var(--fs-h3);
  font-weight: 700;
  letter-spacing: -0.01em;
  text-decoration: none;
}
[data-panel-brand] svg {
  flex: 0 0 auto;
  color: var(--adm-sidebar-bar);
}
[data-panel-nav] {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
[data-panel-nav-group] {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
[data-panel-nav-group-label] {
  margin: 0 0 4px;
  padding: 0 12px;
  color: var(--adm-sidebar-muted);
  font-size: var(--fs-caption);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
[data-panel-nav] a {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: var(--r-sm);
  color: var(--adm-sidebar-ink);
  font-size: var(--fs-body-sm);
  font-weight: 600;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background-color var(--dur-micro) var(--ease-state);
}
[data-panel-nav] a svg {
  flex: 0 0 auto;
}
[data-panel-nav] a[aria-current="page"] {
  background: var(--adm-sidebar-active);
}
[data-panel-nav] a[aria-current="page"]::before {
  content: "";
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 0;
  width: 3px;
  border-radius: var(--r-pill);
  background: var(--adm-sidebar-bar);
}
[data-panel-brand]:focus,
[data-panel-nav] a:focus,
[data-panel-menu-toggle]:focus {
  outline: 2px solid var(--adm-sidebar-bar);
  outline-offset: 2px;
}
[data-panel-brand]:focus:not(:focus-visible),
[data-panel-nav] a:focus:not(:focus-visible),
[data-panel-menu-toggle]:focus:not(:focus-visible) {
  outline: none;
}
[data-panel-brand]:focus-visible,
[data-panel-nav] a:focus-visible {
  outline: 2px solid var(--adm-sidebar-bar);
  outline-offset: 2px;
}
[data-panel-menu-toggle]:focus-visible {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}
[data-panel-content] {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
[data-panel-topbar] {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 64px;
  padding: 12px 24px;
  padding-top: max(12px, env(safe-area-inset-top, 0px));
  padding-right: max(24px, env(safe-area-inset-right, 0px));
  border-bottom: 1px solid var(--gk-border);
  background: var(--gk-surface);
}
[data-panel-topbar-title] {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  color: var(--gk-ink-muted);
  font-size: var(--fs-body-sm);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
[data-panel-topbar-title] strong {
  color: var(--gk-ink);
}
[data-panel-menu-toggle] {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0;
  padding: 0;
  border: 1px solid var(--gk-border-strong);
  border-radius: var(--r-sm);
  background: var(--gk-surface);
  color: var(--gk-ink);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
[data-panel-scrim] {
  display: none;
  margin: 0;
  padding: 0;
  border: 0;
  -webkit-appearance: none;
  appearance: none;
  cursor: default;
}
[data-panel-main] {
  flex: 1 1 auto;
  min-width: 0;
  padding: 24px;
  padding-right: max(24px, env(safe-area-inset-right, 0px));
  padding-bottom: max(24px, env(safe-area-inset-bottom, 0px));
}
@media (hover: hover) and (pointer: fine) {
  [data-panel-nav] a:not([aria-current="page"]):hover {
    background: var(--adm-sidebar-active);
  }
  [data-panel-menu-toggle]:hover {
    background: var(--gk-surface-2);
  }
}
@media (min-width: 1536px) {
  [data-panel-main] > * {
    max-width: 1440px;
  }
}
@media (min-width: 1024px) and (max-width: 1279.98px) {
  [data-panel-shell] {
    --adm-sidebar-width: 72px;
  }
  [data-panel-sidebar] {
    align-items: center;
    padding-inline: 12px;
  }
  [data-panel-brand] {
    padding: 0;
    justify-content: center;
    width: 48px;
  }
  [data-panel-brand-label],
  [data-panel-nav-label] {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    clip-path: inset(50%);
    white-space: nowrap;
  }
  [data-panel-nav-group-label] {
    width: 48px;
    height: 1px;
    margin: 0 auto 6px;
    padding: 0;
    overflow: hidden;
    background: var(--adm-sidebar-active);
    color: transparent;
  }
  [data-panel-nav] a {
    justify-content: center;
    width: 48px;
    padding: 0;
  }
}
@media (max-width: 1023.98px) {
  [data-panel-shell] {
    grid-template-columns: minmax(0, 1fr);
  }
  [data-panel-sidebar] {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    width: min(288px, 84vw);
    box-shadow: var(--el-3);
    transform: translate3d(-104%, 0, 0);
    visibility: hidden;
    transition: transform var(--dur-exit) var(--ease-exit), visibility 0s linear var(--dur-exit);
  }
  [data-panel-sidebar][data-open="true"] {
    transform: translate3d(0, 0, 0);
    visibility: visible;
    transition: transform var(--dur-drawer) var(--ease-enter), visibility 0s linear 0s;
  }
  [data-panel-scrim] {
    position: fixed;
    inset: 0;
    z-index: calc(var(--z-drawer) - 1);
    display: block;
    background: var(--gk-scrim);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--dur-exit) var(--ease-exit);
  }
  [data-panel-scrim][data-open="true"] {
    opacity: 1;
    pointer-events: auto;
    transition: opacity var(--dur-drawer) var(--ease-enter);
  }
  [data-panel-menu-toggle] {
    display: inline-flex;
  }
}
@media (max-width: 639.98px) {
  [data-panel-topbar],
  [data-panel-main] {
    padding-left: max(16px, env(safe-area-inset-left, 0px));
    padding-right: max(16px, env(safe-area-inset-right, 0px));
  }
  [data-panel-topbar-title] {
    display: none;
  }
  [data-panel-topbar] {
    justify-content: space-between;
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-panel-sidebar],
  [data-panel-scrim],
  [data-panel-nav] a {
    transition: none !important;
  }
}
`;

function isActive(p_path: string, p_href: string): boolean {
  return p_path === p_href || p_path.startsWith(`${p_href}/`);
}

function activeLabel(p_path: string): string {
  const items: readonly PanelNavItem[] = PANEL_NAV_GROUPS.flatMap(
    (p_group: PanelNavGroup): readonly PanelNavItem[] => p_group.items,
  );
  const match: PanelNavItem | undefined = items.find((p_item: PanelNavItem): boolean => {
    return isActive(p_path, p_item.href);
  });
  return match?.label ?? "Home";
}

export function PanelFrame(p_props: PanelFrameProps): ReactElement {
  const path: string = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(false);

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

  return (
    <div data-panel-shell>
      <style href="panel-frame" precedence="low">
        {PANEL_FRAME_STYLES}
      </style>
      <button
        type="button"
        data-panel-scrim
        data-open={isOpen ? "true" : "false"}
        tabIndex={-1}
        aria-label="Close navigation"
        onClick={(): void => {
          setIsOpen(false);
        }}
      />
      <aside
        id="panel-sidebar"
        data-panel-sidebar
        data-open={isOpen ? "true" : "false"}
        aria-label="Panel sidebar"
      >
        <a href="/" data-panel-brand>
          <WavesIcon size={26} weight="duotone" aria-hidden="true" />
          <span data-panel-brand-label>Panel</span>
        </a>
        <nav data-panel-nav aria-label="Panel">
          {PANEL_NAV_GROUPS.map((p_group: PanelNavGroup) => (
            <div key={p_group.label} data-panel-nav-group>
              <p data-panel-nav-group-label>{p_group.label}</p>
              {p_group.items.map((p_item: PanelNavItem) => {
                const Glyph: Icon = p_item.icon;
                const current: boolean = isActive(path, p_item.href);
                return (
                  <a
                    key={p_item.href}
                    href={p_item.href}
                    title={p_item.label}
                    aria-current={current ? "page" : undefined}
                  >
                    <Glyph size={20} weight={current ? "fill" : "regular"} aria-hidden="true" />
                    <span data-panel-nav-label>{p_item.label}</span>
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <div data-panel-content>
        <header data-panel-topbar>
          <button
            type="button"
            data-panel-menu-toggle
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isOpen}
            aria-controls="panel-sidebar"
            onClick={(): void => {
              setIsOpen((p_open: boolean): boolean => !p_open);
            }}
          >
            {isOpen ? (
              <XIcon size={20} aria-hidden="true" />
            ) : (
              <ListIcon size={20} aria-hidden="true" />
            )}
          </button>
          <p data-panel-topbar-title>
            Staff panel / <strong>{activeLabel(path)}</strong>
          </p>
          <PanelThemeToggle />
          <SurfaceModeSwitch />
        </header>
        <main data-panel-main>{p_props.children}</main>
      </div>
    </div>
  );
}
