# Wave 9 — Frontend verification (indicators)

## Files written

- `app/(panel)/indicators/page.tsx` — `/indicators` staff panel, no phone chrome
- `app/(panel)/indicators/indicators-screen.tsx` — scheduled / completed / repeated cards; zeros empty
- `app/(panel)/indicators/indicators-session-context.tsx` — `useContext` + `useEffect`; Admin / Operator / Parent switch
- `app/(panel)/indicators/indicators-facade.ts` — GET `/api/panel/indicators` + panel session
- Shared nav: `app/(panel)/layout.tsx` — **Indicadores**

Mounted only under `app/(panel)`. No Flowbite. No family diary screens.

## Commands

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass |
| Lint | Not present (no `lint` script) |
| `npm run build` | Pass — `/indicators` 3.35 kB |

## Manual: acceptance

Panel layout `data-surface="panel"`. No `[data-phone-chrome]`. Nav: Catálogo, Perguntas, Indicadores.

- Parent (Responsável): **Acesso negado** / “Este painel é só para a equipe.” HTTP 403 on GET `/api/panel/indicators`.
- Admin: counts **Agendadas 2**, **Concluídas 1**, **Repetidas 0** (`data-indicator-value`). `data-indicators-empty="false"`.
- Empty zeros: cards still render `0`; caption “Nenhuma atividade ainda.” when all three are zero — not an error splash.

## Acceptance

- [x] Staff panel shows scheduled / completed / repeated
- [x] Zeros on empty (not error splash)
- [x] Parent 403
- [x] No phone chrome
- [ ] Lint — not configured in this repo
- [x] `npm run build`
- [ ] Safari / Firefox / iOS device pass — canva listed as manual
