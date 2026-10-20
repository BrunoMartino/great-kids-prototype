# Phase 1 — identity (adult-holder) Green

## Context

Wave 1 lane `identity`. Red tests import missing modules and assert titular / husk behavior.

Red tests:

- `tests/identity/holder-policy.test.ts`
- `tests/identity/app-user.test.ts`
- `tests/identity/family-husk.test.ts`
- `tests/identity/app-users-api.test.ts`
- `tests/identity/families-api.test.ts`

## Red command

```bash
npx vitest run tests/identity
```

Expected: fail because production modules are missing (cannot resolve `@/app/api/app-users/holder-policy`, `@/models/app_user`, husk service, route handlers).

## Green steps

DB: no new migration. Wave 0 `db/migrations/000000_schema.sql` already has `app_user`, `family_profile`, `family_diary`, `family`. Range 010100–010199 unused.

1. `models/app_user.ts` — Singleton Active Record (`private constructor`, `static get instance`, lazy `_instance`). `create(p_input)` via `queryRaw` binds. No password column. `auth_user_id` null. Unique email conflict throws.
2. `models/family_profile.ts` — Singleton AR. Insert empty envelopes `{ id, quiz_answer|rhythms|achievements: [] }`.
3. `models/family_diary.ts` — Singleton AR. Insert `{ id, notes: [] }` for `family_notes` and `mission_note`.
4. `models/family.ts` — Singleton AR. Reject `family_members` bare `[]`. Insert `{ id, members: [...] }` and plain `address` object. `p_` params only.
5. `app/api/app-users/holder-policy.ts` — `HolderPolicy.assertCanBeTitular(p_role)` allows Parent only; `assertCanChangePlan(p_actorUserId, p_holderUserId, p_actorRole)` allows only same id + Parent.
6. `app/api/app-users/titular-service.ts` — Policy then `AppUser.instance.create`. Map unique-email throw to a conflict the route can turn into 409.
7. `app/api/app-users/route.ts` — `POST` 201 TDD body; Child 400; duplicate email 409. `GET` `{ id, users: [...] }`.
8. `app/api/families/husk-service.ts` — Transaction: profile + diary + family. Invalid status rolls back (no orphan profile/diary). Holder must be Parent.
9. `app/api/families/route.ts` — `POST` `{ holder_user_id, status }` → 201 husk JSON; missing holder 400; Child holder 400.

Do not: passwords, auth tables, `.env`, repository, ORM, `any`, frontend, shared route registry file, Babylon Gate.

## Verification

```bash
npx vitest run tests/identity
```

Done when all identity tests pass.

## Frontend

N/A (`FE: —`).
