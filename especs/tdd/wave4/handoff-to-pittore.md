# Handoff to Pittore — Wave 4

Wave 4 DB/Backend Green. Frontend not started. Do not start Wave 5 until Scultore consumes `handoff-to-scultore.md`.

Flow: `per-wave`. Graphify present: `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md`.

## DB / Backend status

- Wave 3 resume: FE chrome + panel verified on disk. Backend signal closed: `POST /api/panel/session` sets mock `Admin|Operator|Parent|Child` without passwords. Vitest green (`tests/panel/panel-session-switch.test.ts`).
- Wave 4 questions Red/Green passed (`npx vitest run tests/questions` — 12 passed).
- mascot is **FE only** (`BE: —`). Scultore wrote no mascot API.
- Migrations: none. Range 040200–040299 unused (Wave 0 owns `family_quiz` DDL).
- Shared BE touchpoints: none (App Router).
- No Babylon Gate this invocation.

## Rules of execution (Frontend)

- Parent/Child screens render ONLY inside the family mobile emulator (HTML iPhone 15 Pro Max). Never full-bleed desktop.
- Panel is a normal web layout and must not host Parent/Child family screens.
- Questions CRUD is **PANEL only**. Do not put bank create/edit/delete inside the family chrome.
- Pittore merges frontend shared touchpoints. Do not write backend.

Blocked: native mobile; Flowbite as dependency; family answering (Wave 5).

## Lane: mascot (mascot-mission)

- **FE owned:** `app/(family)/missions/mascot/**`
- TDD: `especs/design-docs/tdd-feature-mascot-mission.md`
- Plan: `especs/tdd/wave4/mascot/fase4.md` + `fase4Task.md`
- Patterns: Decorator (mascot message chrome) + Strategy (typewriter vs reduced-motion instant).
- Consumes an already-returned **published** mission `{ id, title, description, review_status: "published" }`. No new envelope. Unpublished never decorate. Empty title/description: explicit empty, no typewriter.
- Acceptance: mascot message with typewriter; unpublished never appear; Pittore verifies animation in the browser.
- Shared FE touchpoint: family chrome from Wave 3 (`app/(family)/chrome/**`). Mount mascot inside that chrome only.

## Lane: questions (question-bank)

- **FE owned:** `app/(panel)/questions/**`
- TDD: `especs/design-docs/tdd-feature-question-bank.md`
- Plan: `especs/tdd/wave4/questions/fase4.md` + `fase4Task.md` (FE checkboxes)
- Backend contracts (same process as family UI):

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/api/panel/session` | none (mock switch) | `{ "role": "Admin" \| "Operator" \| "Parent" \| "Child" }` | `200 {"role":"Admin"}` (no password). Invalid `400`. GET still 403 for Parent/Child. |
| GET | `/api/panel/session` | Admin/Operator | — | `200 {"role":"Admin"}` or `{"role":"Operator"}` |
| GET | `/api/panel/questions` | Admin/Operator | optional `?kind=Family-Quiz` or `Say-What` | `200 {"id":"<uuid>","questions":[{id,question_text,kind,status,weight,deleted},...]}` |
| POST | `/api/panel/questions` | Admin/Operator | `{ question_text, kind, weight, status }` | `201 {"id":"<uuid>","question":{…}}`. Empty text / invalid kind `400`. |
| GET | `/api/panel/questions/{id}` | Admin/Operator | — | `200 {"id":"<uuid>","question":{…}}` |
| PATCH | `/api/panel/questions/{id}` | Admin/Operator | same fields (partial) | `200 {"id":"<uuid>","question":{…}}` |
| DELETE | `/api/panel/questions/{id}` | Admin/Operator | — | `200 {"id":"<uuid>","question":{"deleted":true}}` (soft) |
| GET/POST/PATCH/DELETE | `/api/panel/questions*` | Parent/Child | — | `403 {"error":"forbidden"}` |

- `kind`: `Family-Quiz` \| `Say-What`. `status`: `active` \| `inactive`. `weight` ≥ 0. `deleted` boolean in JSON.
- Live family offer (deleted excluded) is backend Strategy only this wave — no family quiz UI.
- Acceptance: kind enum enforced; Parent cannot CRUD; panel has no phone chrome.
- Shared FE touchpoint: panel layout + router. No `frontend/src/portals/*`. Add panel nav to `/questions`.

## Open questions

None for Frontend.

## After paint

Write `especs/tdd/wave4/handoff-to-scultore.md` and `especs/tdd/wave4/<lane>/frontend-verification.md` (mascot + questions). Mark FE checkboxes.
