# Wave 9 — Frontend verification (diary)

## Files written

- `app/(family)/diary/page.tsx` — `/diary` inside family layout chrome
- `app/(family)/diary/diary-screen.tsx` — five kinds choosable; text only; compose modal; empty envelope
- `app/(family)/diary/diary-session-context.tsx` — `useContext` + `useEffect`; Parent authors, Child views
- `app/(family)/diary/diary-payload.ts` — `{ id, family_notes, mission_note }` envelopes
- `app/(family)/diary/diary-command.ts` — Command `execute` / `undo`
- `app/(family)/diary/list-diary-command.ts` — GET `/api/families/{id}/diary`
- `app/(family)/diary/add-note-command.ts` — POST `{ kind, text }` optional mission ids; no photo keys
- `app/(family)/diary/kind-strategy.ts` — five presentation Strategies
- Shared nav: `app/(family)/chrome/family-nav.tsx` — `Diário`

Mounted only under `app/(family)` → iPhone 15 Pro Max chrome. No Flowbite. No `input[type=file]`.

## Commands

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass |
| Lint | Not present (no `lint` script) |
| `npm run build` | Pass — `/diary` 6.49 kB |

## Manual: acceptance

Family `76b0b6a7-c789-49fc-b4fa-808889336cae`. Screen is `data-surface="family"` inside `[data-phone-chrome="iphone-15-pro-max"]`. FamilyNav includes **Diário**. Parent \| Child control present. No full-bleed.

- Empty husk: GET diary → **Nenhuma história ainda.** `data-diary-empty-state="true"`. Copy **Sem foto. Só história.** Envelopes kept with empty `notes`.
- Composer: **Adicionar nota** opens animated sheet. Five kinds: Frase, Primeira vez, Momento engraçado, Algo aprendido, Family Fail (`data-diary-kind`). Textarea only. Optional link to completed **Barquinhos de papel**. No photo picker (`input[type=file]` count 0).
- Child: form hidden; “A visão Child lê as histórias. Não escreve.”
- Mock split: if panel session is Admin, diary GET is 403 while `/api/session` still says Parent (existing `alignFamilyMock`). Restore Parent on mock to author.

## Acceptance

- [x] Five kinds choosable inside iPhone chrome
- [x] Text only; no photo UI
- [x] Empty envelopes, not a bare array
- [x] FamilyNav `Diário`
- [ ] Lint — not configured in this repo
- [x] `npm run build`
- [ ] Safari / Firefox / iOS device pass — canva listed as manual
