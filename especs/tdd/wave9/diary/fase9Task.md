# Phase 9 — Green

- [x] `models/family_diary.ts` — `findByFamilyId`, envelope parse, `replaceNotes`
- [x] `app/api/families/[id]/diary/kind-strategy.ts` — five kind Strategies + `resolveNoteKind`
- [x] `app/api/families/[id]/diary/notes-composite.ts` — Composite envelopes
- [x] `app/api/families/[id]/diary/diary-command.ts` — Command `execute`/`undo`
- [x] `app/api/families/[id]/diary/add-note-command.ts` — AddNote (text, photos, kind, mission link)
- [x] `app/api/families/[id]/diary/route.ts` — GET/POST
- [x] Phase tests pass: `npx vitest run tests/diary`
- [x] Append rows to `especs/testsReadme.md`
- [x] Brownfield: skip `refactor-fase9.md` (no legacy diary writer)

## Frontend (Pittore)

- [x] `app/(family)/diary/**` — Parent adds notes (five kinds); hide when deleted; no photo UI
- [x] Type-check / lint / build notes in `frontend-verification.md`
