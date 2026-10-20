# Phase 5 — gps Green

- [x] Extend `models/family_profile.ts`: findByFamilyId, appendAnswer, replaceAnswers, liveAnswers; keep insertEmpty husk shape
- [x] `app/api/families/[id]/profile/gps-policy.ts` — Parent edit; Parent|Child answer
- [x] `app/api/families/[id]/profile/profile-composite.ts` — Composite envelopes; reject bare array
- [x] `app/api/families/[id]/quiz/mode-strategy.ts` — Strategy solo|table; default solo; no DB column
- [x] `app/api/families/[id]/quiz/quiz-command.ts` + `submit-answer-command.ts` — Command submit
- [x] `app/api/families/[id]/quiz/quiz-observable.ts` — Observer quiz → profile only
- [x] `app/api/families/[id]/quiz/route.ts` — GET offer; POST envelope
- [x] `app/api/families/[id]/profile/route.ts` — GET GPS document
- [x] `app/api/families/[id]/profile/edit-answer-command.ts` + `delete-answer-command.ts`
- [x] `app/api/families/[id]/profile/answers/route.ts` — GET/PATCH/DELETE; hide deleted
- [x] Child bank PATCH already 403 — no panel questions code
- [x] Phase tests pass: `npx vitest run tests/gps`
- [x] Brownfield only: skip refactor playbook (husk insertEmpty unchanged)

## Frontend (Pittore)

- [x] `app/(family)/quiz/**` — family quiz offer + solo/table answer inside phone chrome
- [x] `app/(family)/profile/**` — GPS read + what-we-know edit/delete inside phone chrome
- [x] Type-check / build; write `frontend-verification.md`
