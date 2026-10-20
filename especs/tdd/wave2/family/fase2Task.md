# Phase 2 — family Green

- [x] Extend `models/family.ts`: `replaceMembers` (INV-004 envelope, reject photo keys, reject bare array), `replaceAddress` (plain object, reject envelope, reject invalid JSON before write), `updatePlanId` via `queryRaw`
- [x] `models/family_invite.ts` Singleton AR + statuses; unique `token_hash`; accept expired → `Expired` no join; accept → `Accepted` + append member; revoke → `Revoked`; persist `token_hash` only
- [x] `models/plan.ts` Singleton AR `findFree` / `findById` / `findByName` / `delete` (RESTRICT)
- [x] Commands: InviteAdult, AcceptInvite, RevokeInvite under `app/api/families/[id]/invites/`
- [x] Policies: InvitePolicy, MemberPolicy, AddressPolicy, SupportPolicy — not inline in handlers
- [x] Composite: members envelope writers on Family (no bare array)
- [x] Routes: invites POST/PATCH, members PUT, address PUT, `families/[id]/plan` PATCH, panel/families GET, panel/families/[id]/plan PATCH
- [x] `p_` params, typed, no `any`, `queryRaw`, no ORM/repo, no FE, no child photos, no payments, no MinIO
- [x] Phase tests pass: `npx vitest run tests/family`
- [x] Frontend: N/A (`FE: —`)
