"use client";

import type { ReactElement } from "react";

export type FamilyNavArea =
  | "quiz"
  | "profile"
  | "calendar"
  | "forecast"
  | "surprise"
  | "cycle"
  | "completed"
  | "diary";

type FamilyNavProps = {
  familyId: string;
  active: FamilyNavArea;
};

/** Wave 12: hamburger drawer owns family navigation. */
export function FamilyNav(p_props: FamilyNavProps): ReactElement | null {
  void p_props;
  return null;
}
