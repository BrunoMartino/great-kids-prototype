# Handoff to Pittore — Wave 8

Wave 8 DB/Backend Green. Frontend not started. Do not start Wave 9 until Scultore consumes `handoff-to-scultore.md`.

Flow: `per-wave`. Graphify present: `graphify-out/graph.json`.

## DB / Backend status

- Wave 7 surprise Green (Factory opens `family_mission` Accepted). Wave 8 mission-play Red/Green passed (`npx vitest run tests/mission-play` — 20 passed). Full suite 303 passed.
- Migration: `db/migrations/080100_family_mission_title.sql` (`ALTER TABLE family_mission ADD COLUMN title TEXT`). Wave 0 `Connection.applySchema` still only applies `000000`; the model runs `PRAGMA table_info` + ADD if missing so tests and runtime see `title`.
- Shared BE touchpoints: none (App Router). `models/family_mission` extended by this lane only.
- Babylon Gate: user override OFF this invocation — not run.

## Rules of execution (Frontend)

- Parent/Child screens render ONLY inside the family mobile emulator (HTML iPhone 15 Pro Max). Never full-bleed desktop.
- Panel is a normal web layout and must not host Parent/Child family screens.
- Pittore merges frontend shared touchpoints. Do not write backend.
- Layer order: Frontend last. Do not start Wave 9.

Blocked: unique `(fam_id, mission_id)`; auto-skip closing; staff-forced complete from the panel; concurrent complete locking; Child-context complete rules; nightly counter recompute; payments; auth tables; native mobile.

## Lane: mission-play (mission-cycle, completed-missions)

- **FE owned:** `app/(family)/missions/cycle/**`, `app/(family)/missions/completed/**`
- TDDs: `especs/design-docs/tdd-feature-mission-cycle.md`, `especs/design-docs/tdd-feature-completed-missions.md`
- Plan: `especs/tdd/wave8/mission-play/fase8.md` + `fase8Task.md` (FE steps are the approved plan)
- Patterns: State (`FamilyMissionCycle` Accepted/Doing/Completed); Command (`StartDoingCommand`, `CompleteMissionCommand`). Closing `{ do_again, save_memory }` only on complete, same transaction as status + `missions_completed` (INV-003). GET is a read of that Command’s outcomes.

Backend contracts:

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| PATCH | `/api/family-missions/{id}` | Parent | `{ "status": "Doing" }` or `{ "status": "Completed", "closing": { "do_again", "save_memory" } }` | `200 {"id","fam_id","mission_id","status","closing"}`. `closing` is `null` on Doing and the plain object on Completed (not `{ id, key: [] }`). Illegal jump (Accepted→Completed, Completed→Accepted, other reverse) `422`. Missing or envelope `closing` `422` (row stays Doing, counter unchanged). Unknown id `404`. Child `403`. |
| GET | `/api/families/{id}/missions?status=Completed` | Parent | — | `200 {"id":"<fam uuid>","missions":[{"id","mission_id","status":"Completed","title","completed_at","closing"}]}`. Empty family: `{"id","missions":[]}`. Title is the cycle-row snapshot (survives later unpublish). Drafts/Accepted/Doing omitted. Unknown family `404`. Child `403`. `status` other than `Completed` `422`. |

Cycle: Accepted → Doing → Completed only. Repeatable catalog mission: second cycle is a **new** `family_mission` row. Non-repeatable: advancing a second row `422`; `missions_completed` stays at one.

Shared FE touchpoint: family chrome from Wave 3; surprise/mascot from Waves 4–7 supplies the Accepted row. Mount cycle + completed history inside that chrome only. No `frontend/src/portals/*`.

## Frontend shared touchpoints

- Family chrome (`app/(family)/chrome/**`) — mount cycle + completed inside iPhone 15 Pro Max only.
- Surprise (`app/(family)/missions/surprise/**`) produces the Accepted `id` used by PATCH.
- No `frontend/src/portals/*`. Pittore merges family nav entries.

## Open questions

None for Frontend.

## After paint

Write `especs/tdd/wave8/handoff-to-scultore.md` and `especs/tdd/wave8/mission-play/frontend-verification.md`. Mark FE checkboxes in `fase8Task.md`.
