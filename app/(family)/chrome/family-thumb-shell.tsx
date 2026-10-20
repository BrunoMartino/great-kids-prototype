"use client";

import type { ReactElement, ReactNode } from "react";

type FamilyThumbShellProps = {
  content: ReactNode;
  actions?: ReactNode;
};

const THUMB_STYLES: string = `
[data-family-thumb-content],
[data-family-thumb-actions] {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
[data-family-thumb-content] {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overflow-anchor: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--color-ink) 22%, transparent) transparent;
}
[data-family-thumb-content]::-webkit-scrollbar {
  width: 4px;
}
[data-family-thumb-content]::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-ink) 22%, transparent);
  border-radius: 999px;
}
[data-family-thumb-actions] {
  flex: 0 0 auto;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid color-mix(in srgb, var(--color-ink) 10%, transparent);
  background: var(--color-paper);
}
[data-phone-body] [data-quiz-scroll],
[data-phone-body] [data-calendar-scroll],
[data-phone-body] [data-forecast-scroll],
[data-phone-body] [data-diary-scroll],
[data-phone-body] [data-plan-scroll],
[data-phone-body] [data-child-scroll],
[data-phone-body] [data-profile-scroll],
[data-phone-body] [data-surprise-scroll],
[data-phone-body] [data-cycle-scroll],
[data-phone-body] [data-completed-scroll],
[data-phone-body] [data-mascot-scroll],
[data-phone-body] [data-context-switch-scroll] {
  overflow-y: hidden;
}
`;

export function FamilyThumbShell(p_props: FamilyThumbShellProps): ReactElement {
  return (
    <>
      <style href="family-thumb-shell" precedence="medium">
        {THUMB_STYLES}
      </style>
      <div data-family-thumb-content>{p_props.content}</div>
      {p_props.actions !== undefined ? (
        <div data-family-thumb-actions>{p_props.actions}</div>
      ) : null}
    </>
  );
}
