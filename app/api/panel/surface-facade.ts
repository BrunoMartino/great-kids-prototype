import { PanelPolicy } from "@/app/api/panel/panel-policy";

export type SurfaceChrome = {
  chrome: "none" | "iphone-15-pro-max";
};

export class SurfaceFacade {
  public constructor(private panelPolicy: typeof PanelPolicy = PanelPolicy) {}

  public panelSurface(): SurfaceChrome {
    return { chrome: "none" };
  }

  public familySurface(): SurfaceChrome {
    return { chrome: "iphone-15-pro-max" };
  }

  public assertPanel(p_role: string): void {
    this.panelPolicy.assertStaff(p_role);
  }
}
