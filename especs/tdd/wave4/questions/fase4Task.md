# Phase 4 — questions Green

- [x] `models/family_quiz.ts` — Singleton AR create/list/find/update/softDelete; empty text and invalid kind throw
- [x] `app/api/panel/questions/kind-strategy.ts` — KindStrategy + FamilyQuizKindStrategy + SayWhatKindStrategy; live offer only
- [x] GET/POST `/api/panel/questions` staff envelope; optional kind; Parent 403; empty/invalid 400
- [x] GET/PATCH/DELETE `/api/panel/questions/[id]` staff; soft delete; Parent 403
- [x] Phase tests pass: `npx vitest run tests/questions`
- [x] Brownfield only: skipped (new modules)

## Frontend (Pittore)

- [x] `app/(panel)/questions/**` web panel only — no phone chrome, no Parent/Child screens
- [x] Staff CRUD against `/api/panel/questions` (POST session Admin|Operator first)
- [x] Parent mock sees 403 / Acesso negado
- [x] Type-check, lint, build, `frontend-verification.md`
