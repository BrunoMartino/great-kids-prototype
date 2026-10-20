# Phase 6 — pick (ai-mission-rules) Green

## Context

Wave 6 lane `pick`. Wave 0 owns `mission`, `family_profile`, `family_mission`, `mission_forecast_context` DDL. No new migration (range 060100–060199 unused unless additive DDL is required). Frontend owned paths are `—`.

Red tests:

- `tests/pick/pick-strategy.test.ts`
- `tests/pick/pick-history.test.ts`
- `tests/pick/pick-ranker-adapter.test.ts`
- `tests/pick/pick-api.test.ts`

Axes: published catalog id; draft omitted; empty catalog no invention; injection family id as data; rain context filter; age range skip; liveAnswers score / deleted ignored; skip recent Completed non-repeatable; repeatable history still eligible; only skipped → empty; injection history as data; ranker published id; free-text discarded; unknown id discarded; leaky draft rejected after Adapter; POST Parent `{ id, mission_id }`; no candidate error without title/body; Child 403; injection family id not 500.

Doubles: RankerAdapter tests inject a `RankerFnProtocol` adaptee (external optional ranker). Partner: not asserting mock existence; Adapter mapping is the unit. Partner: mock is the unbuilt ranker below the Adapter; published-id check stays real.

## Red command

```bash
npx vitest run tests/pick
```

Expected: fail — cannot resolve `services/mission_pick/*` or `app/api/families/[id]/missions/pick/route`.

## Green steps

DB: none.

1. `services/mission_pick/pick-strategy.ts` — GoF Strategy base (DiscountStrategy shape). `filter(p_input): PickCandidate[]` default `[]`. Typed, `p_` params, no `any`.
2. `services/mission_pick/catalog-pick-strategy.ts` — `CatalogPickStrategy extends PickStrategy`. Load published/active/not-deleted via `queryRaw`. Filter forecast `context_id` (reuse `ContextFilterStrategy`; no live weather). Skip Completed non-repeatable history for `familyId`. Age overlap when `ages` given. Score by `FamilyProfile.liveAnswers` vs title/values; deleted answers already omitted. Sort score desc, id asc.
3. `services/mission_pick/ranker-adapter.ts` — GoF Adapter (EmailValidatorClassAdapter shape). `RankerProtocol` / `RankerFnProtocol`. `RankerAdapter` wraps optional adaptee (default: first candidate id). Free-text or id not in the candidate set → `RankerDiscardError`.
4. `services/mission_pick/mission-pick.ts` — shopping-cart analogue. Holds Strategy + Adapter. `pick(p_input)` → `{ id, mission_id }`. Empty candidates → `NoCandidateError`. After Adapter, validate `Mission.findById` with `review_status=published` (and active); else `RankerDiscardError`. Envelope `id` is a request uuid (no pick table).
5. `app/api/families/[id]/missions/pick/route.ts` — POST Parent `{ context_id? }` → `{ id, mission_id }`. `GpsPolicy.assertCanEdit`. Unknown family 404. Handler re-validates published catalog id. No candidate / discarded ranker → error JSON without `title`/`body`/`mission_id`. Child 403. Bound params only.

Do not: frontend; live weather API; generated title/body; family_mission model (Wave 7/8); edit existing tests; `.env`; migrations; Repository/ORM.

## Verification

```bash
npx vitest run tests/pick
```

## Frontend

None this wave (`FE: —`).

## Brownfield

New modules only. Skip `refactor-fase6.md`.
