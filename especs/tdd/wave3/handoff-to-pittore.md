# Handoff to Pittore — Wave 3

Wave 3 DB/Backend Green. Frontend not started. Do not start Wave 4 until Scultore consumes `handoff-to-scultore.md`.

Flow: `per-wave`. Graphify present: `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md`.

## DB / Backend status

- Red/Green gates passed for panel + forecast.
- family-shell is **FE only** (`BE: —`). Scultore wrote no API. Wave 2 already put minimum iPhone chrome on `app/(family)/layout.tsx` (`data-phone-chrome="minimum"`). This wave polishes chrome.
- Migrations: none. Ranges 030100–030399 unused (Wave 0 owns forecast DDL + four seeds).
- Shared BE touchpoints: none (`backend/main.go` does not exist; App Router).
- No Babylon Gate this invocation.

## Rules of execution (Frontend)

- Parent/Child screens render ONLY inside the family mobile emulator (HTML iPhone 15 Pro Max). Never full-bleed desktop. Panel is a normal web layout and must not host Parent/Child family screens.
- Pittore merges frontend shared touchpoints. Do not write backend.

Blocked: live weather API; native mobile; Flowbite as dependency.

## Lane: family-shell (parent-shell)

- **FE owned:** `app/(family)/chrome/**`
- TDD: `especs/design-docs/tdd-feature-parent-shell.md`
- Plan: `especs/tdd/wave3/family-shell/fase3.md` + `fase3Task.md` (FE checkboxes)
- Patterns: Decorator (phone chrome) + Facade (family vs panel). Backend Facade contract: panel `chrome: "none"`; family `chrome: "iphone-15-pro-max"` (`app/api/panel/surface-facade.ts`).
- Acceptance: family routes inside iPhone 15 Pro Max chrome; panel routes do not use phone chrome; no native mobile package (none in `package.json` today).
- Start from Wave 2 minimum chrome in family layout; polish into `chrome/**`. Do not unframe family UI.

## Lane: panel (admin-panel)

- **FE owned:** `app/(panel)/**`
- TDD: `especs/design-docs/tdd-feature-admin-panel.md`
- Plan: `especs/tdd/wave3/panel/fase3.md` + `fase3Task.md` (FE verification after paint)
- Backend contracts (same process as family UI):

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/panel/session` | Admin/Operator | — | `200 {"role":"Admin"}` or `{"role":"Operator"}` |
| GET | `/api/panel/catalog` | Admin/Operator | — | `200 {"id":"<uuid>","missions":[{id,title,category_id,review_status},...]}` (includes drafts) |
| GET | `/api/panel/families` | Admin/Operator | — | `200 {"id":"<uuid>","families":[...]}` (Wave 2) |
| GET | `/api/panel/*` | Parent/Child | — | `403 {"error":"forbidden"}` |

- Acceptance: panel has no phone chrome; Admin/Operator can open catalog; Parent cannot (403 on panel APIs already).
- Shared FE touchpoint: panel layout (`app/(panel)/layout.tsx` already `data-surface="panel"`). Router: no `frontend/src/portals/*`.

## Lane: forecast

- **FE: —** (none)

## Open questions

None for Frontend.

## After paint

Write `especs/tdd/wave3/handoff-to-scultore.md` and `especs/tdd/wave3/<lane>/frontend-verification.md` (family-shell + panel). Mark FE checkboxes.
