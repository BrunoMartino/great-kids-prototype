# Handoff to Scultore — Wave 3

Wave 3 Frontend painted. Do not start Wave 4 until the user starts Scultore again. family-shell and panel FE are done; forecast had no Frontend.

## Files written per lane

### family-shell

- `app/(family)/chrome/family-surface-protocol.ts`
- `app/(family)/chrome/family-app-view.ts`
- `app/(family)/chrome/family-surface-decorator.ts`
- `app/(family)/chrome/phone-chrome-decorator.tsx`
- `app/(family)/chrome/phone-chrome-frame.tsx`
- `app/(family)/chrome/index.ts`
- `app/(family)/layout.tsx` — shared touchpoint: `PhoneChromeFrame` + `FamilySessionProvider` + `ContextSwitchControl`; chrome `iphone-15-pro-max`
- `MASTER.md` — chrome section

### panel

- `app/(panel)/layout.tsx` — web shell, `data-chrome="none"`
- `app/(panel)/page.tsx` — `/`
- `app/(panel)/catalog/page.tsx` — `/catalog`
- `app/(panel)/catalog/panel-catalog-facade.ts`
- `app/(panel)/catalog/panel-session-context.tsx`
- `app/(panel)/catalog/catalog-screen.tsx`

### forecast

None (`FE: —`)

## FE checkboxes

- `especs/tdd/wave3/family-shell/fase3Task.md` — all four Frontend items marked.
- `especs/tdd/wave3/panel/fase3Task.md` — Frontend section added and marked.

## Type-check / lint / build

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass |
| Lint | Not configured (no project lint script) |
| `npm run build` | Pass (`/` static, `/catalog` 2.85 kB, `/context-switch` 3.33 kB) |

## Verification

- `especs/tdd/wave3/family-shell/frontend-verification.md`
- `especs/tdd/wave3/panel/frontend-verification.md`

## Router blocks merged

No `frontend/src/portals/*`. Family layout merged chrome Decorator around Wave 2 session provider/control. Panel layout owned by the panel lane (header + `/catalog` nav).

## Canva

Issues: Safari `100dvh` / `color-mix` without fallbacks on panel; Firefox table `min-width`; infinite `panel-load` under reduced-motion; phone-body overflow. Fixes in panel layout/catalog/home and family desk padding. Phone-body kept `overflow: hidden` so context-switch inner scroller remains the scroller (island must not cover scrolled content). Manual still needed: iOS Safari URL-bar, Firefox catalog horizontal scroll, reduced-motion on a real device.

## Graph

Updated. CLI `graphify 0.9.65`. Commands:

```bash
graphify extract . --code-only
graphify cluster-only . --no-label
```

`graphify-out/graph.json` + `GRAPH_REPORT.md` verified (cluster-only; 2768 nodes). Harness templates not touched.

## Backend signals

### No HTTP API to set mock session to Admin/Operator

- Feature: admin-panel
- Path: `internal/db/mock-session.ts`; `app/api/session/context/route.ts`
- Harness / TDD: Admin/Operator can open catalog; mock Admin/Operator opens panel; GET `/api/panel/session` 200 `{ role: "Admin" }` or `{ role: "Operator" }`
- Evidence: store defaults to `Parent`. Tests assign `getMockSession().role = "Admin"` in-process. `POST /api/session/context` with `Admin`/`Operator` returns 400. FE `/catalog` shows **Acesso negado** for the live Parent mock (403). Catalog table for staff is implemented but cannot be opened in the running app.
- Suggested correction: a staff mock switch on GET/POST `/api/panel/session` (or dedicated panel context) that sets `getMockSession().role` to Admin|Operator without creating auth tables. Family `applyRole` must keep skipping overwrite when role is already Admin/Operator.

## Not done

- Live Admin/Operator catalog 200 in the browser (blocked by the signal above).
- Forecast FE (none this wave).
- Project lint (no toolchain in `package.json`).
