# Wave 8 — Frontend verification (mission-play)

## Files written

- `app/(family)/missions/cycle/page.tsx` — `/missions/cycle` inside family layout chrome
- `app/(family)/missions/cycle/cycle-screen.tsx` — Accepted → Doing → Completed; closing modal `{ do_again, save_memory }`
- `app/(family)/missions/cycle/cycle-session-context.tsx` — `useContext` + `useEffect`; consumes `?cycle=` from surprise
- `app/(family)/missions/cycle/cycle-ui-state.ts` — State objects (`AcceptedState` / `DoingState` / `CompletedState`); illegal jumps throw; `offeredCommands()` hides them
- `app/(family)/missions/cycle/cycle-command.ts` — Command `execute` / `undo`
- `app/(family)/missions/cycle/start-doing-command.ts` — PATCH `{ status: "Doing" }`
- `app/(family)/missions/cycle/complete-mission-command.ts` — PATCH `{ status: "Completed", closing }`
- `app/(family)/missions/cycle/cycle-payload.ts` — closing is a plain object (INV-004)
- `app/(family)/missions/completed/page.tsx` — `/missions/completed` inside family layout chrome
- `app/(family)/missions/completed/completed-screen.tsx` — GET Completed list with title snapshot; empty envelope
- `app/(family)/missions/completed/completed-session-context.tsx` — `useContext` + `useEffect`
- `app/(family)/missions/completed/list-completed-command.ts` — GET `?status=Completed`
- `app/(family)/missions/completed/completed-payload.ts` — `{ id, missions: [] }`
- `app/(family)/missions/completed/completed-command.ts` — Command interface
- Shared nav: `app/(family)/chrome/family-nav.tsx` — `Ciclo`, `Completas`
- Surprise merge: `app/(family)/missions/surprise/surprise-session-context.tsx` + `surprise-screen.tsx` — keeps Accepted `id`, **Fazer agora** → cycle

Mounted only under `app/(family)` → iPhone 15 Pro Max chrome. No Flowbite.

## Commands

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | App FE files clean. Repo still fails in existing backend `app/api/families/[id]/forecast/week-list-strategy.ts` (`title` `string \| undefined`) and `services/mission_pick/catalog-pick-strategy.ts` (`values` possibly undefined). Not this lane. |
| Lint | Not present (no `lint` script) |
| `npm run build` | Fail on the same pre-existing `week-list-strategy.ts` type error. Compile step of Next succeeded before type-check. |

## Manual: acceptance

Family `76b0b6a7-c789-49fc-b4fa-808889336cae`. Screens are `data-surface="family"` inside `[data-phone-chrome="iphone-15-pro-max"]`. Parent \| Child control present. No full-bleed.

- Empty history: GET Completed → **Nenhuma missão concluída.** `data-completed-empty-state="true"`. Nav includes Ciclo / Completas.
- Cycle from surprise: **Missão surpresa** → **Fazer agora** with Accepted id `b29c8cc2-fe8c-4e20-b222-67a5c2ed1275`. Status **Accepted**. Offered command: **Começar** only (`data-cycle-command="start"`). Complete not offered.
- Start: PATCH Doing. Status **Doing**. Offered: **Concluir** only.
- Closing modal: Fariam de novo? Vale guardar na memória? Submit `{ do_again: true, save_memory: true }`. Status **Completed**. Offered commands empty. Copy: fariam de novo; guardar na memória.
- History list: **Barquinhos de papel** title snapshot + closing. Chrome still present.
- Child: **Histórico só para Parent.**

## Acceptance

- [x] Cycle Accepted → Doing → Completed + closing question inside family chrome
- [x] Illegal transitions not offered
- [x] Empty history envelope
- [x] Completed list with stored title
- [x] FamilyNav entries
- [ ] Lint — not configured in this repo
- [ ] `npm run build` — blocked by pre-existing backend type error (signal)
- [ ] Safari / Firefox / iOS device pass — canva listed as manual
