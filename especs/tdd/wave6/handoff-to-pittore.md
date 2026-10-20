# Handoff to Pittore — Wave 6

Wave 6 DB/Backend Green. **Frontend owned paths are `—`.** There is no family or panel UI in this wave. Do not paint screens. Write `handoff-to-scultore.md` with FE skipped so Wave 7 can start.

Flow: `per-wave`. Graphify present: `graphify-out/graph.json`.

## DB / Backend status

- Wave 5 FE painted (`handoff-to-scultore.md`). Wave 6 pick Red/Green passed (`npx vitest run tests/pick` — 19 passed).
- Migrations: none. Range 060100–060199 unused (Wave 0 owns `mission` / `family_profile` / `family_mission` / `mission_forecast_context` DDL).
- Shared BE touchpoints: none (App Router). Route file is `app/api/families/[id]/missions/pick/route.ts`.
- Babylon Gate: user override OFF this invocation — not run.

## Rules of execution (Frontend)

- Parent/Child screens render ONLY inside the family mobile emulator (HTML iPhone 15 Pro Max). Never full-bleed desktop.
- This wave has no Frontend layer. Do not add `app/(family)/missions/pick/**` or panel routes.

Blocked: live weather API (`previous_weather` text; forecast_context staff tags only); payments; auth tables; inventing missions.

## Lane: pick (ai-mission-rules)

- **FE owned:** —
- TDD: `especs/design-docs/tdd-feature-ai-mission-rules.md`
- Plan: `especs/tdd/wave6/pick/fase6.md` + `fase6Task.md` (no FE steps)
- Patterns: Strategy (`CatalogPickStrategy` scores/filters published rows by profile, ages, history, forecast context); Adapter (`RankerAdapter` wraps optional ranker). Handler still validates `mission.review_status=published`.

Backend contract:

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/api/families/{id}/missions/pick` | Parent | `{ "context_id"? }` | `200 {"id":"<uuid>","mission_id":"<catalog id>"}`. Catalog published id only. No `title`/`body`. Unknown family `404`. Child `403`. No published candidate `422 {"error":"no candidate"}`. Ranker free-text or unknown/unpublished id `422 {"error":"ranker discarded"}`. |

- Pick never invents a mission (INV-001). Family APIs never return draft (INV-005).
- Recent Completed non-repeatable ids are skipped. Repeatable Completed stays eligible.
- `FamilyProfile.liveAnswers(familyId)` (deleted skipped) scores candidates. Optional `context_id` uses staff forecast tags, not live weather.

## Frontend shared touchpoints

None. No `frontend/src/portals/*`. No router entries.

## Open questions

None for Frontend. Skip painting; record FE skipped in `handoff-to-scultore.md`.
