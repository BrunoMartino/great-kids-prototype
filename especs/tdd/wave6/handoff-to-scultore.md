# Handoff to Scultore — Wave 6

Wave 6 Frontend skipped (`FE: —`). Backend of Wave 6 is Green. Wave 7 may start. Do not implement Waves 7–9 in this wave's chat.

## Files written per lane

### pick

None under Frontend owned paths. Lane FE is `—`.

Backend (Scultore):

- `services/mission_pick/pick-strategy.ts`
- `services/mission_pick/catalog-pick-strategy.ts`
- `services/mission_pick/ranker-adapter.ts`
- `services/mission_pick/mission-pick.ts`
- `app/api/families/[id]/missions/pick/route.ts`

## FE checkboxes

- `especs/tdd/wave6/pick/fase6Task.md` — no Frontend items (all Backend checkboxes marked).

## Type-check / lint / build

Not run for Frontend. No family/panel screens in this wave.

## Manual notes per acceptance criterion

- pick never returns draft — backend Vitest (`tests/pick/pick-strategy.test.ts`, leaky ranker test).
- pick never returns a mission id not in the table — RankerAdapter unknown/free-text tests.
- non-repeatable recently completed is skipped — `tests/pick/pick-history.test.ts`.

No browser notes (no UI).

## Backend signals

None.

## Blocked leftovers

- Live weather API still blocked; pick uses `forecast_context` staff tags via `context_id`.
- Member age columns still blocked; ages filter uses explicit `ages` or numeric live answers (0–18).
