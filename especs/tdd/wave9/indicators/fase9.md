# Phase 9 — indicators (indicators-panel) Green

## Context

Wave 9 lane `indicators`. Persistence: none new. Queries only `family_calendar` and `family_mission`. Migration range 090200–090299: unused (DB: —).

Frontend owned path `app/(panel)/indicators/**` is Pittore — do not write it.

Red tests:

- `tests/indicators/indicators-api.test.ts`

Axes: empty zeros 200; completed matches SQL COUNT; scheduled counts envelope `scheduled` only; repeatable twice → `repeated` 1; no `indicators` table; Parent 403; Child 403.

Doubles: none. Partner: not asserting mock existence. Partner: sqlite, calendar PUT, cycle complete, and models stay real.

No new invariants beyond existing cycle/calendar data. Eventual read after write is allowed.

## Red command

```bash
npx vitest run tests/indicators
```

Expected: fail — cannot resolve `app/api/panel/indicators/route`.

## Green steps

GoF from developer docs (GitHub `BrunoMartino/design-patterns-exemples-GoF`; docs-mcp empty):

- Facade (`BuilderFacade`): `IndicatorsFacade` runs the three live queries so the panel Route Handler does not walk calendar envelopes or `family_mission` workflows. Clients may still query those hubs directly.

1. `app/api/panel/indicators/indicators-facade.ts` — `read()` → `{ id, scheduled, completed, repeated }`. `scheduled`: count suggestion items with `status = "scheduled"` across all `family_calendar` day envelopes (use `Family.list` + `FamilyCalendar.listByFamily` + `parseSuggestionsEnvelope`). `completed`: count `family_mission` rows with status `Completed` (`FamilyMission.listCompleted` per family). `repeated`: count of `(fam_id, mission_id)` groups with Completed count ≥ 2. Empty → zeros. Do not create an indicators table. Do not edit `models/family_calendar.ts` or `models/family_mission.ts`.
2. `app/api/panel/indicators/route.ts` — GET. `SurfaceFacade.assertPanel` (Admin/Operator). Parent/Child 403. 200 JSON object (not a fact-table row). Bound queries only.

Do not: frontend; edit existing tests; `.env`; Repository/ORM; Babylon Gate; diary lane files.

## Verification

```bash
npx vitest run tests/indicators
```

## Frontend

Pittore: `app/(panel)/indicators/**`. Not this phase.

## Brownfield

New module. After Green skip `refactor-fase9.md` (no legacy indicators reader).
