import { defineConfig, devices } from "@playwright/test";

/**
 * Default: a dedicated `next dev` on port 3100 (own distDir, so it never shares `.next` with the
 * docker dev server). Reuse a running app with `E2E_BASE_URL=http://localhost:3000 npm run test:e2e`.
 */
const PORT: string = process.env.E2E_PORT ?? "3100";
const BASE_URL: string = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.e2e.ts",
  outputDir: "./test-results/e2e-artifacts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  globalSetup: "./tests/e2e/global-setup.ts",
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    colorScheme: "light",
    reducedMotion: "reduce",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npx next dev --turbopack --port ${PORT}`,
    env: { NEXT_DIST_DIR: ".next-verify" },
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
