# Wave 11 — Frontend verification (panel)

Desktop panel. No iPhone chrome. No Responsável on session toolbars.

## Routes

| Route | Result |
|-------|--------|
| `/catalog` | Create form (category names + title, optional image). POST `/api/panel/catalog` 201. Table shows titles and category names, not raw UUIDs. Soft-delete icon. Admin \| Operador. |
| `/materials` | List + create (type Book\|Activity\|…). Seed **Idea Book** visible. Created **Wave 11 paper kites**. Soft-delete + upload. |
| `/questions` | Fields disabled until pencil; trash + hover tooltip; no Guardar; search + kind filter; selected chip `#ededed`. Edited a question (PATCH 200). Soft-deleted a row (DELETE 200). No Responsável. |
| `/families` | GET list. Demo family as **Família 1**, plan **Plus**. No UUID copy. |
| `/plans` | GET **Free** and **Plus**. POST form + PATCH status buttons. |
| `/users` | GET Admin, Operator, Marina. Admin blocked Marina (row stays, status Bloqueado). Operator: all Bloquear disabled. |
| `/indicators` | Toolbar Admin \| Operador only. |
| `/contexts` | GET names + slugs (no UUIDs). Pencil PATCH name. |

## Manual: acceptance

- [x] Create a mission (Watch / Wave 11 panel mission → Rascunho)
- [x] Create a material (Activity / Wave 11 paper kites)
- [x] Edit a question (pencil → PATCH)
- [x] Delete a question (trash → soft-delete)
- [x] Admin blocks a user (Marina → Bloqueado)
- [x] Operator sees users read-only (Bloquear disabled)
- [x] Demo seed after getMockSession (catalog missions, Idea Book, Plus, users)
- [x] No Responsável on panel toolbars
- [x] No raw UUIDs in UI copy
- [x] No phone chrome (`data-chrome="none"`)

## Commands

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Panel clean. Existing error in `internal/storage/minio-adapter.ts` (backend; not this wave). |
| `oxlint app/(panel)` | Pass |
| `npm run build` | Not run (docker `npm run dev` already serving; avoid SIGTERM) |
| Browser | Verified on `http://localhost:3000` via docker compose |

Optional image/file upload to MinIO not exercised (file picker). S3 unset live upload remains a backend 400.
