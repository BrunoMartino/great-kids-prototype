# Phase 9 — diary (note-types + family-diary) Green

## Context

Wave 9 lane `diary`. Wave 0 owns `family_diary` DDL (`family_notes`, `mission_note`, `deleted`). Migration range 090100–090199: unused (DB: —).

Frontend owned path `app/(family)/diary/**` is Pittore — do not write it.

Red tests:

- `tests/diary/kind-strategy.test.ts`
- `tests/diary/diary-api.test.ts`

Axes: five kinds; unknown/empty/injection kind reject; GET `{ id, notes: [] }` envelopes (INV-004); persist phrase; empty/whitespace text 422; photo/image/img 422 (INV-002); deleted hides notes; mission_note nested shape; foreign family_mission 422; Child POST 403; unknown/injection family id 404.

Doubles: none. Partner: not asserting mock existence. Partner: sqlite, husk, cycle, and models stay real.

Invariants: INV-002 (no photos), INV-004 (`{ id, notes: [] }`).

## Red command

```bash
npx vitest run tests/diary
```

Expected: fail — cannot resolve `app/api/families/[id]/diary/route` or `kind-strategy`.

## Green steps

GoF from developer docs (GitHub `BrunoMartino/design-patterns-exemples-GoF`; docs-mcp empty):

- Strategy (`DiscountStrategy` / `DefaultDiscount`): `NoteKindStrategy` base; five subclasses (`PhraseKindStrategy`, `FirstTimeKindStrategy`, `FunnyKindStrategy`, `LearnedKindStrategy`, `FamilyFailKindStrategy`). `resolveNoteKind` picks by literal; unknown has no Strategy and throws.
- Composite (`ProductComponent` / `ProductLeaf` / `ProductComposite`): `DiaryComponent`, `NoteLeaf`, `NotesComposite` for `family_notes`; `MissionNoteLeaf` + `MissionNotesComposite` for `mission_note`. Append/read through the tree; envelope `{ id, notes }`.
- Command (`SmartHouseCommand` `execute`/`undo`): `AddNoteCommand`. Invoker is POST; receiver is the diary composite. Reject is a failed command (no partial write).

1. `models/family_diary.ts` — extend Active Record. `findByFamilyId` (join `family.fam_diary_id`). Parse envelopes. `replaceNotes` persists both JSON columns. Typed, `p_` params, no `any`. Do not edit `family.ts`.
2. `app/api/families/[id]/diary/kind-strategy.ts` — Strategy whitelist of five literals.
3. `app/api/families/[id]/diary/notes-composite.ts` — Composite tree + envelope parse/serialize.
4. `app/api/families/[id]/diary/diary-command.ts` — Command interface `execute` / `undo`.
5. `app/api/families/[id]/diary/add-note-command.ts` — reject empty/whitespace text; reject `photo`/`image`/`img` keys and data-URI; resolve kind; require family-owned `family_mission` when link ids present; append leaves; persist both envelopes in one write.
6. `app/api/families/[id]/diary/route.ts` — GET Parent/Child (view). POST Parent. 200 `{ id: familyId, family_notes, mission_note }`. Deleted flag returns empty `notes` arrays (envelope kept). 422 unknown kind / empty text / photo / foreign mission. 404 unknown family. Child POST 403. Bound params.

Do not: frontend; edit existing tests; `.env`; Repository/ORM; Babylon Gate; indicators lane files.

## Verification

```bash
npx vitest run tests/diary
```

## Frontend

Pittore: `app/(family)/diary/**`. Not this phase.

## Brownfield

Extend `models/family_diary.ts`. After Green skip `refactor-fase9.md` (no legacy diary writer to swap; husk `insertEmpty` stays).
