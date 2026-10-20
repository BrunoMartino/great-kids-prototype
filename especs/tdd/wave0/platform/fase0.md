# Phase 0 — Green (platform)

## Context

Wave 0 platform lane. Red tests (13) live in:

- `tests/connection.test.ts` — Singleton + `PRAGMA foreign_keys`
- `tests/schema-queryraw.test.ts` — schema apply, seeds, idempotent boot, FK reject, `queryRaw`
- `tests/health.test.ts` — GET 200 envelope, Parent session, no secrets

No mocks. Tests use a temp `SQLITE_PATH` file and `vi.resetModules()` (no production `destroy()`).

Triangulation skipped: connection negative (no invalid input on `getConnection`); health negative DB-down (Wave 0 only requires 200 when DB is up); session switch (Wave 2).

## Red command

```bash
npx vitest run tests/connection.test.ts tests/schema-queryraw.test.ts tests/health.test.ts
```

Expected Red: `Cannot find package '@/internal/db/connection'` and `Cannot find package '@/app/api/health/route'`.

## Green steps

DB first, then Backend, then Frontend (Pittore). Do not write Frontend files in this phase.

1. Copy `my_docs/schema.sqlite.sql` to `db/migrations/000000_schema.sql` (byte-faithful; includes seeds). Do not invent tables or auth FKs.
2. Implement `internal/db/connection.ts`:
   - GoF Singleton class `Connection` matching the documented TypeScript classic shape: private static `_instance`, private constructor, public static `instance` getter with lazy create. Return `_instance` (do not recurse on the getter).
   - Constructor properties: open `better-sqlite3` on `process.env.SQLITE_PATH` or `./data/great-kids.sqlite`; `mkdir` parent; `PRAGMA foreign_keys = ON` on every new connection; apply schema once if `plan` is absent (`CREATE`/`INSERT` are not `IF NOT EXISTS`).
   - Export `getConnection()` returning the sqlite database.
   - Export `queryRaw(p_sql, p_params)` typed; bind `p_params`; never concatenate. SELECT/PRAGMA/WITH → rows; other statements → `run` then `[]`. No `any`. Parameters prefixed `p_`.
3. Implement `internal/db/mock-session.ts`: in-memory store, default role `Parent`. No auth APIs, no passwords, no auth tables.
4. Implement `app/api/health/route.ts`: `GET` → 200 JSON `{ ok: true, foreignKeys: boolean, sessionRole: role }`. Load DB + mock session. No secrets, no `SQLITE_PATH` in the body.
5. Add `next.config.ts` (`serverExternalPackages: ['better-sqlite3']`), `next-env.d.ts`. Do not add Flowbite, Prisma, or any ORM. Do not create `app/layout.tsx` or route-group layouts.
6. Add `Dockerfile` and `docker-compose.yml` (dev). Nixpacks uses `package.json` scripts; no Nixpacks file required.
7. Write `.env.example` with `SQLITE_PATH=./data/great-kids.sqlite` only. Do not write `.env`.
8. Update `.gitignore` so `node_modules`, `.next`, `data/`, `*.sqlite` are ignored and `.env.example` is not ignored by `.env.*`.

### Frontend (Pittore only — do not implement here)

9. `app/layout.tsx` — root `html`/`body` only; no phone chrome; no screens.
10. `app/(panel)/layout.tsx` — empty panel shell; no phone chrome; no screens.
11. `app/(family)/layout.tsx` — empty family shell; no phone chrome; no screens.
12. Type-check, lint, build; manual: both group layouts render empty.

## Verification

```bash
npx vitest run tests/connection.test.ts tests/schema-queryraw.test.ts tests/health.test.ts
```

Done when all 13 pass. Greenfield: no `refactor-fase0.md`.

## Do not implement

- Frontend layouts or any UI
- Supabase Auth, auth tables, passwords, `REFERENCES auth.users`
- MinIO live upload, payments, native mobile, live weather
- Babylon Gate / Lefthook / `quality-baseline.json` / `check.sh`
- Wave 1+ features
- `.env`
