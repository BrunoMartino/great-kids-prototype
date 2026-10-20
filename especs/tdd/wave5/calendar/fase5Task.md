# Phase 5 — calendar Green

- [x] `models/family_calendar.ts` — Singleton AR insert/find; unique throw
- [x] `app/api/families/[id]/calendar/day-composite.ts` — Composite envelope; status literals
- [x] `app/api/families/[id]/calendar/calendar-command.ts` — Command interface
- [x] `app/api/families/[id]/calendar/schedule-on-day.ts` — published-only
- [x] `app/api/families/[id]/calendar/move-suggestion.ts` — moved without duplicate day
- [x] `app/api/families/[id]/calendar/[day]/route.ts` — GET/PUT; 409/422/400
- [x] Phase tests pass: `npx vitest run tests/calendar`
- [x] Brownfield only: skip refactor playbook (new modules)

## Frontend (Pittore)

- [x] `app/(family)/calendar/**` — family day calendar inside phone chrome
- [x] Type-check / build; write `frontend-verification.md`
