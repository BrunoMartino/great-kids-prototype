# Phase 2 — session (context-switch) Green

## Context

Wave 2 lane `session`. Red only. Tests import missing modules and lock Parent/Child mock presentation (INV-002: Child is a view, not an `app_user` login).

Red tests:

- `tests/session/context-policy.test.ts`
- `tests/session/presentation-strategy.test.ts`
- `tests/session/session-api.test.ts`

Axes: happy, boundary, negative, adversarial on Policy, Strategy, and session Route Handlers.

## Red command

```bash
npx vitest run tests/session
```

Expected: fail because production modules are missing (`@/policies/role`, `@/app/api/session/presentation-strategy`, `@/app/api/session/route`, `@/app/api/session/context/route`) or named exports are absent.

## Green steps

DB: no new migration. Wave 0 schema already has `app_user`. Range 020100–020199 unused.

1. `policies/role.ts` — class `ContextPolicy` with static methods `assertCanChangePlan(p_role)`, `assertCanInvite(p_role)`, `assertSessionPresent(p_present)`. Throw on Child (plan and invite) and on absent session (`p_present === false`). Parent allowed. GoF Policy.
2. `app/api/session/presentation-strategy.ts` — GoF Strategy: `ParentPresentationStrategy` / `ChildPresentationStrategy` plus `applyRole(p_role: string)` and `getPresentation()` returning `{ role: "Parent" | "Child", presentation: "parent" | "child" }`. In-memory store, default Parent without calling `applyRole`. Invalid role (including Admin / Operator / garbage) throws. No `app_user` insert. Clearing session: `clearPresentation()` sets present=false.
3. `app/api/session/route.ts` — `GET(p_request: Request)` returns 200 presentation JSON if session present, else 401. `DELETE(p_request: Request)` calls `clearPresentation()`.
4. `app/api/session/context/route.ts` — `POST(p_request: Request)` body `{ role }` Parent|Child → 200 `{ role, presentation }`; else 400. Uses Strategy + Policy. POST Child is a switch, not a clear.
5. Typed TypeScript, `p_` params, no `any`, no ORM, no frontend code, no `.env`, no Babylon Gate, no edits to `internal/db/mock-session.ts` (session store lives under `app/api/session/**`).

Do not: real Supabase Auth (mock only); Child login rows; panel Admin/Operator on this strategy; FE under `app/(family)/context-switch/**`.

## Verification

```bash
npx vitest run tests/session
```

Done when all session tests pass.

## Frontend verification

Pittore later (no FE code in Green):

- Control in `app/(family)/context-switch/**` switches Child views in the family app.
- Plan and titular edits stay blocked in Child view.
- Type-check, lint, build, and manual browser notes.

## Brownfield — post-Green playbook

After Green verification, create `especs/tdd/refactor-fase2.md`. Do not swap or edit `internal/db/mock-session.ts` in Green. Health and catalog still read that store.
