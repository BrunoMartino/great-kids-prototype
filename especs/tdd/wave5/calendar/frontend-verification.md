# Wave 5 — Frontend verification (calendar)

## Files written

- `app/(family)/calendar/page.tsx` — `/calendar` inside family layout chrome
- `app/(family)/calendar/calendar-screen.tsx` — day Composite, schedule/move Commands
- `app/(family)/calendar/calendar-session-context.tsx` — `useContext` + `useEffect`; GET/PUT `/api/families/{id}/calendar/{day}`
- `app/(family)/calendar/calendar-command.ts` — Command interface
- `app/(family)/calendar/schedule-on-day-command.ts` — PUT envelope; 409 / 422
- `app/(family)/calendar/move-suggestion-command.ts` — PUT target day `status: moved`
- `app/(family)/calendar/day-composite.ts` — Composite day document
- `app/(family)/calendar/published-mission.ts` — published-only; unpublished never shown
- Shared nav: `app/(family)/chrome/family-nav.tsx`

Mounted only under `app/(family)` → iPhone 15 Pro Max chrome. No Flowbite. Unpublished missions are not listed and cannot be scheduled.

## Commands

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass (exit 0) |
| Lint | Not present (no `lint` script) |
| `npm run build` | Pass — `/calendar` 5.82 kB |

## Manual: acceptance

Family `76b0b6a7-c789-49fc-b4fa-808889336cae`, day `2026-10-20`.

- Screen is `data-surface="family"` inside `[data-phone-chrome="iphone-15-pro-max"]` (458×960). Parent | Child control present. No full-bleed.
- GET empty day: **2026-10-20 · vazio**, “Nenhuma sugestão neste dia.” Envelope is not a list root in the UI.
- Unpublished id `0330079b-6a42-417c-b486-d47d43dabcfd`: “Missão não publicada. Ela não aparece e não pode ser agendada.” **Agendar** stays disabled until a published mission is verified.
- Published id `53ff9202-6b6b-4e29-8bf1-4fd5f8479c3a` (“Barquinhos de papel”): PUT envelope `status: scheduled`. UI **2026-10-20 · scheduled** with that `mission_id`.
- Second schedule on the same day is blocked in the client: “Este dia já tem um documento. PUT é só na primeira escrita.” (unique family+day).
- Child: **Calendário só para Parent**.

Move PUT onto an empty target day was not driven in the browser this run (source-day PATCH is Wave 7).

## Acceptance

- [x] Family day calendar inside phone chrome
- [x] Unpublished never appears / not schedulable
- [x] Type-check and build pass
- [ ] Lint — not configured in this repo
- [ ] Safari / Firefox / iOS device pass — canva listed as manual
- [ ] Move source-day update — Wave 7 PATCH
