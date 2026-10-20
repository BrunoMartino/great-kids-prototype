# Phase 2 — family (wave 2) Green

## Context

Wave 2 lane `family`. Phase Red only is done. Tests import missing modules and missing `Family.instance` methods.

Red tests:

- `tests/family/invite-policy.test.ts`
- `tests/family/family-invite.test.ts`
- `tests/family/invites-api.test.ts`
- `tests/family/member-policy.test.ts`
- `tests/family/members-envelope.test.ts`
- `tests/family/members-api.test.ts`
- `tests/family/address-policy.test.ts`
- `tests/family/family-address.test.ts`
- `tests/family/address-api.test.ts`
- `tests/family/support-policy.test.ts`
- `tests/family/plan.test.ts`
- `tests/family/panel-families-api.test.ts`

Helper (not a test): `tests/family/helpers.ts`

Features: adult-invite, members-without-app (INV-002, INV-004), family-address, families-subscriptions.

## Red command

```bash
npx vitest run tests/family
```

Expected: fail because production modules are missing (`@/models/family_invite`, `@/models/plan`, invite/member/address/support policies, route handlers) or `Family.instance.replaceMembers` / `replaceAddress` / `updatePlanId` is not a function.

## Green steps

DB: no new migration. Range 020200–020299 unused. Wave 0 schema already has `family`, `family_invite`, `plan`, generated `city`/`state`, Free seed `24bcd40e-7ae3-581c-b8b9-65b1f11b0ac1`.

Layer order: DB (none) → Backend. FE: none.

1. Extend `models/family.ts` only in this lane: `replaceMembers(p_familyId, p_envelope)` (INV-004 envelope `{ id, members: [] }`, reject photo/img/image keys, reject bare array), `replaceAddress(p_familyId, p_address)` (plain object `{ street, number, neighborhood, city, state, zip_code }`, reject `{ id, address: [] }`, reject invalid JSON string, throw before write), `updatePlanId(p_familyId, p_planId)` via `queryRaw` (unknown `plan_id` throws FK). Singleton already exists. Do not change husk `insert` contract.
2. `models/family_invite.ts` — Singleton Active Record + statuses `Pending` | `Accepted` | `Revoked` | `Expired`. Unique `token_hash`. `create` Pending. `accept` expired (`expires_at` in the past ISO) → `Expired`, do not append `family_members`. Unexpired accept → `Accepted` + append `{ user_id, user_nickname, user_role }` (no photo key; nickname from email local-part or given nick). `revoke` → `Revoked`. Persist `token_hash` only (hash in Command).
3. `models/plan.ts` — Singleton AR `findFree()` (name literal `Free`, seed id), `findById` (unknown uuid → `null`), `findByName` (bind params), `delete` (RESTRICT if `family.plan_id` references it).
4. Commands (GoF Command) under `app/api/families/[id]/invites/`: `InviteAdult`, `AcceptInvite`, `RevokeInvite`. Hash token in Command; never return raw token.
5. Policies (not inline in handlers):
   - `app/api/families/[id]/invites/invite-policy.ts` — `InvitePolicy.assertCanInvite(p_actorUserId, p_actorRole, p_holderUserId)`; `assertCanChangePlan(p_actorUserId, p_holderUserId, p_actorRole)`. Titular Parent only for invite; Child denied (INV-002).
   - `app/api/families/[id]/members/member-policy.ts` — `MemberPolicy.assertWrite(p_envelope)` plus titular write at the route. Reject photo/img/image, Child+`auth_user_id` login, bare array.
   - `app/api/families/[id]/address/address-policy.ts` — `AddressPolicy.assertCanWrite(p_actorUserId, p_actorRole, p_holderUserId)`. Titular Parent or Admin; invited Parent and Child denied.
   - `app/api/panel/families/support-policy.ts` — `SupportPolicy.assertPanel(p_actorRole)` Operator/Admin; Parent/Child throw. `assertCanChangeFamilyPlan(p_actorUserId, p_holderUserId, p_actorRole)` titular Parent ok; invited throws.
6. Composite: members envelope writers on `Family.replaceMembers` (hub document + members list). Do not write bare arrays.
7. Routes:
   - `app/api/families/[id]/invites/route.ts` — POST 201 `{ email, role: "Parent", status: "Pending", id, expires_at }` no `token`; PATCH accept 200 `{ status: "Accepted" }` / revoke 200 `Revoked`; non-titular POST 403 (`x-actor-user-id`); expired accept 409 `{ status: "Expired" }`. Next 15 `params: Promise<{ id }>`.
   - `app/api/families/[id]/members/route.ts` — PUT 200 same envelope; photo 400; non-titular 403; bare array 400.
   - `app/api/families/[id]/address/route.ts` — PUT 200 echo plain object; envelope 400; non-titular 403; empty city 200.
   - `app/api/families/[id]/plan/route.ts` — PATCH titular Parent 200 `{ id, plan_id }`; invited Parent 403.
   - `app/api/panel/families/route.ts` — GET 200 `{ id, families: [{ id, status: "active", plan: { id, name, status } | null, invites: [] }] }`.
   - `app/api/panel/families/[id]/plan/route.ts` — Operator/Admin PATCH; Parent 403; unknown `plan_id` 404.
8. `p_` params, typed, no `any`, `queryRaw`, no ORM/repo, no FE, no child photos, no payments, no MinIO.

Actor: header `x-actor-user-id` = holder or invited id. Role from `getMockSession().role` (Wave 0 store; default Parent). Titular = husk holder (first `family_members.members` `user_id`). Do not edit `internal/db/mock-session.ts`.

Do not write: `app/api/families/route.ts`, `app/api/families/husk-service.ts`, `models/mission*`, `app/api/missions/**`, `app/api/session/**`, `policies/role`, `app/api/app-users/**`, existing tests, FE, `.env`, Babylon Gate.

Do not re-seed Free. Plan AR must find the schema seed.

## Verification

```bash
npx vitest run tests/family
```

Done when all family tests pass. Do not run or weaken Babylon Gate.

## Frontend

N/A (`FE: —`).

## Brownfield

`models/family.ts` is extended, not replaced. Do not swap husk `insert`. After Green verification, skip `especs/tdd/refactor-fase2.md` unless a later explicit request removes legacy callers.
