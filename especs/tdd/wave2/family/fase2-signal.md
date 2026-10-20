# Phase 2 signal — family Green (presentation ContextPolicy)

## Context

Wave 2 resume. Plan/invite/members used `getMockSession().role` instead of presentation + `ContextPolicy`. Child 403 was UI-only.

Red tests: `tests/family/presentation-writes.test.ts` (plus session align tests).

Named breaks: Child invite 201, Child plan 200, cleared session plan 200.

## Red command

```bash
npx vitest run tests/family/presentation-writes.test.ts
```

## Green steps

DB: none. Range 020200–020299 unused.

1. `app/api/families/[id]/plan/route.ts` — if presentation absent → 401; `ContextPolicy.assertCanChangePlan(getPresentation().role)` then existing titular `InvitePolicy.assertCanChangePlan` using presentation role (not mock session). Child → 403. Do not persist on deny.
2. `app/api/families/[id]/invites/route.ts` — same: absent → 401; `ContextPolicy.assertCanInvite` + `InvitePolicy.assertCanInvite` with presentation role. POST and PATCH.
3. `app/api/families/[id]/members/route.ts` — absent → 401; `ContextPolicy.assertCanInvite` + titular `InvitePolicy` with presentation role.
4. Panel `/api/panel/**` stays on `getMockSession()`. Do not insert Child `app_user`. `p_` params, no `any`, `queryRaw`, no ORM.

Do not edit existing tests.

## Verification

```bash
npx vitest run tests/family
```

## Brownfield

After Green: `especs/tdd/wave2/family/refactor-fase2-signal.md` (do not apply).
