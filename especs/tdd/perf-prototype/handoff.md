# Perf prototype — handoff

## Done in code

- Family layout seeds `FamilySessionProvider` from `getPresentation()` (no first-paint `/api/session`).
- SQLite: `WAL`, `busy_timeout=5000`, `synchronous=NORMAL`.
- Warm-up: `getConnection()` in root `app/layout.tsx` (Node Server Component). Next `instrumentation.ts` cannot load `better-sqlite3` (Edge compile / `fs`).
- Parallel GETs: profile, forecast, child session contexts.
- New tests: `tests/db/sqlite-pragmas.test.ts`.

## Local check

- `/quiz` network: only `/api/.../quiz` (no blocking `/api/session`).

## Coolify (blocked)

- Healthcheck enable refused while `great-kids-prototype` (`xrqakj8y5fpxcku29fs5grx8`) is running.
- Human must **stop** the app in Coolify, then agent: update healthcheck → deploy.
- Code changes need git push before deploy picks them up.

## Prod baseline (pre-code-deploy)

- HTML/API TTFB still variable (~0.5–1.8s cold).
