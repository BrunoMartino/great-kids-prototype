# Wave 4 — Frontend verification (mascot)

## Files written

- `app/(family)/missions/mascot/page.tsx` — `/missions/mascot` inside family layout chrome
- `app/(family)/missions/mascot/mascot-screen.tsx` — phone-body screen, id field, Ver vazio, Ver não publicada
- `app/(family)/missions/mascot/mascot-mission-context.tsx` — `useContext` + `useEffect`; GET `/api/missions/{id}`
- `app/(family)/missions/mascot/published-mission.ts` — published-only core
- `app/(family)/missions/mascot/mission-message-protocol.ts` — `IMissionMessage`
- `app/(family)/missions/mascot/mission-decorator.ts` — base Decorator
- `app/(family)/missions/mascot/mascot-message-decorator.ts` — mascot voice wrap; unpublished throws
- `app/(family)/missions/mascot/reveal-strategy.ts` — Strategy base
- `app/(family)/missions/mascot/typewriter-reveal-strategy.ts` — slow 18×72ms then 16ms
- `app/(family)/missions/mascot/instant-reveal-strategy.ts` — full text
- `app/(family)/missions/mascot/mascot-revealed-copy.tsx` — bubble + typewriter/instant/empty

Mounted only under `app/(family)` → iPhone 15 Pro Max chrome. No Flowbite. No panel route.

## Commands

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass (exit 0) |
| Lint | Not present (no `lint` script) |
| `npm run build` | Pass — `/missions/mascot` 3.94 kB |

## Manual: acceptance

- `/missions/mascot` is `data-surface="family"` inside `[data-phone-chrome="iphone-15-pro-max"]` (458×960). Parent \| Child control present. No full-bleed.
- Default (no id): **Nenhuma missão publicada.** No `[data-mascot-bubble]`. `data-mascot-unpublished="true"`.
- **Ver vazio:** bubble + **Missão vazia** / “Sem título e sem descrição.” `data-reveal="empty"`. No typewriter.
- **Ver não publicada:** unpublished empty, no bubble.
- Draft id `0330079b-6a42-417c-b486-d47d43dabcfd`: unpublished, no bubble.
- Published id `53ff9202-6b6b-4e29-8bf1-4fd5f8479c3a` (“Barquinhos de papel”): bubble, `data-reveal="typewriter"`, caret while typing, copy from catalog (not invented).
- Reduced-motion: Instant Strategy + CSS `animation: none`; caret hidden. Not re-checked on a physical device this run.

## Acceptance

- [x] Mascot message with typewriter inside family chrome only
- [x] Unpublished never appears (no decorator bubble)
- [x] Empty copy skips typewriter
- [x] Type-check and build pass
- [ ] Lint — not configured in this repo
- [ ] Reduced-motion on a real device / Safari / Firefox — canva listed as manual
