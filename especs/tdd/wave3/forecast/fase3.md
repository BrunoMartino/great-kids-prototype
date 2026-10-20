# Phase 3 — forecast (forecast-contexts) Green

## Context

Wave 3 lane `forecast`. Wave 0 already seeds four `forecast_context` rows and owns DDL. No new migration (range 030300–030399 unused).

Red tests:

- `tests/forecast/forecast-context.test.ts`
- `tests/forecast/mission-forecast-context.test.ts`
- `tests/forecast/forecast-api.test.ts`
- `tests/forecast/context-filter-strategy.test.ts`
- `tests/forecast/weather-adapter.test.ts`

Live weather API is ⛔ blocked: Adapter path-only, unused.

PUT path lives under owned `app/api/forecast-contexts/**` as `/api/forecast-contexts/missions/[id]` (TDD table said `/api/missions/{id}/contexts`; that path is catalog-fiche owned).

## Red command

```bash
npx vitest run tests/forecast
```

Expected: fail — missing models and `app/api/forecast-contexts/**`.

## Green steps

1. `models/forecast_context.ts` — Singleton AR `list`, `findBySlug`, `findById` via `queryRaw`. Seeds already in Wave 0: rain `26533182-…`, holiday `4a8e6fcd-…`, christmas `7c17c48d-…`, back-to-school `2ff3462e-…`.
2. `models/mission_forecast_context.ts` — Singleton AR `replaceSet(p_missionId, p_contextIds)`: reject duplicate ids in the payload; reject unknown context_id / bad FK; allow unpublished missions; replace existing links. UNIQUE (mission_id, context_id).
3. `app/api/forecast-contexts/context-filter-strategy.ts` — GoF Strategy (`DiscountStrategy` class). `publishedMissionIds(p_contextId)` returns published+active catalog ids only (INV-001, INV-005). Empty if none. Bind params.
4. `app/api/forecast-contexts/weather-adapter.ts` — GoF Adapter path-only (`EmailValidatorClassAdapter` + protocol). `WeatherAdapter.readPreviousWeather({ path })` returns the string. No live HTTP. Unused by pick.
5. `app/api/forecast-contexts/route.ts` — GET staff (`StaffPolicy` from missions, do not edit that file) `{ id, contexts: [{ id, slug, name }] }`; Parent 403.
6. `app/api/forecast-contexts/missions/[id]/route.ts` — PUT `{ id, context_ids: [] }` staff; 200 echo; unknown 400; duplicate 409; Parent 403.
7. `p_` params, typed, no `any`, `queryRaw`, no ORM, no FE.

## Verification

```bash
npx vitest run tests/forecast
```

## Brownfield

New modules. After Green skip refactor playbook unless later request.
