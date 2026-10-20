# Phase 6 — pick Green

- [x] `services/mission_pick/pick-strategy.ts` — Strategy base `filter`
- [x] `services/mission_pick/catalog-pick-strategy.ts` — published, history skip, ages, profile, context
- [x] `services/mission_pick/ranker-adapter.ts` — Adapter + `RankerDiscardError`
- [x] `services/mission_pick/mission-pick.ts` — Strategy + Adapter; published id check; `NoCandidateError`
- [x] `app/api/families/[id]/missions/pick/route.ts` — POST Parent `{ id, mission_id }`
- [x] Phase tests pass: `npx vitest run tests/pick`
- [x] Brownfield only: skip refactor playbook (new modules)
