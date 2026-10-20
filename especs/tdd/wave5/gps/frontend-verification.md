# Wave 5 — Frontend verification (gps)

## Files written

- `app/(family)/quiz/page.tsx` — `/quiz` inside family layout chrome
- `app/(family)/quiz/quiz-screen.tsx` — offer, solo/table Strategy, submit Command
- `app/(family)/quiz/quiz-session-context.tsx` — `useContext` + `useEffect`; GET/POST `/api/families/{id}/quiz`
- `app/(family)/quiz/quiz-command.ts` — Command interface
- `app/(family)/quiz/submit-answer-command.ts` — submit envelope
- `app/(family)/quiz/mode-strategy.ts` — Strategy solo | table; default solo
- `app/(family)/quiz/gps-view-policy.ts` — Parent|Child answer; Parent edit
- `app/(family)/profile/page.tsx` — `/profile` inside family layout chrome
- `app/(family)/profile/profile-screen.tsx` — GPS Composite + what-we-know edit/delete modals
- `app/(family)/profile/profile-session-context.tsx` — GET profile + answers; PATCH/DELETE answers
- `app/(family)/profile/gps-composite.ts` — Composite GPS document
- `app/(family)/profile/profile-command.ts` — Command interface
- `app/(family)/profile/edit-answer-command.ts`
- `app/(family)/profile/delete-answer-command.ts`
- `app/(family)/chrome/family-nav.tsx` — Quiz | GPS | Calendário, preserves `?id=`

Mounted only under `app/(family)` → iPhone 15 Pro Max chrome. No Flowbite. No panel quiz answering. No bank CRUD.

## Commands

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass (exit 0) |
| Lint | Not present (no `lint` script) |
| `npm run build` | Pass — `/quiz` 5.12 kB, `/profile` 5.93 kB |

## Manual: acceptance

Family `76b0b6a7-c789-49fc-b4fa-808889336cae` on `http://localhost:3000/quiz?id=…` and `/profile?id=…`.

- Screens are `data-surface="family"` inside `[data-phone-chrome="iphone-15-pro-max"]` (458×960). Parent | Child control present. No full-bleed. `/questions` is `data-surface="panel"` with no phone chrome.
- Quiz GET shows live Family-Quiz copy (three questions). Empty family id asks for the id. Unknown family: **Família não encontrada**.
- Strategy: **Sozinho** copy “Um adulto responde sozinho.” **À mesa** copy “A família responde junta, à mesa.” POST `{ question_id, answer_text, mode }`. Table submit stored “Panquecas no domingo”; UI “1 respostas no GPS.”
- Child may still open the quiz offer (VISÃO CHILD + questions). Child GPS: **GPS só para Parent**.
- GPS Composite: envelopes for respostas / ritmos / conquistas. No photo keys.
- What-we-know: item shows `question_id` + text. Edit Command → “Waffles no domingo”. Delete Command hides the fact (“Ainda não há fatos guardados.”); bank questions still on quiz.

## Acceptance

- [x] Family quiz offer + solo/table answer inside phone chrome
- [x] GPS read + what-we-know edit/delete inside phone chrome
- [x] Type-check and build pass
- [ ] Lint — not configured in this repo
- [ ] Safari / Firefox / iOS device pass — canva listed as manual
