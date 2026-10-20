# Phase 7 — calendar-ops Green

- [x] `app/api/families/[id]/forecast/week-list-strategy.ts` — Strategy published-only, cap 5
- [x] `app/api/families/[id]/forecast/drop-on-day.ts` — DropOnDay Command
- [x] `app/api/families/[id]/forecast/week/route.ts` — GET/POST week
- [x] `models/family_calendar.ts` — `listByFamily` for repeat counts
- [x] `app/api/families/[id]/forecast/mark-done.ts` — MarkDone Command
- [x] `app/api/families/[id]/forecast/move-day.ts` — MoveDay Command merge unique
- [x] `app/api/families/[id]/forecast/rhythm-observer.ts` — Observer four-repeat proposal
- [x] `app/api/families/[id]/calendar/[day]/suggestions/[sid]/route.ts` — PATCH done/moved
- [x] `app/api/families/[id]/rhythms/proposal/route.ts` — accept/dismiss
- [x] Phase tests pass: `npx vitest run tests/calendar-ops`
- [x] Brownfield only: skip refactor playbook (do not rewire Wave 5 `MoveSuggestion`)

## Frontend (Pittore)

- [x] `app/(family)/forecast/**` — week list, DropOnDay, MarkDone, MoveDay, rhythm proposal
- [x] FamilyNav `Previsão` mounted inside iPhone 15 Pro Max chrome
- [x] Browser: drop Barquinhos onto `2026-10-21` → `scheduled`
