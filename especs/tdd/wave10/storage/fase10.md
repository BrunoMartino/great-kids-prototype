# Phase 10 — Seeds, object store, catalog and admin APIs Green

## Context

Wave 10 single Scultore lane (DB + Backend). Frontend owned paths are `—` (Pittore paints in Wave 11). Flow: `backend-first` for this invocation (backend only; no frontend).

Red tests (23):

- `tests/identity/demo-seed.test.ts`
- `tests/session/family-id.test.ts`
- `tests/storage/local-disk-adapter.test.ts`
- `tests/panel/users-write-policy.test.ts`
- `tests/panel/materials-api.test.ts`
- `tests/panel/catalog-mutate.test.ts`
- `tests/panel/plans-api.test.ts`
- `tests/panel/categories-contexts-patch.test.ts`

Axes: demo family envelope + Plus; Child not an `app_user`; seed idempotent; `familyId` default; familyId survives Admin switch; LocalDisk put/delete under `great-kids/`; empty bytes rejected; factory LocalDisk when S3_* unset; forbidden dbruns keys; Admin block persists; Operator GET 200 / PATCH 403; deleted-shaped PATCH 400; curated create + soft-delete; upload path prefix; empty upload no path; panel catalog create draft; catalog soft-delete; mission image prefix; unknown category 400; plans list/create; plan inactive; category/context PATCH.

Doubles: none. Partner: not asserting mock existence. Partner: sqlite, LocalDisk filesystem, Factory, and models stay real. MinIO uncalled in Vitest.

Invariants: INV-002 (Child not an account; no photo keys in members), INV-004 (members/values envelopes), INV-005 (new catalog rows start `draft`).

## Red command

```bash
npx vitest run tests/identity/demo-seed.test.ts tests/session/family-id.test.ts tests/storage/local-disk-adapter.test.ts tests/panel/users-write-policy.test.ts tests/panel/materials-api.test.ts tests/panel/catalog-mutate.test.ts tests/panel/plans-api.test.ts tests/panel/categories-contexts-patch.test.ts
```

Expected: fail — missing `DemoSeedFactory`, `familyId`, `internal/storage/**`, `/api/panel/users`, `/api/panel/materials`, catalog POST/DELETE, `/api/panel/plans`, `/api/panel/categories`, `/api/panel/forecast-contexts`.

## Green steps

DB: `db/migrations/100100_demo_seed.sql` — fixed UUIDs, `INSERT OR IGNORE`. Wave 0 `Connection.applySchema` still only runs `000000_schema.sql` (same as 080100). Do not edit `000000_schema.sql` or `internal/db/connection.ts`. `DemoSeedFactory.applyIfMissing` reads the SQL after `FamilyMission.ensureTitleColumn`. Vitest does not auto-apply (keeps empty-catalog tests). Dev/prod: `getMockSession()` applies when `VITEST` is unset.

GoF from developer docs (docs-mcp `gof-design-patterns`; Policy from harness `architecture_rules.md` + user request — not in GoF ingest):

- Adapter (`EmailValidatorProtocol` / `EmailValidatorClassAdapter`): `ObjectStoreProtocol`; `LocalDiskAdapter`; `MinioAdapter` (bucket `bd-files` only).
- Strategy (`DiscountStrategy` on cart): `ObjectStoreStrategy` holds the current adapter; env selects MinIO vs local disk.
- Factory Method (`VehicleFactory.getVehicle` / `CarFactory`): `SeedFactory.getSeed` + `DemoSeedFactory`; `ObjectStoreFactory.getStore` / `EnvObjectStoreFactory`.
- Policy (harness): `UserWritePolicy` Admin-only on `/api/panel/users` writes. Existing `PanelPolicy` / `StaffPolicy` stay no-op.
- Singleton (`MyDatabaseClassic`): Active Record accessors (`CuratedMaterial`, existing models).

1. `db/migrations/100100_demo_seed.sql` — Admin, Operator, titular Parent (Marina Alves), Child member JSON only, Plus plan, demo family + profile/diary envelopes + address + `plan_id`, 5 published + 2 draft missions (Watch/Read/Make/Play), 4 `curated_material`, both quiz kinds, Accepted + Completed `family_mission`. Prefix `great-kids/` placeholders. Range 100100–100199.
2. `models/demo-seed-factory.ts` — Singleton Factory; `DEMO_FAMILY_ID`; `applyIfMissing`.
3. `internal/db/mock-session.ts` — `familyId` defaults to `DEMO_FAMILY_ID`; role stays Parent; apply seed outside Vitest.
4. `internal/storage/**` — protocol, adapters, strategy, env factory. LocalDisk when S3_* unset in Vitest; MinioAdapter when set; live missing S3 rejects. Never `dbruns-files` / `images.dbruns.com`.
5. Models: `curated_material.ts`; `AppUser` patch (no hard delete); `Plan` list/create/update; `Mission.softDelete` + title; `MissionCategory.update`; `ForecastContext.update`.
6. `app/api/panel/users` GET; `users/[id]` PATCH Admin Policy.
7. `app/api/panel/materials` CRUD + upload.
8. `app/api/panel/catalog` POST; `[id]` PATCH/DELETE; `[id]/image` upload. Reuse `DraftMissionFactory`.
9. `app/api/panel/plans` GET/POST; `[id]` PATCH.
10. `app/api/panel/categories` GET; `[id]` PATCH. `app/api/panel/forecast-contexts` GET; `[id]` PATCH.

Do not: frontend; edit existing tests; `.env`; docker-compose MinIO; change `PanelPolicy`/`StaffPolicy` no-ops; Babylon Gate; Repository/ORM; `any`.

## Verification

```bash
npx vitest run tests/identity/demo-seed.test.ts tests/session/family-id.test.ts tests/storage/local-disk-adapter.test.ts tests/panel/users-write-policy.test.ts tests/panel/materials-api.test.ts tests/panel/catalog-mutate.test.ts tests/panel/plans-api.test.ts tests/panel/categories-contexts-patch.test.ts
```

Done: all 23 pass. Then append `especs/testsReadme.md`. Brownfield: write `especs/tdd/wave10/storage/refactor-fase10.md`; do not apply.

## Brownfield only — post-Green playbook

After Green verification, create `especs/tdd/wave10/storage/refactor-fase10.md`; do not execute the legacy swap in Green.
