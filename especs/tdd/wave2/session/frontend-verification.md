# Wave 2 — Frontend verification (session)

## Files written

- `app/(family)/context-switch/page.tsx` — `/context-switch` inside family chrome
- `app/(family)/context-switch/family-session-context.tsx` — `useContext` + `useEffect`; GET `/api/session`; POST `/api/session/context`
- `app/(family)/context-switch/context-switch-control.tsx` — Parent | Child segmented control
- `app/(family)/context-switch/context-switch-screen.tsx` — Parent/Child views; Child deny sheet for plan/invite
- `app/(family)/layout.tsx` — merged provider + control; minimum iPhone 15 Pro Max CSS chrome (`data-phone-chrome="minimum"`)
- `MASTER.md` — family tokens (soft familial). Wave 3 chrome may extend.

No panel route hosts Parent/Child. No Flowbite. No child photos. No `app_user` insert from FE.

## Commands

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass (exit 0) |
| Lint | Not present (no `lint` script; no project `eslint` / `biome.json` / `.oxlintrc.json`) |
| `npm run build` | Pass — route `○ /context-switch` 2.92 kB |

## Manual: acceptance

- Default mock session is Parent. Browser: badge **Visão Parent**, heading **Casa da família**. `GET /api/session` → `{"role":"Parent","presentation":"parent"}`.
- Switch shows Child views without creating a child login. Control POST Child → badge **Visão Child**, heading **Visão da criança**. `GET /api/session` → `{"role":"Child","presentation":"child"}`. FE does not POST `/api/app-users`.
- Child context cannot change plan or invite; stays on Child. **Alterar plano** / **Convidar adulto** open deny sheet (**Ação bloqueada**); session remains Child. Parent view shows titular actions as available (no family id invented).
- Screens render only inside `[data-phone-chrome="minimum"]` on `data-surface="family"`. Desk is cream; phone is 430×932 + 14px bezel. Not full-bleed. `data-surface="panel"` absent on this route.
- Loading, view change, and deny sheet are animated (`transform`/`opacity`); `prefers-reduced-motion` disables motion.

## Acceptance

- [x] Default session is Parent
- [x] Switch shows Child views without creating a child login
- [x] Child context cannot change plan (or invite); stay on Child view
- [x] Type-check and build pass
- [ ] Lint — not configured in this repo
