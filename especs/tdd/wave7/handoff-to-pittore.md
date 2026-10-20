# Handoff to Pittore — Wave 7

Wave 7 DB/Backend Green. Frontend not started. Do not start Wave 8 until Scultore consumes `handoff-to-scultore.md`.

Flow: `per-wave`. Graphify present: `graphify-out/graph.json`.

## DB / Backend status

- Wave 6 pick Green. Wave 7 calendar-ops + surprise Red/Green passed (`npx vitest run tests/calendar-ops tests/surprise` — 33 passed).
- Migrations: none. Ranges 070100–070199 and 070200–070299 unused (Wave 0 owns `family_calendar` / `family_profile` / `family_mission` DDL).
- Shared BE touchpoints: none (App Router). `models/family_calendar.listByFamily` added by calendar-ops only. `models/family_mission` created by surprise only.
- Babylon Gate: user override OFF this invocation — not run.

## Rules of execution (Frontend)

- Parent/Child screens render ONLY inside the family mobile emulator (HTML iPhone 15 Pro Max). Never full-bleed desktop.
- Panel is a normal web layout and must not host Parent/Child family screens.
- Pittore merges frontend shared touchpoints. Do not write backend.
- Wave 5 calendar PUT stays create-once. This wave owns PATCH done/moved and forecast drop.

Blocked: live weather API; push provider; auto-insert rhythm without accept; invented catalog copy; payments; auth tables; native mobile.

## Lane: calendar-ops (weekly-suggestion, reminders)

- **FE owned:** `app/(family)/forecast/**`
- TDDs: `especs/design-docs/tdd-feature-weekly-suggestion.md`, `especs/design-docs/tdd-feature-reminders.md`
- Plan: `especs/tdd/wave7/calendar-ops/fase7.md` + `fase7Task.md` (FE steps are empty — paint forecast UI from contracts below)
- Patterns: Strategy (`WeekListStrategy` finite published list, cap 5); Command (`DropOnDay`, `MarkDone`, `MoveDay`); Observer (`RepeatCountObservable` → `RhythmProposalObserver`, unidirectional, no calendar write).

Backend contracts:

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/families/{id}/forecast/week` | Parent | — | `200 {"id":"<uuid>","suggestions":[{"mission_id","title"}]}` finite (max 5 published). Empty catalog: `{"id","suggestions":[]}`. No invented title/description. Unknown family `404`. Child `403`. |
| POST | `/api/families/{id}/forecast/week` | Parent | `{ "day", "mission_id" }` | `200` calendar day document with a `scheduled` suggestion (INV-004 envelope). Missing `day` `422` (does not pick a day). Unpublished `mission_id` `422`. Existing day merges; does not `409`. Child `403`. |
| PATCH | `/api/families/{id}/calendar/{day}/suggestions/{sid}` | Parent | `{ "status": "done" \| "moved", "target_day"? }` | `200 {"days":[DayDocument...],"proposal":{"source_mission_id","weekday"} \| null}`. `target_day` required when `moved` else `422`. Move merges into the target day’s suggestions (one `(family_id, day)` row). After four `done`/`moved` repeats of the same `mission_id`, `proposal` is set; `family_profile.rhythms` is not auto-written. Child `403`. |
| POST | `/api/families/{id}/rhythms/proposal` | Parent | `{ "source_mission_id", "label", "weekday" }` or `{ "dismissed": true }` | Accept: `200 {"id","rhythms":[{"id","label","source_mission_id","weekday"}]}`. Dismiss: current envelope unchanged (empty stays `[]`). Child `403`. |

Day document (same as Wave 5 GET calendar):

```
{"id","family_id","day","previous_weather","notifications","suggestions":{"id","suggestions":[{"id","mission_id","curated_material_id","status"}]}}
```

`status`: `scheduled` | `done` | `moved`.

- Suggestion ids in GET week are published catalog rows only (INV-001, INV-005).
- Notifications remain a boolean on the day row; no push provider.
- Shared FE touchpoint: family chrome from Wave 3. Mount forecast inside that chrome only. No `frontend/src/portals/*`. Calendar screen already exists; PATCH is the follow-through for done/moved.

## Lane: surprise (surprise-mission)

- **FE owned:** `app/(family)/missions/surprise/**`
- TDD: `especs/design-docs/tdd-feature-surprise-mission.md`
- Plan: `especs/tdd/wave7/surprise/fase7.md` + `fase7Task.md` (FE steps empty — paint mascot payload from contract below)
- Patterns: Strategy (`SurpriseSelectionStrategy` via `CatalogPickStrategy`); Factory (`AcceptedFamilyMissionFactory` opens `family_mission` `Accepted`).

Backend contract:

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/api/families/{id}/missions/surprise` | Parent | `{ }` | Hit: `200 {"id","mission_id","status":"Accepted","title","description","review_status":"published"}` (catalog copy only). Miss: `200 {"id","mission_id":null}` — no title/description, no `family_mission` row. Unknown family `404`. Child `403`. |

- Empty published set / exhausted non-repeatable history → explicit empty, never invented copy (INV-001).
- Presentation is the mascot payload (Wave 4 mascot chrome). No extra mascot API.
- Shared FE touchpoint: mascot view from Wave 4. Mount surprise inside family chrome. No `frontend/src/portals/*`.

## Frontend shared touchpoints

- Family chrome (`app/(family)/chrome/**`) — mount forecast + surprise inside iPhone 15 Pro Max only.
- Mascot view (`app/(family)/missions/mascot/**`) consumes surprise payload as typewriter text.
- No `frontend/src/portals/*`. Pittore merges family nav entries.

## Open questions

None for Frontend.

## After paint

Write `especs/tdd/wave7/handoff-to-scultore.md` and `especs/tdd/wave7/<lane>/frontend-verification.md` (calendar-ops + surprise). Mark FE notes.
