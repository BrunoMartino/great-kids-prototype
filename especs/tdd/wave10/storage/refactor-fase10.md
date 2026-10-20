# Refactor phase 10 — brownfield playbook (do not apply in Green)

## Context

Wave 10 Green added demo seed, object store, and panel admin APIs. Tests that lock the new behavior:

- `tests/identity/demo-seed.test.ts`
- `tests/session/family-id.test.ts`
- `tests/storage/local-disk-adapter.test.ts`
- `tests/panel/users-write-policy.test.ts`
- `tests/panel/materials-api.test.ts`
- `tests/panel/catalog-mutate.test.ts`
- `tests/panel/plans-api.test.ts`
- `tests/panel/categories-contexts-patch.test.ts`

## Legacy inventory

- `app/api/missions/route.ts` POST still creates catalog drafts (panel now also POSTs `/api/panel/catalog`).
- `app/api/missions/[id]/image-adapter.ts` still maps a path string only; uploads go through `internal/storage`.
- `app/api/panel/catalog/route.ts` GET predates POST.
- `PanelPolicy` / `StaffPolicy` remain no-op (prototype open).
- `Connection.applySchema` still applies only `000000_schema.sql`.

## Replacement map

- Staff catalog create: panel UI should call `/api/panel/catalog` (Factory) rather than only `/api/missions`.
- Image path writes: `ObjectStoreProtocol.put` → row `img_path` / `file_path`, not `ImageAdapter.toImgPath` alone.
- User block/edit: `UserWritePolicy` on `/api/panel/users` only.

## Removal steps

1. After Pittore Wave 11 uses panel routes, optionally stop calling `/api/missions` POST from the panel.
2. Leave `ImageAdapter` until no remaining path-only callers.
3. Do not fold `UserWritePolicy` into `PanelPolicy` while staff policies stay no-op.

## Do not touch

- Existing tests (`persisted-tester`).
- `.env` / secrets.
- `docker-compose.yml` (no local MinIO).
- `lefthook.yml`, quality gate, `000000_schema.sql`, `internal/db/connection.ts`.

## Obsolete tests

None. Demo seed is not auto-applied under Vitest, so empty-catalog / empty-users tests still pass.

## Verification

```bash
npx vitest run tests/identity/demo-seed.test.ts tests/session/family-id.test.ts tests/storage tests/panel
```
