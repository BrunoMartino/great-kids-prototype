# Handoff to Pittore — Wave 5

Wave 5 DB/Backend Green. Frontend not started. Do not start Wave 6 until Scultore consumes `handoff-to-scultore.md`.

Flow: `per-wave`. Graphify present: `graphify-out/graph.json`.

## DB / Backend status

- Wave 4 FE painted (`handoff-to-scultore.md`). Wave 5 gps + calendar Red/Green passed (`npx vitest run tests/gps tests/calendar` — 39 passed).
- Migrations: none. Ranges 050100–050199 and 050200–050299 unused (Wave 0 owns `family_profile` / `family_calendar` DDL, including UNIQUE `(family_id, day)`).
- Shared BE touchpoints: none (App Router). `models/family_profile` extended by gps only.
- Babylon Gate: user override OFF this invocation — not run.
- Mock session: module-level store unchanged. Wave 5 Vitest APIs share the store after dynamic import. Panel Admin vs other Route Handler bundles (Wave 4 signal) is not required for these Parent family APIs.

## Rules of execution (Frontend)

- Parent/Child screens render ONLY inside the family mobile emulator (HTML iPhone 15 Pro Max). Never full-bleed desktop.
- Panel is a normal web layout and must not host Parent/Child family screens.
- Question bank CRUD stays **PANEL only** (`/questions`). Family quiz answers here; never bank create/edit/delete in family chrome.
- Pittore merges frontend shared touchpoints. Do not write backend.

Blocked: quiz mode DB column (request flag `mode` only); payments; auth tables; child photos; live weather API; unpublished missions on calendar.

## Lane: gps (family-quiz, quiz-modes, family-profile, what-we-know)

- **FE owned:** `app/(family)/quiz/**`, `app/(family)/profile/**`
- TDDs: `especs/design-docs/tdd-feature-family-quiz.md`, `tdd-feature-quiz-modes.md`, `tdd-feature-family-profile.md`, `tdd-feature-what-we-know.md`
- Plan: `especs/tdd/wave5/gps/fase5.md` + `fase5Task.md` (FE checkboxes)
- Patterns: Command (submit/edit/delete answer); Singleton AR (`family_quiz`, `family_profile`); Strategy (solo vs table); Composite (GPS document); Observer (quiz → profile only); Policy (Parent edit; Parent|Child answer).

Backend contracts (same process as family UI):

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/families/{id}/quiz` | Parent or Child | — | `200 {"id":"<uuid>","questions":[{"id","question_text"}]}`. Live Family-Quiz only (deleted omitted). Unknown family `404`. |
| POST | `/api/families/{id}/quiz` | Parent or Child | `{ "question_id", "answer_text", "mode"? }` | `200 {"id","answers":[{"question_id","answer_text","deleted"}]}`. Omit `mode` → `solo`. `mode`: `solo` \| `table`. Empty text / unknown id / invalid mode `400`. |
| GET | `/api/families/{id}/profile` | Parent | — | `200 {"id","quiz_answer":{"id","answers":[]},"rhythms":{"id","rhythms":[]},"achievements":{"id","achievements":[]},"profile_notes"}`. Unknown family `404`. No photo/img keys. |
| GET | `/api/families/{id}/profile/answers` | Parent | — | `200 {"id","answers":[{"question_id","answer_text","deleted"}]}`. Deleted answers omitted. |
| PATCH | `/api/families/{id}/profile/answers` | Parent | `{ "question_id", "answer_text" }` | `200` answers envelope. Empty text `400`. Child `403`. |
| DELETE | `/api/families/{id}/profile/answers` | Parent | `{ "question_id" }` | `200` envelope with that answer `deleted: true`. Bank row unchanged. Child `403`. |

- Quiz answers live in `family_profile.quiz_answer` `{ id, answers: [...] }` (INV-004). No second table. No mode column.
- Pick later uses `FamilyProfile.liveAnswers(familyId)` (skips deleted).
- Acceptance: envelope answers; solo/table; GPS read; what-we-know edit/delete.
- Shared FE touchpoint: family chrome from Wave 3 (`app/(family)/chrome/**`). Mount quiz + profile inside that chrome only. No `frontend/src/portals/*`.

## Lane: calendar (family-calendar)

- **FE owned:** `app/(family)/calendar/**`
- TDD: `especs/design-docs/tdd-feature-family-calendar.md`
- Plan: `especs/tdd/wave5/calendar/fase5.md` + `fase5Task.md` (FE checkboxes)
- Patterns: Composite (day document); Command (ScheduleOnDay, MoveSuggestion).

Backend contracts:

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/families/{id}/calendar/{day}` | Parent | — | `200 {"id","family_id","day","previous_weather","notifications","suggestions":{"id","suggestions":[{"id","mission_id","curated_material_id","status"}]}}`. Missing row: empty `suggestions: []` (no insert). |
| PUT | `/api/families/{id}/calendar/{day}` | Parent | `{ "suggestions": { "id", "suggestions": [...] }, "previous_weather"? }` | `200` day document. Second row same family+day `409`. Unpublished `mission_id` `422`. Bare suggestions array `400`. |

- `status`: `scheduled` \| `done` \| `moved`. Envelope never a list root (INV-004).
- Only published + active + not deleted catalog ids (INV-001, INV-005).
- PUT is create-once. Wave 7 owns calendar PATCH.
- Acceptance: unique family+day; unpublished rejected; envelope shape.
- Shared FE touchpoint: family chrome. No `frontend/src/portals/*`. Add family nav to calendar if the chrome has a nav list.

## Open questions

None for Frontend.

## After paint

Write `especs/tdd/wave5/handoff-to-scultore.md` and `especs/tdd/wave5/<lane>/frontend-verification.md` (gps + calendar). Mark FE checkboxes.
