# Phase 5 — calendar (family-calendar) Green

## Context

Wave 5 lane `calendar`. Wave 0 owns `family_calendar` DDL including UNIQUE `(family_id, day)`. No new migration (range 050200–050299 unused). GPS lane is parallel — do not write `models/family_profile` or quiz/profile routes.

Red tests:

- `tests/calendar/calendar-day.test.ts`
- `tests/calendar/calendar-published.test.ts`
- `tests/calendar/day-composite.test.ts`

Axes: PUT envelope; GET empty day envelope; second same family+day 409; different day 200; bare array 400; injection day as data; draft mission_id 422 and not stored; published scheduled 200; moved+draft still 422; DayComposite empty/fromStored/status literals.

No doubles.

## Red command

```bash
npx vitest run tests/calendar
```

Expected: fail — cannot resolve `models/family_calendar`, calendar `[day]` route, `DayComposite`.

## Green steps

DB: none. Unique already in Wave 0 schema.

1. `models/family_calendar.ts` — GoF Singleton AR (`MyDatabaseClassic`). `insert` / `findByFamilyDay`. Unique clash throws. Envelope column never a bare array. `p_` params, typed, no `any`.
2. `app/api/families/[id]/calendar/day-composite.ts` — GoF Composite (product-composite shape). Day + suggestion children. `empty`, `fromStored`, `fromEnvelope`, `toDocument`. Status `scheduled`|`done`|`moved` only. Reject `[]`.
3. `app/api/families/[id]/calendar/calendar-command.ts` — GoF Command interface `execute` / `undo`.
4. `app/api/families/[id]/calendar/schedule-on-day.ts` — ScheduleOnDay: reject unpublished/inactive/deleted `mission_id` (INV-001, INV-005) before insert.
5. `app/api/families/[id]/calendar/move-suggestion.ts` — MoveSuggestion: set status `moved`; write target day without a second unique row.
6. `app/api/families/[id]/calendar/[day]/route.ts` — GET empty envelope if no row (do not insert). PUT 200 first write; 409 unique clash; 422 unpublished; 400 bare array. Bound `day` as data.

Do not: frontend; live weather API; child suggestion table; unpublished stored; edit existing tests.

## Verification

```bash
npx vitest run tests/calendar
```

## Frontend

Pittore: `app/(family)/calendar/**` inside phone chrome.

## Brownfield

New modules. After Green skip refactor playbook.
