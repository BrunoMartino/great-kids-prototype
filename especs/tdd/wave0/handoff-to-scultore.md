# Handoff to Scultore — Wave 0

Wave 0 Frontend is done. Start Wave 1 after this.

## Files written per lane (platform)

- `app/layout.tsx`
- `app/(panel)/layout.tsx`
- `app/(family)/layout.tsx`
- `especs/tdd/wave0/platform/frontend-verification.md`

Mode: empty shells. `/amaterasu-paint` skipped (handoff: no screens; owned paths are the three layouts only). Soft familial colors, scoped per surface. No Flowbite. No phone chrome.

## FE checkboxes

All four Frontend boxes in `especs/tdd/wave0/platform/fase0Task.md` are checked.

## Type-check / lint / build

- Type-check: `npx tsc --noEmit` — pass.
- Lint: not present (no project lint script or config).
- Build: `npx next build` — fail. See backend signal.

## Router blocks merged

None. Wave 0 only adds the three layout files. No `frontend/src/portals/*`.

## Canva

- Issues: viewport height cascade and document font/text-size-adjust on Safari/Firefox/Chrome for empty shells.
- Fixes: height fallbacks (`100%` → `100vh` → `-webkit-fill-available` → `100dvh`), `color-scheme: light`, React 19 style hoist, `viewportFit: cover` on root.
- Manual browser verification: not run (no group pages; Next cannot load config).

## Graph (scribe)

Blocked. CLI is on PATH (`graphify` 0.9.65). `graphify-out/` is missing. Integration `.cursor/rules/graphify.mdc` is missing. Harness templates not touched.

Needs user approval before:

```bash
graphify cursor install --project
graphify .
```

## Backend signals

### 1 — Next cannot load `next.config.ts` on TypeScript 7

- Feature: platform (Wave 0 Ops/BE)
- Path: `package.json` `typescript` `^7.0.2`; Next reads it from `node_modules/next/dist/build/next-config-ts/transpile-config.js` (`ts.sys.fileExists`)
- Harness / measurement: `npx next build` exit 1: `TypeError: Cannot read properties of undefined (reading 'fileExists')`
- Evidence: Next 15.5.28 `getTsConfig` requires `typescript.sys`. TypeScript 7.0.2 does not provide it. `npx tsc --noEmit` still passes.
- Suggested correction: pin `typescript` to 5.x until Next supports TypeScript 7. Do not change layout files for this.

## Not done

- `next build` green (blocked on signal above).
- Browser mount of panel/family layouts (no pages in Wave 0; Next server cannot start).
- Graphify generate (`graphify-out/`).
- Phone chrome (Wave 3).
- Design system `MASTER.md` (out of Wave 0 owned paths).
