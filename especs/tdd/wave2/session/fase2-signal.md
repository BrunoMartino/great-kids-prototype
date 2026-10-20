# Phase 2 signal — session Green (Child 403 / mock align)

## Context

Wave 2 resume from Pittore. Backend signal: family writes ignored the presentation store. New Red tests only (existing tests untouched).

Red tests:

- `tests/session/mock-session-align.test.ts`
- `tests/family/presentation-writes.test.ts`

Named breaks (confirmed Red):

- POST Child leaves `getMockSession().role` Parent
- Child presentation invite POST returns 201
- Cleared presentation plan PATCH returns 200
- Child presentation plan PATCH returns 200

Axes: happy (Parent plan Free), boundary (restore Parent; session stays Child after 403), negative (invalid role; missing session 401), adversarial (Child titular actor still 403; Admin mock not overwritten). No doubles.

## Red command

```bash
npx vitest run tests/session/mock-session-align.test.ts tests/family/presentation-writes.test.ts
```

## Green steps

DB: none. Range 020100–020199 unused.

1. `app/api/session/presentation-strategy.ts` — in `applyRole(p_role)`, after a valid Parent|Child strategy is stored, if `getMockSession().role` is not `Admin` and not `Operator`, set it to that Parent|Child. Do not insert `app_user`. Invalid role still throws before mutation.
2. Family titular writes (family lane owns the route files) consult `isPresentationPresent` / `getPresentation` / `ContextPolicy` — see family `fase2-signal.md`.
3. Panel staff stays on `getMockSession()`. Do not edit `internal/db/mock-session.ts`.
4. `p_` params, typed, no `any`, `queryRaw`, no ORM, no FE, no Babylon Gate.

## Verification

```bash
npx vitest run tests/session tests/family/presentation-writes.test.ts
```

Done when new tests pass and existing session tests still pass.

## Brownfield

After Green: `especs/tdd/wave2/session/refactor-fase2-signal.md` (do not apply).
