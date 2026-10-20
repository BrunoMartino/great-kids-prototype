# Wave 3 — Frontend verification (panel)

## Files written

- `app/(panel)/layout.tsx` — staff web shell; `SurfaceFacade.panelSurface()` → `data-chrome="none"`; header Painel / Catálogo; max-width 1920px
- `app/(panel)/page.tsx` — `/` staff home (no phone, no Parent/Child)
- `app/(panel)/catalog/page.tsx` — `/catalog`
- `app/(panel)/catalog/panel-catalog-facade.ts` — Facade over GET `/api/panel/session` and GET `/api/panel/catalog`
- `app/(panel)/catalog/panel-session-context.tsx` — `useContext` + `useEffect`; `PanelPolicy.assertStaff` after 200
- `app/(panel)/catalog/catalog-screen.tsx` — loading, 403 Acesso negado, catalog table with drafts

No Parent/Child screens. No Flowbite. No phone chrome.

## Commands

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass (exit 0) |
| Lint | Not present (no `lint` script); `oxlint app/(panel)` pass during paint |
| `npm run build` | Pass — `/` 172 B, `/catalog` 2.85 kB |

## Manual: acceptance

- Panel has no phone chrome. `/` and `/catalog`: `data-surface="panel"` `data-chrome="none"`; no `data-phone-chrome`; no Parent | Child control.
- Parent mock cannot open catalog. `GET /api/panel/session` → 403 `{"error":"forbidden"}`. UI heading **Acesso negado** / “Este catálogo é só para a equipe.”
- Admin/Operator catalog table (including drafts) is implemented for session 200. Live mock store defaults to Parent; there is no HTTP API to switch to Admin/Operator. Not verified live. See handoff backend signal.

## Acceptance

- [x] Panel has no phone chrome
- [x] Parent cannot open catalog (403 / Acesso negado)
- [ ] Admin/Operator can open catalog in the running app — UI ready; blocked on staff mock session API
- [x] Type-check and build pass
- [ ] Lint — not configured in this repo
