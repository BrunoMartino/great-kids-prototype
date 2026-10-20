# Phase 2 — session Green

## DB

- [x] No migration (range 020100–020199 unused; Wave 0 schema)

## Backend

- [x] `policies/role.ts` — `ContextPolicy.assertCanChangePlan(p_role)`, `assertCanInvite(p_role)`, `assertSessionPresent(p_present)` (throw on Child / absent)
- [x] `app/api/session/presentation-strategy.ts` — `ParentPresentationStrategy` / `ChildPresentationStrategy` + `applyRole` / `getPresentation` / `clearPresentation`; in-memory default Parent; no `app_user` insert; invalid role throws
- [x] `app/api/session/route.ts` — GET 200 presentation JSON if present else 401; DELETE clears
- [x] `app/api/session/context/route.ts` — POST `{ role }` Parent|Child → 200; else 400; Strategy + Policy
- [x] Typed, `p_` params, no `any`, no ORM, no `.env`, no Babylon Gate, no edits to `internal/db/mock-session.ts`
- [x] Phase tests pass: `npx vitest run tests/session`

## Frontend (Pittore verification only)

- [x] Control in `app/(family)/context-switch/**` switches Child views
- [x] Plan and titular edits blocked in Child view
- [x] Type-check, lint, build, manual notes

## Brownfield

- [x] After Green: create `especs/tdd/refactor-fase2.md` (do not apply; do not edit `internal/db/mock-session.ts` in Green)
