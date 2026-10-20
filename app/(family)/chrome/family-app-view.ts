import type { ReactNode } from "react";
import type { IFamilySurface } from "./family-surface-protocol";

export class FamilyAppView implements IFamilySurface {
  public constructor(private p_children: ReactNode) {}

  public render(): ReactNode {
    return this.p_children;
  }
}
