"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { MoonIcon, SunIcon } from "@/app/design-system/icons";

export type PanelTheme = "light" | "dark";

type PanelThemeContextValue = {
  theme: PanelTheme;
  toggle: () => void;
};

type PanelThemeScopeProps = {
  chrome: string;
  children: ReactNode;
};

/** Per-device preference; light is the default (MASTER D5). */
const PANEL_THEME_STORAGE_KEY: string = "gk.panel.theme";

const PanelThemeContext = createContext<PanelThemeContextValue | null>(null);

const TOGGLE_STYLES: string = `
[data-panel-theme-toggle] {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  margin: 0;
  padding: 0 14px 0 10px;
  border: 1px solid var(--gk-border-strong);
  border-radius: var(--r-pill);
  background: var(--gk-surface);
  color: var(--gk-ink);
  font: inherit;
  font-size: var(--fs-body-sm);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: background-color var(--dur-micro) var(--ease-state), transform var(--dur-micro) var(--ease-state);
}
[data-panel-theme-toggle]:active {
  transform: scale(0.98);
}
[data-panel-theme-toggle]:focus-visible {
  outline: 2px solid var(--gk-focus);
  outline-offset: 2px;
}
@media (hover: hover) and (pointer: fine) {
  [data-panel-theme-toggle]:hover {
    background: var(--gk-surface-2);
  }
}
@media (max-width: 639px) {
  [data-panel-theme-label] {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
  [data-panel-theme-toggle] {
    padding: 0 10px;
  }
}
`;

function readStoredTheme(): PanelTheme {
  try {
    const stored: string | null = window.localStorage.getItem(PANEL_THEME_STORAGE_KEY);
    return stored === "dark" ? "dark" : "light";
  } catch (p_error: unknown) {
    void p_error;
    return "light";
  }
}

function storeTheme(p_theme: PanelTheme): void {
  try {
    window.localStorage.setItem(PANEL_THEME_STORAGE_KEY, p_theme);
  } catch (p_error: unknown) {
    void p_error;
  }
}

/** The panel root: carries `data-theme`, so dark tokens apply to the panel only. */
export function PanelThemeScope(p_props: PanelThemeScopeProps): ReactElement {
  const [theme, setTheme] = useState<PanelTheme>("light");

  useEffect(() => {
    setTheme(readStoredTheme());
  }, []);

  const value: PanelThemeContextValue = {
    theme,
    toggle: (): void => {
      const next: PanelTheme = theme === "dark" ? "light" : "dark";
      setTheme(next);
      storeTheme(next);
    },
  };

  return (
    <PanelThemeContext.Provider value={value}>
      <div data-surface="panel" data-chrome={p_props.chrome} data-theme={theme}>
        {p_props.children}
      </div>
    </PanelThemeContext.Provider>
  );
}

export function usePanelTheme(): PanelThemeContextValue {
  const value: PanelThemeContextValue | null = useContext(PanelThemeContext);
  if (value === null) {
    throw new Error("usePanelTheme requires PanelThemeScope");
  }
  return value;
}

export function PanelThemeToggle(): ReactElement {
  const panelTheme: PanelThemeContextValue = usePanelTheme();
  const isDark: boolean = panelTheme.theme === "dark";
  const nextLabel: string = isDark ? "Light" : "Dark";

  return (
    <>
      <style href="panel-theme-toggle" precedence="medium">
        {TOGGLE_STYLES}
      </style>
      <button
        type="button"
        data-panel-theme-toggle
        aria-label={`Switch to ${nextLabel.toLowerCase()} mode`}
        aria-pressed={isDark}
        onClick={panelTheme.toggle}
      >
        {isDark ? (
          <SunIcon size={18} weight="regular" aria-hidden="true" />
        ) : (
          <MoonIcon size={18} weight="regular" aria-hidden="true" />
        )}
        <span data-panel-theme-label>{nextLabel}</span>
      </button>
    </>
  );
}
