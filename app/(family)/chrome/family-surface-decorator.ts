import type { ReactNode } from "react";
import type { IFamilySurface } from "./family-surface-protocol";

export class FamilySurfaceDecorator implements IFamilySurface {
  public constructor(protected surface: IFamilySurface) {}

  public render(): ReactNode {
    return this.surface.render();
  }
}
