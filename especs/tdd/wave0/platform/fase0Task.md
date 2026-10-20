# Phase 0 — Green

- [x] Copy `my_docs/schema.sqlite.sql` → `db/migrations/000000_schema.sql`
- [x] `internal/db/connection.ts` — Singleton + `PRAGMA foreign_keys = ON` + schema apply if `plan` missing
- [x] `queryRaw(p_sql, p_params)` typed binds; no concatenation; no `any`
- [x] `internal/db/mock-session.ts` — in-memory; default Parent; no auth APIs
- [x] `app/api/health/route.ts` — GET 200 `{ ok: true, foreignKeys, sessionRole }`; no secrets
- [x] `next.config.ts` + `next-env.d.ts` (no Flowbite, no ORM, no FE layouts)
- [x] `Dockerfile` + `docker-compose.yml` (dev)
- [x] `.env.example` with `SQLITE_PATH=./data/great-kids.sqlite` (never `.env`)
- [x] `.gitignore` — ignore `node_modules`, `.next`, `data/`, `*.sqlite`; keep `.env.example`
- [x] Phase tests pass: `npx vitest run tests/connection.test.ts tests/schema-queryraw.test.ts tests/health.test.ts`
- [x] Append rows to `especs/testsReadme.md`
- [x] Frontend (Pittore): `app/layout.tsx` root only, no phone chrome, no screens
- [x] Frontend (Pittore): `app/(panel)/layout.tsx` empty panel, no phone chrome, no screens
- [x] Frontend (Pittore): `app/(family)/layout.tsx` empty family, no phone chrome, no screens
- [x] Frontend (Pittore): type-check, lint, build + manual empty layouts
