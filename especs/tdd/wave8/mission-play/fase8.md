# Phase 8 — mission-play (mission-cycle + completed-missions) Green

## Context

Wave 8 lane `mission-play`. Wave 0 owns `family_mission` / `family` DDL. Additive migration range 080100–080199: snapshot `title` on `family_mission` if missing.

Frontend owned paths `app/(family)/missions/cycle/**` and `app/(family)/missions/completed/**` are Pittore — do not write them.

Red tests:

- `tests/mission-play/cycle-state.test.ts`
- `tests/mission-play/cycle-api.test.ts`
- `tests/mission-play/history-api.test.ts`

Axes: Accepted→Doing; Doing→Completed; skip Doing rejected; Completed→Accepted rejected; PATCH Doing; closing on complete same txn; missing closing 422; skip jump 422; reverse 422; closing envelope array 422 (INV-004); `missions_completed` increment; rejected complete no increment; repeatable second row; non-repeatable second cycle 422; Child 403; injection cycle id; GET Completed only (INV-004 envelope); empty envelope; unpublished catalog keeps stored title; injection family id.

Doubles: none. Partner: not asserting mock existence. Partner: sqlite, Factory, and models stay real.

Invariants: INV-001 (no invented catalog on new work; history may keep a stored title), INV-003 (Accepted→Doing→Completed; closing only on complete, same transaction), INV-004 (`closing` plain object, list `{ id, missions: [] }`).

## Red command

```bash
npx vitest run tests/mission-play
```

Expected: fail — cannot resolve `FamilyMissionCycle`, `app/api/family-missions/[id]/route`, or `app/api/families/[id]/missions/route`.

## Green steps

DB: `db/migrations/080100_family_mission_title.sql` — `ALTER TABLE family_mission ADD COLUMN title TEXT`. Apply at runtime from the model (`PRAGMA table_info` then ADD if missing) because Wave 0 `Connection.applySchema` only runs `000000_schema.sql`. Do not edit `000000_schema.sql` or `internal/db/connection.ts`.

GoF from developer docs (docs-mcp `gof-design-patterns`; fallback GitHub `BrunoMartino/design-patterns-exemples-GoF`):

- State (`ShoppingOrder` / `ShoppingOrderState` / `OrderPending`): `FamilyMissionCycle` context; `AcceptedState`, `DoingState`, `CompletedState` own legal transitions via polymorphism. Completed refuses `accept()` on the same row. Accepted refuses `complete()` (no skip Doing).
- Command (`SmartHouseCommand` `execute`/`undo`): `StartDoingCommand`, `CompleteMissionCommand`. Complete requires `{ do_again, save_memory }`, snapshots title, increments `family.missions_completed` in the same transaction.

1. `models/family_mission.ts` — extend Active Record. `ensureTitleColumn`. `insertAccepted` snapshots `mission.title`. `updateStatus`. `completeWithClosing` (status Completed + closing JSON + title + `completed_at`). `listCompleted(p_famId)`. `countCompleted(p_famId, p_missionId)`. Typed, `p_` params, no `any`. No unique `(fam_id, mission_id)`.
2. `app/api/family-missions/mission-cycle.ts` — State context + three state classes. Throws `IllegalCycleTransitionError` on illegal jumps.
3. `app/api/family-missions/mission-command.ts` — Command interface `execute` / `undo`.
4. `app/api/family-missions/start-doing-command.ts` — load row; State `startDoing`; reject second cycle when `mission.repeatable = 0` and a Completed row already exists for the pair; persist Doing.
5. `app/api/family-missions/complete-mission-command.ts` — require closing object (not array / not `{ id, key: [] }`); State `complete` from Doing only; same non-repeatable guard; transaction: status + closing + title snapshot + `missions_completed + 1`.
6. `app/api/family-missions/[id]/route.ts` — PATCH Parent. `{ status: "Doing" }` or `{ status: "Completed", closing }`. 200 `{ id, fam_id, mission_id, status, closing }`. 422 illegal jump or missing/invalid closing. 404 unknown id. Child 403. Bound params.
7. `app/api/families/[id]/missions/route.ts` — GET `?status=Completed` envelope `{ id, missions: [{ id, mission_id, status, title, completed_at, closing }] }` from cycle rows, not a live published join. Empty family → `{ id, missions: [] }`. Unknown family 404. Bound params.

Do not: frontend; edit existing tests (`tests/pick/*`, `tests/surprise/*`, others); `.env`; `models/family.ts`; Repository/ORM; Babylon Gate; Wave 9.

## Verification

```bash
npx vitest run tests/mission-play
```

## Frontend

Pittore: `app/(family)/missions/cycle/**`, `app/(family)/missions/completed/**`. Not this phase.

## Brownfield

Extend `models/family_mission.ts`. After Green skip `refactor-fase8.md` (no legacy cycle writer to swap).
