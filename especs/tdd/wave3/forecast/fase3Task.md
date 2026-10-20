# Phase 3 — forecast Green

- [x] `models/forecast_context.ts` — four seeds listed; bound slug lookup
- [x] `models/mission_forecast_context.ts` — replaceSet; duplicate/unknown reject; unpublished allowed
- [x] Strategy `publishedMissionIds` published-only; empty does not invent
- [x] WeatherAdapter path-only; no live weather
- [x] GET `/api/forecast-contexts` envelope; Parent 403
- [x] PUT `/api/forecast-contexts/missions/[id]` 200/400/409
- [x] Phase tests pass: `npx vitest run tests/forecast`
- [x] No migration file (Wave 0 DDL)
