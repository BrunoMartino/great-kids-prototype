# Phase 7 — surprise (surprise-mission) Green

## Context

Wave 7 lane `surprise`. Wave 0 owns `family_mission` DDL. Migration range 070200–070299 unused.

Frontend owned paths `app/(family)/missions/surprise/**` are Pittore — do not write them.

Red tests:

- `tests/surprise/selection-strategy.test.ts`
- `tests/surprise/accepted-factory.test.ts`
- `tests/surprise/surprise-api.test.ts`

Axes: published catalog id; drafts → null; completed non-repeatable skip (no draft fallback); injection family id as data; Factory Accepted insert; unpublished refused no row; missing id no row; injection fam_id no insert; POST one published Accepted with catalog title; empty `{ id, mission_id: null }` no invented copy; Child 403; injection family id not 500.

Doubles: none. Partner: not asserting mock existence. Partner: `CatalogPickStrategy` + sqlite stay real (Wave 6 pick).

## Red command

```bash
npx vitest run tests/surprise
```

Expected: fail — cannot resolve surprise strategy/factory/route or `models/family_mission`.

## Green steps

DB: none.

GoF from developer docs (docs-mcp `gof-design-patterns`; fallback GitHub `BrunoMartino/design-patterns-exemples-GoF`):

- Strategy (DiscountStrategy class shape): `SurpriseSelectionStrategy` uses `CatalogPickStrategy.filter`; first candidate id or `null`. Never invents copy. Never returns unpublished.
- Factory (car/simple factory / `MissionFactory` getMission shape in this repo’s catalog): `AcceptedFamilyMissionFactory` creates `family_mission` `Accepted` from a published id only.

1. `models/family_mission.ts` — Active Record singleton. `insertAccepted(p_famId, p_missionId)` via `queryRaw`. Columns: `id, fam_id, mission_id, status='Accepted', accepted_at, created_at, updated_at`. No unique `(fam_id, mission_id)`. `findById`. Typed, `p_` params, no `any`.
2. `app/api/families/[id]/missions/surprise/selection-strategy.ts` — `choose(p_input): string | null`. Delegates to `CatalogPickStrategy`. Empty / exhausted non-repeatable → `null` (do not pick drafts).
3. `app/api/families/[id]/missions/surprise/accepted-factory.ts` — `create(p_familyId, p_missionId)`. Load `Mission.findById`; require `review_status=published` and `status=active`; else throw. Insert via model. Return `{ id, mission_id, status: "Accepted", title, description, review_status }`.
4. `app/api/families/[id]/missions/surprise/route.ts` — POST Parent `{}`. Strategy then Factory. Hit → catalog payload. Miss → `{ id, mission_id: null }` (request uuid, no title/description, no row). `GpsPolicy.assertCanEdit`. Unknown family 404. Child 403. Bound params.

Do not: frontend; generated title/description; family_mission cycle (Wave 8); edit existing tests; `.env`; migrations; Repository/ORM.

## Verification

```bash
npx vitest run tests/surprise
```

## Frontend

Pittore: `app/(family)/missions/surprise/**`. Not this phase.

## Brownfield

New modules only. Skip `refactor-fase7.md`.
