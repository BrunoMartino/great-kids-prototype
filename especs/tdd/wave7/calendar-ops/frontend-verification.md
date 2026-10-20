# Wave 7 — Frontend verification (calendar-ops)

## Files written

- `app/(family)/forecast/page.tsx` — `/forecast` inside family layout chrome
- `app/(family)/forecast/forecast-screen.tsx` — finite week list, drop, done/move, rhythm modal
- `app/(family)/forecast/forecast-session-context.tsx` — `useContext` + `useEffect`; GET week + GET day
- `app/(family)/forecast/forecast-command.ts` — Command interface
- `app/(family)/forecast/week-suggestion.ts` — GET envelope, cap 5, no invented rows
- `app/(family)/forecast/drop-on-day-command.ts` — POST `/forecast/week`; missing day does not pick a day
- `app/(family)/forecast/patch-suggestion-command.ts` — PATCH done / moved
- `app/(family)/forecast/proposal-command.ts` — accept / dismiss POST `/rhythms/proposal`
- `app/(family)/forecast/rhythm-proposal-observer.ts` — Observer, unidirectional
- Shared nav: `app/(family)/chrome/family-nav.tsx` — `Previsão`

Mounted only under `app/(family)` → iPhone 15 Pro Max chrome. No Flowbite. Empty week is `Nenhuma sugestão publicada.` with no invented title.

## Commands

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | App compile via `next build` Pass. Repo `tsc` still fails in existing `tests/pick/pick-ranker-adapter.test.ts` (not this lane) |
| Lint | Not present (no `lint` script) |
| `npm run build` | Pass — `/forecast` 7.03 kB |

## Manual: acceptance

Family `76b0b6a7-c789-49fc-b4fa-808889336cae`, day `2026-10-21`.

- Screen is `data-surface="family"` inside `[data-phone-chrome="iphone-15-pro-max"]`. Parent \| Child control present. No full-bleed.
- GET week: finite list, catalog title **Barquinhos de papel** (`53ff9202-6b6b-4e29-8bf1-4fd5f8479c3a`).
- Empty day: **2026-10-21 · vazio**, “Nenhuma sugestão neste dia.”
- **Colocar neste dia** → POST drop → **2026-10-21 · scheduled** with that `mission_id`.
- Day field required: drop without a day is not sent (no silent default).
- Child: calendar-ops APIs stay Parent-only (same policy as Wave 5).

## Acceptance

- [x] Weekly suggestion list inside phone chrome
- [x] One-tap drop writes scheduled suggestion
- [x] List is finite (cap 5, catalog titles only)
- [x] Type-check (Next build) and build pass
- [ ] Lint — not configured in this repo
- [ ] Safari / Firefox / iOS device pass — canva listed as manual
- [ ] Four-repeat rhythm modal — not driven this run (needs four done/moved)
