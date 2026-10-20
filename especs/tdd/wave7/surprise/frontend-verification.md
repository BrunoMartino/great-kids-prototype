# Wave 7 — Frontend verification (surprise)

## Files written

- `app/(family)/missions/surprise/page.tsx` — `/missions/surprise` inside family layout chrome
- `app/(family)/missions/surprise/surprise-screen.tsx` — one-click draw; empty explicit; hit reuses Wave 4 `MascotRevealedCopy`
- `app/(family)/missions/surprise/surprise-session-context.tsx` — `useContext` + `useEffect`; POST `/missions/surprise`
- `app/(family)/missions/surprise/post-surprise-command.ts` — Command
- `app/(family)/missions/surprise/surprise-payload.ts` — hit catalog copy or `{ mission_id: null }`; rejects invented miss copy
- Shared nav: `app/(family)/chrome/family-nav.tsx` — `Surpresa`

Mounted only under `app/(family)` → iPhone 15 Pro Max chrome. No Flowbite. No extra mascot API.

## Commands

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | App compile via `next build` Pass. Repo `tsc` still fails in existing `tests/pick/pick-ranker-adapter.test.ts` (not this lane) |
| Lint | Not present (no `lint` script) |
| `npm run build` | Pass — `/missions/surprise` 5.63 kB |

## Manual: acceptance

Family `76b0b6a7-c789-49fc-b4fa-808889336cae`.

- Screen is `data-surface="family"` inside `[data-phone-chrome="iphone-15-pro-max"]`. Parent \| Child control present. No full-bleed.
- Hit: **Missão surpresa** → catalog **Barquinhos de papel**, `data-reveal="typewriter"`, `[data-mascot-bubble]`, Wave 4 chrome. Copy is catalog, not invented.
- Empty: live catalog has a published row, so POST surprise always hits. Empty UI verified with the miss envelope `{ id, mission_id: null }` → `data-reveal="empty"`, `data-surprise-empty="true"`, heading **Nenhuma missão publicada.** No mascot bubble, no invented title/description.
- Child: **Surpresa só para Parent.**

## Acceptance

- [x] Surprise hit as mascot typewriter inside family chrome
- [x] Empty envelope shows explicit empty (no invented copy)
- [x] Type-check (Next build) and build pass
- [ ] Lint — not configured in this repo
- [ ] Live-DB empty (no published / exhausted non-repeatable) — catalog currently has Barquinhos
- [ ] Safari / Firefox / iOS device pass — canva listed as manual
