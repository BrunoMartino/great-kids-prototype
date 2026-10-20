# Handoff to Scultore — Wave 11

Wave 11 Frontend painted (Pittore-only). Do not start Wave 12 until the user asks. No phone chrome, no MASTER.md rewrite, no `/paint` this wave.

## Files written per lane

Panel (`app/(panel)/**`):

- `layout.tsx` — nav: Catálogo, Materiais, Perguntas, Famílias, Planos, Utilizadores, Indicadores, Contextos
- `shell/staff-session-toolbar.tsx` — Admin \| Operador only; POST `/api/panel/session` `{ role }`
- `shell/panel-staff-facade.ts`, `shell/panel-icons.tsx`, `shell/panel-screen-styles.ts`
- `catalog/**` — create POST `/api/panel/catalog`, optional image POST `/api/panel/catalog/{id}/image` field `file`, DELETE soft-delete icon, category names not UUIDs
- `materials/**` — `/materials` list/create, upload POST `/api/panel/materials/{id}/upload`, soft-delete
- `questions/**` — pencil unlocks row; trash + hover tooltip; Guardar removed; search + kind filter; selected chip `#ededed`; no Responsável
- `families/**` — GET `/api/panel/families`
- `plans/**` — GET/POST `/api/panel/plans`, PATCH `/api/panel/plans/{id}` status
- `users/**` — GET `/api/panel/users`; PATCH block Admin only; Operator write controls disabled
- `indicators/**` — Responsável removed from toolbar
- `contexts/**` — GET/PATCH `/api/panel/forecast-contexts`
- `page.tsx` — tap-highlight on home link (canva)

No backend, models, Route Handlers, Vitest, `.env`, or Babylon Gate.

## FE checkboxes

No `fase11Task.md`. Verification: `especs/tdd/wave11/frontend-verification.md`.

## Type-check / lint / build

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | No `app/(panel)` errors. Pre-existing `internal/storage/minio-adapter.ts` TS2769. |
| `oxlint app/(panel)` | Pass |
| `npm run build` | Not run (dev already up in docker compose) |

## Verification

- `especs/tdd/wave11/frontend-verification.md`
- Browser on docker `localhost:3000`: catalog create 201, materials create, questions PATCH + DELETE, users Admin block + Operator disabled writes, families/plans/contexts load. Seed visible after session GET.

## Router blocks merged

No `frontend/src/portals/*`. Panel nav owned in `app/(panel)/layout.tsx`.

## Canva

Safari/Firefox/Chrome: drop `transform` on `<tr>`; `100dvh` without `-webkit-fill-available` shrinking desktop; tooltip overflow; `requestSubmit` fallback; moz appearance; rgba fallbacks. Manual still: file-picker overlay, number-input wheel, reduced-motion on a real device.

## Graph

Updated. `graphify update .` — 4788 nodes. `graphify-out/graph.json` + `GRAPH_REPORT.md` verified. Harness templates not touched.

## Backend signals

### `tsc` fails on MinIO adapter

- Feature: object-storage
- Path: `internal/storage/minio-adapter.ts` (~L147)
- Harness / measurement: `npx tsc --noEmit` TS2769 — `Buffer` not assignable to `BodyInit`
- Evidence: only error in the project typecheck; panel FE is clean
- Suggested correction: pass `Uint8Array` / `Blob` (or `buffer.buffer`) to `fetch` body, not Node `Buffer`

## Not done

- Live multipart image/file upload against MinIO (file picker not driven; S3 unset → 400)
- Wave 12 (phone / `/child` / MASTER paint) — out of scope
- Project lint script — none in `package.json`
- `npm run build` this invocation
