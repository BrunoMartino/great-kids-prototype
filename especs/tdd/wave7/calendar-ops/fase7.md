# Phase 7 — calendar-ops (weekly-suggestion + reminders) Green

## Context

Wave 7 lane `calendar-ops`. Wave 0 owns `family_calendar` / `family_profile` DDL. Migration range 070100–070199 unused unless additive DDL is required.

Frontend owned paths `app/(family)/forecast/**` are Pittore — do not write them.

Red tests:

- `tests/calendar-ops/week-strategy.test.ts`
- `tests/calendar-ops/week-api.test.ts`
- `tests/calendar-ops/drop-on-day.test.ts`
- `tests/calendar-ops/reminders-patch.test.ts`
- `tests/calendar-ops/rhythm-proposal.test.ts`

Axes: published week list with catalog title; cap 5; draft omitted; injection family id as data; GET envelope; empty `{ id, suggestions: [] }` no invented copy; unknown family 404; Child 403; DropOnDay scheduled write; merge existing day; missing day 422 no write; unpublished 422; PATCH done; move merge unique `(family_id, day)`; moved without `target_day` 422; Child PATCH 403; four repeats propose without writing rhythms; three repeats no proposal; dismiss no-write; accept appends `{ id, label, source_mission_id, weekday }`; Child POST proposal 403.

Doubles: none. Partner: not asserting mock existence. Partner: sqlite + Calendar PUT seed + CatalogPickStrategy stay real.

## Red command

```bash
npx vitest run tests/calendar-ops
```

Expected: fail — cannot resolve `app/api/families/[id]/forecast/*`, calendar PATCH, or rhythms proposal route.

## Green steps

DB: none (Wave 0 schema). Do not add migrations unless a new column is strictly required (it is not).

GoF from developer docs (docs-mcp `gof-design-patterns`; fallback GitHub `BrunoMartino/design-patterns-exemples-GoF`):

- Strategy (DiscountStrategy class shape): `WeekListStrategy` wraps `CatalogPickStrategy`, published-only, cap 5, never invents rows.
- Command (LightOnCommand / existing `CalendarCommand` shape): `DropOnDay`, `MarkDone`, `MoveDay` with `execute()` / `undo()`.
- Observer (unidirectional): repeat count notifies `RhythmProposalObserver`; observer must not write `family_calendar`.

1. `app/api/families/[id]/forecast/week-list-strategy.ts` — `WEEK_LIST_CAP = 5`. `list(p_input)` returns `{ mission_id, title }[]` from `CatalogPickStrategy.filter`, sliced to 5. Draft/unpublished never appear.
2. `app/api/families/[id]/forecast/drop-on-day.ts` — Command. Requires `p_day` and published `p_missionId`. Missing day throws (route → 422). Unpublished throws (route → 422). If the day row exists, append a `scheduled` leaf via `FamilyCalendar.replaceSuggestions`; else insert (same envelope shape as Wave 5). Do not call Wave 5 `ScheduleOnDay` (create-once 409).
3. `app/api/families/[id]/forecast/week/route.ts` — GET Parent `{ id, suggestions }`. Empty published → `{ id, suggestions: [] }` no title/description. POST `{ day, mission_id }` runs DropOnDay. `GpsPolicy.assertCanEdit`. Unknown family 404. Child 403. Bound params only.
4. Extend `models/family_calendar.ts` (this lane owns it): `listByFamily(p_familyId)` for repeat counts. Keep `queryRaw`, no ORM.
5. `app/api/families/[id]/forecast/mark-done.ts` — Command sets leaf `status` to `done`.
6. `app/api/families/[id]/forecast/move-day.ts` — Command requires `target_day`. Marks source leaf `moved`. Merges a copy onto the target day’s suggestions (insert target if missing). Never inserts a second `(family_id, day)` row.
7. `app/api/families/[id]/forecast/rhythm-observer.ts` — After done/moved, count `done|moved` leaves of that `mission_id` for the family. At 4, notify Observer with `{ source_mission_id, weekday }`. Observer does not write `rhythms` or calendar.
8. `app/api/families/[id]/calendar/[day]/suggestions/[sid]/route.ts` — PATCH `{ status: "done"|"moved", target_day? }`. Response `{ days: DayDocument[], proposal: { source_mission_id, weekday } | null }`. `target_day` required when moved → else 422. Child 403.
9. `app/api/families/[id]/rhythms/proposal/route.ts` — POST `{ dismissed: true }` returns current `{ id, rhythms: [] }` unchanged. POST `{ source_mission_id, label, weekday }` appends one item inside the envelope via `queryRaw` (do not edit `models/family_profile.ts`). Child 403.

Do not: frontend; push provider; auto-insert rhythm on four repeats; edit Wave 5 PUT/tests; `.env`; Repository/ORM; `any`.

## Verification

```bash
npx vitest run tests/calendar-ops
```

## Frontend

Pittore: `app/(family)/forecast/**`. Not this phase.

## Brownfield

New forecast/PATCH/rhythms modules plus `FamilyCalendar.listByFamily`. Wave 5 PUT create-once stays. Skip `refactor-fase7.md` unless Green rewires `MoveSuggestion` (it must not).
