# Quality report — Nixpacks build and Next.js speed

Scope: Nixpacks/`next build` green plus Next.js performance. Babylon Gate, Lefthook, and squadre audits were not run (this invocation forbade installing or running the gate).

## 1. Root cause of the Nixpacks / `next build` failure

Coolify `npm run build` typecheck failed in `internal/storage/minio-adapter.ts`: DOM `fetch` `BodyInit` does not accept Node `Buffer<ArrayBufferLike>` (`@types/node` 26 vs `lib: ["dom"]`).

Secondary: Coolify’s Nixpacks snapshot of `nodejs_22` was **22.11.0**. Vitest/Rolldown engines need **>=22.12.0**.

## 2. Files changed and why

| File | Why |
|------|-----|
| `internal/storage/minio-adapter.ts` | Copy PUT bytes into `ArrayBuffer` so `fetch` body is `BodyInit`. |
| `package.json` / `package-lock.json` | Pin `@types/node` to 22.x; `engines.node` `>=22.12.0 <23`; `next dev --turbopack`. |
| `.nvmrc` | Nixpacks/Coolify major 22. |
| `nixpacks.toml` | Pin `nixpkgsArchive` to Node **22.14.0**; set `NIXPACKS_PATH` to silence UndefinedVar. |
| `next.config.ts` | Trace `db/migrations/**` into the image; drop `X-Powered-By`; optional `NEXT_DIST_DIR`. |
| `tsconfig.json` | Exclude `tests` from `next build` typecheck (Vitest still owns them). |
| `app/(family)/chrome/phone-chrome-decorator.tsx` | Stop importing panel `SurfaceFacade` into family client chrome. |
| `app/(family)/**/page.tsx`, `app/(panel)/**/page.tsx` | `next/dynamic` for screen components (phone chrome and providers unchanged). |
| `.gitignore` | Ignore `.next-verify`. |

Start remains `npm start` (`next start --hostname 0.0.0.0 --port 3000`) so `db/migrations` stay at process cwd. Standalone output was not used.

## 3. Local commands and exit codes

| Command | Result |
|---------|--------|
| `nixpacks plan .` | exit 0; archive `e6f23dc…`; Node package `nodejs_22` |
| `NEXT_DIST_DIR=.next-verify npm run build` | exit 0 (host Node 24; `.next` locked by a root `next dev`) |
| Docker `node:22-bookworm-slim`: `npm ci && npm rebuild better-sqlite3 && npm run build` | **BUILD_EXIT:0**, Node v22.23.3, compile 8.8s |
| `nixpacks build . --name great-kids-nixpacks-verify` | **Successfully Built**, `next build` compile 7.7s |
| Image `node -v` | **v22.14.0** |
| Image `ls /app/db/migrations` | `000000_schema.sql`, `080100_family_mission_title.sql`, `100100_demo_seed.sql` |

## 4. Next speed changes and expected effect

- **Dev:** Turbopack (`next dev --turbopack`) — faster first compile and HMR than webpack.
- **Client JS:** Each family/panel screen is a separate chunk (about 2–8 kB on top of 103 kB shared first load). Family chrome no longer pulls `app/api/panel/surface-facade`.
- **Build:** Tests are not typechecked by `next build`. First production compile ~8s on Node 22.

Phone chrome, MVC, Active Record, mock session, and DemoSeedFactory paths are unchanged.

## 5. Still broken / not this job

- Coolify redeploy is not done here. Local Nixpacks image is green; redeploy that commit on Coolify.
- Host `npm run build` without `NEXT_DIST_DIR` fails with EACCES on `.next` while the root Compose `next dev` holds that directory. Coolify/Nixpacks is unaffected.
- Local machine Node is 24; `engines` warns EBADENGINE there. The image is 22.14.0.
- `NIXPACKS_PATH` UndefinedVar: set in `nixpacks.toml` variables; confirm on the next Coolify log.
- No Babylon Gate run; no secrets rotated; no existing tests edited.
