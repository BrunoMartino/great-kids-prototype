# Handoff to Pittore — Wave 9

Wave 9 DB/Backend Green. Frontend not started.

Flow: `per-wave`. Graphify present: `graphify-out/graph.json`.

## DB / Backend status

- Wave 8 mission-play Green. Wave 9 diary + indicators Red/Green passed (`npx vitest run tests/diary tests/indicators` — 23 passed).
- Migration: none. Lane ranges 090100–090199 and 090200–090299 unused (DB: —). `family_diary` columns already exist from Wave 0 (`family_notes`, `mission_note`, `deleted`). Indicators are live queries, no fact table.
- Shared BE touchpoints: none (App Router). `models/family_diary` extended by the diary lane only.
- Babylon Gate: user override OFF this invocation — not run.

## Rules of execution (Frontend)

- Parent/Child screens render ONLY inside the family mobile emulator (HTML iPhone 15 Pro Max). Never full-bleed desktop.
- Panel is a normal web layout and must not host Parent/Child family screens.
- Pittore merges frontend shared touchpoints. Do not write backend.
- Layer order: Frontend last.

Blocked: child photos / avatars / media library; notes relational table; public diary sharing; indicators warehouse table; historical cubes; Parent-facing indicators dashboard; MinIO uploads; payments; auth tables; native mobile.

## Lane: diary (note-types, family-diary)

- **FE owned:** `app/(family)/diary/**`
- TDDs: `especs/design-docs/tdd-feature-note-types.md`, `especs/design-docs/tdd-feature-family-diary.md`
- Plan: `especs/tdd/wave9/diary/fase9.md` + `fase9Task.md` (FE steps are the approved plan)
- Patterns: Strategy (five note kinds); Composite (`NotesComposite` / `MissionNotesComposite`); Command (`AddNoteCommand`). Text only (INV-002). Envelopes `{ id, notes: [] }` (INV-004).

Backend contracts:

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/families/{id}/diary` | Parent or Child (view) | — | `200 {"id":"<fam uuid>","family_notes":{"id","notes":[{"id","text","kind"}]},"mission_note":{"id","notes":[{"mission_id","family_mission_id","note":{"id","text","kind"}}]}}`. Empty husk: both `notes` arrays empty (not a bare array). `deleted = 1` hides notes (empty arrays, envelope kept). Unknown family `404`. |
| POST | `/api/families/{id}/diary` | Parent | `{ "kind", "text" }` or `{ "kind", "text", "mission_id", "family_mission_id" }` | Same envelopes `200`. Kinds: `phrase` \| `first_time` \| `funny` \| `learned` \| `family_fail`. Empty/whitespace text `422`. Unknown kind `422` (not stored). `photo` / `image` / `img` keys or `data:image` in text `422` (INV-002). Link to a `family_mission` the family never had `422`. Child `403`. |

Five kinds must be choosable in the UI. No photo picker. Mission memory uses a completed cycle’s `mission_id` + `family_mission_id`.

Shared FE touchpoint: family chrome from Wave 3. Mount diary inside that chrome only. No `frontend/src/portals/*`.

## Lane: indicators (indicators-panel)

- **FE owned:** `app/(panel)/indicators/**`
- TDD: `especs/design-docs/tdd-feature-indicators-panel.md`
- Plan: `especs/tdd/wave9/indicators/fase9.md` + `fase9Task.md` (FE steps are the approved plan)
- Pattern: Facade (`IndicatorsFacade`) — live counts, no indicators table.

Backend contracts:

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/panel/indicators` | Admin or Operator | — | `200 {"id":"<uuid>","scheduled":0,"completed":0,"repeated":0}`. Empty dataset: zeros, not an error splash. `scheduled` = calendar suggestion items with `status = "scheduled"`. `completed` = `family_mission.status = Completed` row count. `repeated` = `(fam_id, mission_id)` groups with Completed count ≥ 2. Parent `403`. Child `403`. |

Panel is a normal web layout (no phone chrome). Do not host family diary screens here.

## Frontend shared touchpoints

- Family chrome (`app/(family)/chrome/**`) — mount diary inside iPhone 15 Pro Max only.
- Panel layout (`app/(panel)/**`) — mount indicators as a staff page.
- No `frontend/src/portals/*`. Pittore merges family nav + panel nav entries.

## Open questions

None for Frontend.

## After paint

Write `especs/tdd/wave9/handoff-to-scultore.md` and `especs/tdd/wave9/<lane>/frontend-verification.md` per lane. Mark FE checkboxes in each `fase9Task.md`.
