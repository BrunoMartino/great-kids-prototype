# Phase 5 — gps (family-quiz, quiz-modes, family-profile, what-we-know) Green

## Context

Wave 5 lane `gps`. Wave 0 owns `family_profile` / `family_quiz` DDL. No new migration (range 050100–050199 unused unless additive DDL is required). Calendar lane is parallel — do not write `models/family_calendar` or calendar routes.

Red tests:

- `tests/gps/quiz-offer.test.ts`
- `tests/gps/quiz-answer.test.ts`
- `tests/gps/quiz-modes.test.ts`
- `tests/gps/quiz-child-bank.test.ts` (already green: Wave 4 panel Policy 403)
- `tests/gps/profile-gps.test.ts`
- `tests/gps/profile-answers.test.ts`
- `tests/gps/gps-policy.test.ts`

Axes: live Family-Quiz offer; empty offer; deleted bank omitted; injection family id as data; POST envelope with bank id; empty text 400; unknown question_id 400; injection answer as data / no bare array; solo+table persist; missing mode saves; invalid mode 400; no second table; ModeStrategy default solo; GET GPS envelopes; Composite rejects `[]`; no child photo keys; unknown family 404; quiz → profile one-way; GET answers with question_id; hide deleted; empty PATCH 400; DELETE sets deleted and keeps bank; Child wipe 403; liveAnswers skips deleted; GpsPolicy Parent/Child.

No doubles. Child PATCH panel questions already 403 — no production change.

## Red command

```bash
npx vitest run tests/gps
```

Expected: fail — cannot resolve quiz/profile routes, `ModeStrategy`, `ProfileComposite`, `GpsPolicy`, `FamilyProfile.liveAnswers`. Child bank PATCH already 403.

## Green steps

DB: none. Do not change `insertEmpty` husk JSON `{ id, quiz_answer: [] }` (Wave 1 tests). Normalize that husk to `{ id, answers: [] }` on GPS read. Writes persist `{ id, answers: [...] }`.

1. `models/family_profile.ts` — extend Singleton AR. `findByFamilyId`, `appendAnswer`, `replaceAnswers`, `liveAnswers` (skip `deleted: true`), GPS document read. `p_` params, typed, no `any`. No import of `FamilyQuiz` (Observer one-way).
2. `app/api/families/[id]/profile/gps-policy.ts` — Policy: `assertCanAnswer` Parent|Child; `assertCanEdit` Parent only; staff roles denied on family GPS.
3. `app/api/families/[id]/profile/profile-composite.ts` — GoF Composite (product-composite shape): GPS document treats quiz_answer, rhythms, achievements uniformly. `fromStored` rejects a bare quiz_answer array. Output quiz_answer `{ id, answers: [] }`.
4. `app/api/families/[id]/quiz/mode-strategy.ts` — GoF Strategy (KindStrategy / DefaultDiscount shape). Base `ModeStrategy.resolve(p_mode?)`: omit → `solo`; `solo`|`table` ok; other throw. `SoloModeStrategy` / `TableModeStrategy` subclasses. No mode column.
5. `app/api/families/[id]/quiz/quiz-command.ts` — GoF Command interface `execute` / `undo` (SmartHouseCommand).
6. `app/api/families/[id]/quiz/submit-answer-command.ts` — Command: validate live `question_id` via `FamilyQuiz`, reject empty text, notify profile Observer, append envelope. No second table.
7. `app/api/families/[id]/quiz/quiz-observable.ts` — GoF Observer (InputObservable): quiz subject notifies profile observer; profile never imports quiz.
8. `app/api/families/[id]/quiz/route.ts` — GET `{ id, questions: [{ id, question_text }] }` live Family-Quiz (deleted omitted, active only). POST `{ question_id, answer_text, mode? }` → answers envelope. Parent+Child may answer. Unknown family: not 500 (bound id).
9. `app/api/families/[id]/profile/route.ts` — GET `{ id, quiz_answer, rhythms, achievements, profile_notes }`. 404 unknown family. No photo/img keys.
10. `app/api/families/[id]/profile/edit-answer-command.ts` / `delete-answer-command.ts` — Commands. Empty edit throw. Delete sets `deleted: true`; bank untouched.
11. `app/api/families/[id]/profile/answers/route.ts` — GET hides deleted. PATCH/DELETE Parent only (Child 403).

Do not: frontend; mode DB column; payments; auth tables; child photos; edit `tests/questions/*`; change husk `insertEmpty` shape.

## Verification

```bash
npx vitest run tests/gps
```

## Frontend

Pittore: `app/(family)/quiz/**`, `app/(family)/profile/**` inside phone chrome. No panel quiz answering.

## Brownfield

Extend `models/family_profile.ts`. After Green skip refactor playbook (husk insertEmpty stays).
