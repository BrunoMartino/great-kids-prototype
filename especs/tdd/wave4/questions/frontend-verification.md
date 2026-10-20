# Wave 4 — Frontend verification (questions)

## Files written

- `app/(panel)/questions/page.tsx` — `/questions`
- `app/(panel)/questions/questions-facade.ts` — Facade over panel session + questions CRUD
- `app/(panel)/questions/questions-session-context.tsx` — `useContext` + `useEffect`; POST `/api/panel/session` then list
- `app/(panel)/questions/questions-screen.tsx` — loading, 403 Acesso negado, list/create/edit/soft-delete, kind chips
- `app/(panel)/questions/kind-filter-strategy.ts` — client kind filter (GET list without `?kind=` so deleted rows stay visible)

Shared touchpoint (Pittore): `app/(panel)/layout.tsx` nav **Perguntas** → `/questions`.

Panel web only. No phone chrome. No Parent/Child family screens. No Flowbite.

## Commands

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass (exit 0) |
| Lint | Not present (no `lint` script) |
| `npm run build` | Pass — `/questions` 5.79 kB |

## Manual: acceptance

- `/questions`: `data-surface="panel"` `data-chrome="none"`. No `data-phone-chrome`. Header Painel / Catálogo / Perguntas.
- Default Parent mock: heading **Acesso negado** / “Este banco é só para a equipe.”
- **Admin** via POST `/api/panel/session`: list + create form. Live: 201 Family-Quiz and Say-What; table showed three rows; **Say-What** chip left one row.
- Kind enum on the form: Family-Quiz \| Say-What only. Empty text does not POST (`formError`).
- Parent after staff: 403 UI again.

## Acceptance

- [x] Panel has no phone chrome
- [x] Staff CRUD against `/api/panel/questions` (Admin session first)
- [x] Parent cannot CRUD (403 / Acesso negado)
- [x] Kind Family-Quiz \| Say-What on the form
- [x] Type-check and build pass
- [ ] Lint — not configured in this repo
- [ ] Firefox table scroll / iOS input zoom — canva listed as manual
