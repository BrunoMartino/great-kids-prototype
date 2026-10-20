# Phase 4 — questions (question-bank) Green

## Context

Wave 4 lane `questions`. Wave 0 already owns `family_quiz` DDL. No new migration (range 040200–040299 unused). Mascot lane is FE only — no BE in this wave.

Red tests:

- `tests/questions/family-quiz.test.ts`
- `tests/questions/questions-api.test.ts`
- `tests/questions/kind-strategy.test.ts`

Axes: create Family-Quiz; weight 0; empty text / invalid kind throw; injection text as data; Admin POST+GET envelope; kind filter / GET id / PATCH / soft DELETE; 400 empty/invalid; Parent CRUD 403; Family-Quiz and Say-What live offer; empty offer; injection kind as data. No doubles.

## Red command

```bash
npx vitest run tests/questions
```

Expected: fail — cannot resolve `@/models/family_quiz`, `@/app/api/panel/questions/route`, `@/app/api/panel/questions/[id]/route`, `@/app/api/panel/questions/kind-strategy`.

## Green steps

DB: none. Schema already has `family_quiz` (kind Family-Quiz|Say-What, status active|inactive, weight ≥ 0, deleted 0|1).

1. `models/family_quiz.ts` — GoF Singleton (`MyDatabaseClassic`: private static `_instance`, private constructor, `public static get instance`). `create`, `findById`, `list(p_kind?)`, `listLive(p_kind)`, `update`, `softDelete` via `queryRaw`. Reject empty `question_text` and kind other than Family-Quiz|Say-What. `p_` params, typed, no `any`.
2. `app/api/panel/questions/kind-strategy.ts` — GoF Strategy (`DiscountStrategy` class + `DefaultDiscount` subclass). Base `KindStrategy` takes `p_kind` and `offer()` lists live rows of that kind (bound param). `FamilyQuizKindStrategy` / `SayWhatKindStrategy` set the kind. Do not invent ids.
3. `app/api/panel/questions/route.ts` — GET staff list `{ id, questions: [...] }` (`deleted` boolean); optional `?kind=` filter; Parent 403. POST staff 201 `{ id, question }`; empty text / invalid kind 400.
4. `app/api/panel/questions/[id]/route.ts` — GET/PATCH/DELETE staff; Parent 403. PATCH same fields. DELETE soft `{ id, question: { deleted: true } }`.
5. Staff via `SurfaceFacade.assertPanel` + `getMockSession()`. No FE. No family quiz answering. No auth tables.

Do not: invent questions; two tables; family answering; Parent/Child screens; Flowbite.

## Verification

```bash
npx vitest run tests/questions
```

## Frontend

Pittore: `app/(panel)/questions/**` — panel web only. Mascot: `app/(family)/missions/mascot/**` inside phone chrome.

## Brownfield

New modules. After Green skip refactor playbook.
