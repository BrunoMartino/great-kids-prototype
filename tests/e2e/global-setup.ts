import type { FullConfig } from "@playwright/test";

/** Compiles every route once, so a cold `next dev` does not eat the per-test timeout. */
const WARM_ROUTES: readonly string[] = [
  "/context-switch",
  "/child",
  "/calendar",
  "/quiz",
  "/forecast",
  "/diary",
  "/missions/cycle",
  "/missions/completed",
  "/missions/mascot",
  "/missions/surprise",
  "/profile",
  "/plan",
  "/",
  "/catalog",
  "/materials",
  "/questions",
  "/contexts",
  "/families",
  "/users",
  "/plans",
  "/indicators",
];

export default async function globalSetup(p_config: FullConfig): Promise<void> {
  const baseURL: string | undefined = p_config.projects[0]?.use.baseURL;
  if (baseURL === undefined) {
    return;
  }
  for (const route of WARM_ROUTES) {
    try {
      await fetch(new URL(route, baseURL), { signal: AbortSignal.timeout(180_000) });
    } catch (p_error: unknown) {
      void p_error;
    }
  }
}
