# Handoff to Scultore — Wave 2

Wave 2 Frontend painted. Do not start Wave 3 until the user starts Scultore again. Session FE is done; family and catalog-fiche had no Frontend.

## Files written per lane

### session

- `app/(family)/context-switch/page.tsx`
- `app/(family)/context-switch/family-session-context.tsx`
- `app/(family)/context-switch/context-switch-control.tsx`
- `app/(family)/context-switch/context-switch-screen.tsx`
- `app/(family)/layout.tsx` — shared touchpoint: `FamilySessionProvider` + `ContextSwitchControl` + minimum phone chrome (Wave 3 still owns `app/(family)/chrome/**`)
- `MASTER.md` — family tokens

### family

None (`FE: —`)

### catalog-fiche

None (`FE: —`)

## FE checkboxes

`especs/tdd/wave2/session/fase2Task.md` — all three Frontend items marked.

## Type-check / lint / build

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass |
| Lint | Not configured (no project lint script) |
| `npm run build` | Pass (`/context-switch` static) |

## Verification

`especs/tdd/wave2/session/frontend-verification.md`

## Router blocks merged

No `frontend/src/portals/*`. Context-switch control and session provider merged into `app/(family)/layout.tsx` only. Panel layout untouched.

## Canva

Issues: Safari/Firefox `color-mix` / `dvh` / overlay-in-scrollport / reduced-motion infinite loader / UA buttons. Fixes in family layout + context-switch screen/control (`color-mix` fallbacks, `svh`/`lvh`, inner scroller, overlay sibling, `inert`, `appearance`, `font-weight: 600`). Manual still needed: iOS Safari URL-bar, Firefox tab/`inert`, reduced-motion on a real device.

## Graph

Blocked. CLI `graphify 0.9.65` is installed; `graphify-out/` does not exist. Scribe did not write the graph. Commands awaiting user yes:

```bash
graphify cursor install --project
graphify .
```

Harness templates not touched.

## Backend signals

### Family writes ignore presentation store

- Feature: context-switch / family document
- Path: `app/api/families/[id]/plan/route.ts`, `app/api/families/[id]/invites/route.ts`, `app/api/families/[id]/members/route.ts`, `app/api/families/[id]/address/route.ts`
- Harness / TDD: `ContextPolicy` on Child plan/invite; TDD: subsequent family writes consult Policy; Child gets 403
- Evidence: these handlers call `getMockSession().role` (`internal/db/mock-session.ts`), not `getPresentation()` / `ContextPolicy` from `app/api/session/presentation-strategy.ts`. FE Child switch does not change that store. Child view is blocked in UI only.
- Suggested correction: family titular writes (plan, invite, members) read presentation role and run `ContextPolicy.assertCanChangePlan` / `assertCanInvite`. Do not insert a Child `app_user`. Panel staff mock stays on `getMockSession()`.

## Not done

- Wave 3 `app/(family)/chrome/**` (full parent-shell). Minimum CSS frame is in family layout only.
- Graphify initial build (needs user approval).
- Project lint (no toolchain in `package.json`).
- Live 403 from family APIs while presentation is Child (blocked by the signal above).
