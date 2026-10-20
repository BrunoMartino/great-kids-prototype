# Phase 8 — Green

- [x] `db/migrations/080100_family_mission_title.sql` — additive `title TEXT`
- [x] `models/family_mission.ts` — `ensureTitleColumn`, snapshot on accept, `updateStatus`, `completeWithClosing`, `listCompleted`, `countCompleted`
- [x] `app/api/family-missions/mission-cycle.ts` — State (Accepted/Doing/Completed)
- [x] `app/api/family-missions/mission-command.ts` — Command `execute`/`undo`
- [x] `app/api/family-missions/start-doing-command.ts` — StartDoing
- [x] `app/api/family-missions/complete-mission-command.ts` — CompleteMission + txn + counter
- [x] `app/api/family-missions/[id]/route.ts` — PATCH cycle
- [x] `app/api/families/[id]/missions/route.ts` — GET Completed envelope
- [x] Phase tests pass: `npx vitest run tests/mission-play`
- [x] Append rows to `especs/testsReadme.md`
- [x] Brownfield: skip `refactor-fase8.md` (no legacy cycle writer)

## Frontend (Pittore)

- [x] `app/(family)/missions/cycle/**` — Accepted → Doing → Completed + closing question
- [x] `app/(family)/missions/completed/**` — history list from GET envelope
- [x] Type-check / lint / build notes in `frontend-verification.md`
