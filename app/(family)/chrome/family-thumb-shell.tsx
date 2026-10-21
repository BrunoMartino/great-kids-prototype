"use client";

import type { ReactElement, ReactNode } from "react";

type FamilyThumbShellProps = {
  /** Screen title (Fraunces, header left; the hamburger sits top-right). */
  title?: ReactNode;
  /** Context line above the title (date, week, step). */
  sub?: ReactNode;
  /** Replaces the plain header with a tide hero (home screens). */
  hero?: ReactNode;
  content: ReactNode;
  /** The screen's primary CTA, docked in the thumb zone. */
  actions?: ReactNode;
};

/**
 * Screen layout of the preview phones (MASTER §9.4): header, scrolling body,
 * bottom action bar. Styles live in `family-ui-styles.ts`.
 */
export function FamilyThumbShell(p_props: FamilyThumbShellProps): ReactElement {
  const hasActions: boolean = p_props.actions !== undefined && p_props.actions !== null;
  const hasHead: boolean = p_props.title !== undefined && p_props.hero === undefined;

  return (
    <div data-gk-screen data-gk-has-actions={hasActions ? "true" : "false"}>
      {p_props.hero}
      {hasHead ? (
        <header data-gk-head>
          {p_props.sub !== undefined ? <p data-gk-sub>{p_props.sub}</p> : null}
          <h1>{p_props.title}</h1>
        </header>
      ) : null}
      <div data-gk-scroll data-family-thumb-content>
        {p_props.content}
      </div>
      {hasActions ? (
        <div data-gk-action-bar data-family-thumb-actions>
          {p_props.actions}
        </div>
      ) : null}
    </div>
  );
}
