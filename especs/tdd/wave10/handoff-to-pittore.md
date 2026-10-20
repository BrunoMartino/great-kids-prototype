# Handoff to Pittore — Wave 10

Wave 10 DB/Backend Green. Frontend owned paths for this wave are `—`. Paint the panel screens in **Wave 11** (`app/(panel)/**`) using the contracts below.

Flow: `backend-first` (this invocation: backend only). Graphify updated (`graphify update . --no-cluster`).

## DB / Backend status

- Red/Green passed: `npx vitest run` — 83 files, 335 tests.
- Migration: `db/migrations/100100_demo_seed.sql`. Wave 0 `Connection.applySchema` still only runs `000000`. `DemoSeedFactory.applyIfMissing()` runs the seed when the demo family is missing. Vitest does not auto-seed (empty-catalog tests stay valid). Dev/prod: first `getMockSession()` applies the seed.
- `getMockSession().familyId` defaults to the demo family UUID. Role stays Parent for family. Panel still switches Admin/Operator via `POST /api/panel/session`.
- Shared BE touchpoints: none (`backend/main.go` N/A; App Router).
- Babylon Gate: not run (user override this invocation).
- `.env` not edited. No MinIO in docker-compose.

## Seed UUIDs

| Thing | UUID |
|-------|------|
| Demo family (`familyId`) | `c10a0003-3333-4333-8333-000000000010` |
| Admin user | `c10a0001-1111-4111-8111-000000000001` |
| Operator user | `c10a0001-1111-4111-8111-000000000002` |
| Titular Parent (Marina Alves) | `c10a0001-1111-4111-8111-000000000003` |
| Plus plan | `c10a0002-2222-4222-8222-000000000001` |
| Free plan (Wave 0) | `24bcd40e-7ae3-581c-b8b9-65b1f11b0ac1` |
| Published: Movie night (Watch) | `c10a0004-4444-4444-8444-000000000001` |
| Published: Cartoon Saturday (Watch) | `c10a0004-4444-4444-8444-000000000002` |
| Published: Bedtime story (Read) | `c10a0004-4444-4444-8444-000000000003` |
| Published: Paper boats (Make) | `c10a0004-4444-4444-8444-000000000004` |
| Published: Living room fort (Play) | `c10a0004-4444-4444-8444-000000000005` |
| Draft: Draft telescope (Watch) | `c10a0004-4444-4444-8444-000000000007` |
| Draft: Draft clay animals (Make) | `c10a0004-4444-4444-8444-000000000008` |
| Material: Idea Book | `c10a0005-5555-4555-8555-000000000001` |
| Child | family member JSON only (`Leo`, `user_id: null`). No Child login. |

## Object store contract

- Prefix `great-kids/`. Bucket **`bd-files`** only. Never `dbruns-files` or `images.dbruns.com`.
- Vitest / unset `S3_*`: `LocalDiskAdapter`. Set `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`: `MinioAdapter`.
- Live upload with S3 unset → `S3 env missing` (not LocalDisk).
- Empty file or rejected type (not `image/*` or `application/pdf`) → 400, no path persisted.
- Upload field name: `file` (multipart). Image → `feat_img_path` / `img_path`. Other allowed type → `file_path`.

## Backend contracts (panel)

JSON envelopes `{ id, <key>: [] }` or `{ id, <entity> }`.

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/panel/catalog` | staff no-op (prototype open) | — | `{ id, missions: [{ id, title, category_id, review_status }] }` |
| POST | `/api/panel/catalog` | staff no-op | `{ category_id, title }` | `201 { id, mission: { id, category_id, review_status: "draft" } }`. Unknown category `400`. |
| PATCH | `/api/panel/catalog/{id}` | staff no-op | `{ title?, category_id?, description?, img_path? }` | `200 { id, mission }` |
| DELETE | `/api/panel/catalog/{id}` | staff no-op | — | soft-delete (`deleted=1`). Row hidden from GET. |
| POST | `/api/panel/catalog/{id}/image` | staff no-op | multipart `file` | `200 { id, mission }` with `img_path` under `great-kids/` |
| GET | `/api/panel/materials` | staff no-op | — | `{ id, materials: [...] }` |
| POST | `/api/panel/materials` | staff no-op | `{ type, title, description? }` | `201 { id, material }`. Types include `Book`, `Activity`. |
| PATCH/DELETE | `/api/panel/materials/{id}` | staff no-op | PATCH fields; DELETE soft | DELETE sets `deleted: true` |
| POST | `/api/panel/materials/{id}/upload` | staff no-op | multipart `file` | image → `feat_img_path`; pdf → `file_path` |
| GET | `/api/panel/users` | staff no-op | — | `{ id, users: [{ id, name, nick_name, email, role, status }] }` |
| PATCH | `/api/panel/users/{id}` | **Admin only** | `{ status?, name?, nick_name?, email? }` | Admin `200`. Operator `403`. `{ deleted: true }` `400`. Status `blocked` keeps the row. |
| GET/POST | `/api/panel/plans` | staff no-op | POST `{ name, status }` | GET `{ id, plans }`. POST `201 { id, plan }` |
| PATCH | `/api/panel/plans/{id}` | staff no-op | `{ status: "active" \| "inactive" }` | no hard delete |
| GET | `/api/panel/categories` | staff no-op | — | `{ id, categories }` (twelve seeds) |
| PATCH | `/api/panel/categories/{id}` | staff no-op | `{ name }` | slug unchanged |
| GET | `/api/panel/forecast-contexts` | staff no-op | — | `{ id, contexts }` |
| PATCH | `/api/panel/forecast-contexts/{id}` | staff no-op | `{ name }` | slug unchanged |
| POST | `/api/panel/session` | — | `{ role: "Admin" \| "Operator" }` | mock switch; `familyId` stays the demo family |

Existing `/api/missions` POST still creates drafts. Panel create should use `/api/panel/catalog`.

`PanelPolicy` / `StaffPolicy` stay no-op. **Only** `/api/panel/users` PATCH uses `UserWritePolicy` (Admin vs Operator).

## Rules of execution (Frontend)

- Panel is a normal web layout. No iPhone chrome. No Parent/Child family screens on the panel.
- Nav has no Responsável. Roles on panel: Admin and Operator only.
- Pittore owns Wave 11 `app/(panel)/**`. Do not write backend.

## What Pittore paints (Wave 11)

Nav: Catálogo, Materiais, Perguntas, Famílias, Planos, Utilizadores, Indicadores, Contextos.

- Mission create + curated create (use POST catalog / materials; optional image/file upload).
- Question row pencil/trash + search (existing `/api/panel/questions`).
- Admin blocks a user on Utilizadores; Operator sees users read-only (PATCH 403).
- Hide raw id fields in UI. No Responsável.

## Open questions

None for Frontend.

## After paint

Write `especs/tdd/wave11/handoff-to-scultore.md` (Wave 11 is Pittore-only). Wave 10 has no FE checkboxes.
