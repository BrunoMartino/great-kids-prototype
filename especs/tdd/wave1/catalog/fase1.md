# Phase 1 — catalog (activity-library) Green

## Context

Wave 1 lane `catalog`. Red tests import missing modules and assert seeded categories, Factory drafts, and Parent 403.

Red tests:

- `tests/catalog/mission-categories.test.ts`
- `tests/catalog/mission-factory.test.ts`
- `tests/catalog/missions-api.test.ts`

## Red command

```bash
npx vitest run tests/catalog
```

Expected: fail because production modules are missing.

## Green steps

DB: no new migration. Wave 0 already created `mission_category` / `mission` and seeded twelve slugs. Range 010200–010299 unused.

1. `models/mission_category.ts` — Singleton AR. List by slug. `create(p_input)` via `queryRaw`; duplicate slug throws.
2. `models/mission.ts` — Singleton AR. Insert/list with optional `category_id` filter. `values` JSON envelope.
3. `app/api/missions/mission-factory.ts` — GoF Factory Method: abstract `MissionFactory.getMission(p_input)` + `create`; concrete `DraftMissionFactory` sets `review_status=draft`, `values: { id, values: [] }`, required schema defaults (`status` active, `type` Activity, `format` Quick-Win). Reject missing/unknown `category_id`.
4. `app/api/missions/staff-policy.ts` — Admin and Operator allow; Parent and Child throw/deny (403 at the route).
5. `app/api/mission-categories/route.ts` — Staff GET `{ id, categories: [...] }` (12 seeds). Staff POST 201 `{ id, category }`; duplicate slug 409; Parent POST 403.
6. `app/api/missions/route.ts` — Staff POST Factory 201 `{ id, mission: { id, category_id, review_status } }`. Staff GET envelope; `?category_id=` filter. Parent GET/POST 403. Empty list `{ id, missions: [] }`.

queryRaw, `p_` params, no `any`, no ORM, no repository, JSON envelopes, no `.env`, no frontend.

## Verification

```bash
npx vitest run tests/catalog
```

Done when all catalog tests pass.

## Frontend

N/A (`FE: —`).
