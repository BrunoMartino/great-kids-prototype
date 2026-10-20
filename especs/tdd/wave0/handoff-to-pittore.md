# Handoff to Pittore — Wave 0

## Status

Flow: `per-wave`. Wave 0 DB + Backend + Ops are Green. Frontend is yours. Do not start Wave 1.

- Red: 13 Vitest tests written, failed on missing modules.
- Green: 13 passed (`npx vitest run tests/connection.test.ts tests/schema-queryraw.test.ts tests/health.test.ts`).
- `npx tsc --noEmit` passes on current backend (no root layout yet).
- Schema applied from `db/migrations/000000_schema.sql` (copy of `my_docs/schema.sqlite.sql`, seeds included).
- Migrations: single file `000000_schema.sql`. No later-wave ranges.
- `backend/main.go` does not exist (Next.js Route Handlers). Health is `app/api/health/route.ts`.
- No `.env` written. Names only in `.env.example`.

## Frontend owned paths (Wave 0)

| Path | What |
|------|------|
| `app/layout.tsx` | Root `html`/`body` only. App shell. |
| `app/(panel)/layout.tsx` | Empty panel layout. |
| `app/(family)/layout.tsx` | Empty family layout. |

**Hard bans for these files**

- No phone chrome (iPhone 15 Pro Max frame is Wave 3 / parent-shell).
- No screens, pages, or feature UI.
- No Flowbite. No `/amaterasu-paint` yet (skill missing; ignore paint/cast).
- Do not write `internal/db/**`, `app/api/**`, `db/migrations/**`, `Dockerfile`, `docker-compose.yml`, `.env`.

## Approved Frontend plan

See `especs/tdd/wave0/platform/fase0.md` steps 9–12 and unchecked boxes in `especs/tdd/wave0/platform/fase0Task.md`.

1. `app/layout.tsx` — root document only; no phone chrome; no screens.
2. `app/(panel)/layout.tsx` — empty panel shell; no phone chrome; no screens.
3. `app/(family)/layout.tsx` — empty family shell; no phone chrome; no screens.
4. Type-check, lint, build. Write results to `especs/tdd/wave0/platform/frontend-verification.md`.
5. Manual: both group layouts render empty.

Frontend: no unit tests (`docs/harness/testing_expectation.md`).

## Backend contract (health)

`GET /api/health` — import `GET` from `app/api/health/route.ts` (tests do not hit HTTP).

Request: none.

Response: `200` JSON envelope (typed `HealthEnvelope`):

```json
{ "ok": true, "foreignKeys": true, "sessionRole": "Parent" }
```

- `ok`: always `true` on this handler.
- `foreignKeys`: `true` when `PRAGMA foreign_keys` is 1.
- `sessionRole`: mock in-memory store; default `Parent`. No auth APIs (Wave 2).
- No secrets, no `SQLITE_PATH`, no password/token/secret keys.

## Shared touchpoints (Pittore merges)

- `app/layout.tsx` — root layout (does not exist yet).
- `app/(panel)/layout.tsx` — panel route group.
- `app/(family)/layout.tsx` — family route group.

No other router entries in Wave 0.

## Rules of execution (binding)

- Lane writes only owned paths. You own the three layout files above.
- Layer order was DB → Backend → Frontend. You do Frontend only.
- Blocked parts are not implemented.
- Wave 1 starts only after Wave 0 exit criteria (including empty layouts rendering).

## Blocked items (do not implement)

- Supabase Auth — mock session only; `auth_user_id` unused.
- MinIO/S3 live upload.
- Payments (beyond Free plan seed already in SQL).
- Native mobile.
- Live weather API.
- Phone chrome / screens.

## Env (names only)

`.env.example`: `SQLITE_PATH=./data/great-kids.sqlite`

Pittore does not write `.env`.

## Open questions

None for Frontend in Wave 0.

## After you finish

Write `especs/tdd/wave0/handoff-to-scultore.md` (FE checkboxes, `frontend-verification.md`, type-check/lint/build results, any backend signals). Then Ingegnere resumes Scultore.
