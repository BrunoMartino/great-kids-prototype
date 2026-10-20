# Handoff to Pittore — Wave 2

Wave 2 DB/Backend: Red and Green passed. Next.js App Router files are the route registry (no `backend/main.go`). No migrations in 020100–020199, 020200–020299, or 020300–020399 (Wave 0 schema already has the tables, Free plan seed, and generated `city`/`state`).

**Flow:** `per-wave`. Scultore stops here. Paint Wave 2 Frontend only; do not start Wave 3.

## Rules of execution (Frontend)

- Lane writes only its `FE:` owned paths.
- No unit tests on Frontend (`docs/harness/testing_expectation.md`). Verify type-check, lint, build, and browser notes per acceptance criterion. Write `especs/tdd/wave2/<lane>/frontend-verification.md`.
- Do not write backend, models, SQL, or Route Handlers.
- Child is a view, not an account (INV-002). No child photos. No Flowbite. No `.env`. No Babylon Gate changes.
- Blocked: Supabase Auth (mock session only); MinIO live upload; payments.
- Parent and Child screens render ONLY inside the family mobile emulator (HTML iPhone 15 Pro Max chrome). They never appear as full-bleed desktop pages. The Admin/Operator panel is a normal web layout and must not host Parent/Child family screens.
- Wave 2 session FE (context-switch) must live under `app/(family)` and only be visible inside that chrome. If chrome is Wave 3 parent-shell, do not ship Parent/Child views on the panel or on an unframed desktop route; mount them in the family surface that the chrome wraps.

Mark FE checkboxes in `especs/tdd/wave2/session/fase2Task.md` when verification is done. Then write `especs/tdd/wave2/handoff-to-scultore.md`.

## Lane session — has Frontend

**FE owned paths:** `app/(family)/context-switch/**`

**TDD:** `especs/design-docs/tdd-feature-context-switch.md`  
**Harness:** `docs/harness/features/feature-context-switch.md`  
**Approved FE plan:** `especs/tdd/wave2/session/fase2.md` + `fase2Task.md` (Frontend section)

**Acceptance (browser):**

- Default mock session is Parent.
- Switch shows Child views without creating a child login (`app_user` row).
- Child context cannot change plan (or invite adults); stay on Child view.

**Backend contracts (Wave 2 Green):**

| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | `/api/session` | — | `200 {"role":"Parent","presentation":"parent"}` (default). After Child switch: `{"role":"Child","presentation":"child"}`. After `DELETE /api/session`: `401`. |
| DELETE | `/api/session` | — | `204`; subsequent GET is `401`. |
| POST | `/api/session/context` | `{"role":"Child"}` or `{"role":"Parent"}` | `200 {"role":"Child","presentation":"child"}` or Parent/parent. Invalid role (e.g. Operator) → `400`. |

Presentation store is `app/api/session/presentation-strategy.ts` (not `internal/db/mock-session.ts`). Catalog/panel staff role remains `getMockSession().role` (Admin/Operator). Do not confuse panel staff mock with this Parent↔Child switch.

`ContextPolicy` (`policies/role.ts`): Child cannot change plan or invite.

**Frontend shared touchpoints:** family layout provider (`app/(family)/layout.tsx`). Pittore merges context-switch control into the family surface. No `frontend/src/portals/*` in this repo.

**GoF already on backend:** Strategy (Parent vs Child presentation) + Policy.

## Lane family — no Frontend (`FE: —`)

Do not paint. Backend only:

- `PUT /api/families/{id}/members` — envelope `{ id, members: [{ user_id, user_nickname, user_role }] }`; no photo; titular via `x-actor-user-id`.
- `PUT /api/families/{id}/address` — plain object `{ street, number, neighborhood, city, state, zip_code }` (not an envelope).
- `POST/PATCH /api/families/{id}/invites` — Pending/accept/revoke; no raw token in JSON.
- `PATCH /api/families/{id}/plan` — titular only.
- `GET /api/panel/families`, `PATCH /api/panel/families/{id}/plan` — Operator/Admin; Parent 403.

## Lane catalog-fiche — no Frontend (`FE: —`)

Do not paint. Backend only:

- `GET/PATCH /api/missions/{id}` — staff fiche; `img_path` not `feat_img_path`; values `{ id, values: [] }`. Parent GET published only, else 404 (never invent). Collection `GET /api/missions` stays Parent 403 (Wave 1).
- `POST /api/missions/{id}/review` — `{ review_status }` draft → in_review → published; re-review published → in_review. Parent 403.

## Open questions for the user (Frontend)

None from Scultore. Pittore may ask where the switch control sits inside the family layout (Wave 3 owns phone chrome).

## Backend test gate (already run)

- `npx vitest run tests/session` — 13 passed
- `npx vitest run tests/family` — 51 passed
- `npx vitest run tests/catalog-fiche` — 24 passed
- Wave 0 + Wave 1 suites also passed (no unexpected failures). Obsolete tests: none.
