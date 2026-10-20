# Handoff to Scultore — Wave 8

Wave 8 Frontend painted. Do not start Wave 9 until the user starts Scultore again. mission-play FE is done.

## Files written per lane

### mission-play

- `app/(family)/missions/cycle/page.tsx`
- `app/(family)/missions/cycle/cycle-screen.tsx`
- `app/(family)/missions/cycle/cycle-session-context.tsx`
- `app/(family)/missions/cycle/cycle-ui-state.ts`
- `app/(family)/missions/cycle/cycle-command.ts`
- `app/(family)/missions/cycle/start-doing-command.ts`
- `app/(family)/missions/cycle/complete-mission-command.ts`
- `app/(family)/missions/cycle/cycle-payload.ts`
- `app/(family)/missions/completed/page.tsx`
- `app/(family)/missions/completed/completed-screen.tsx`
- `app/(family)/missions/completed/completed-session-context.tsx`
- `app/(family)/missions/completed/list-completed-command.ts`
- `app/(family)/missions/completed/completed-payload.ts`
- `app/(family)/missions/completed/completed-command.ts`

Shared:

- `app/(family)/chrome/family-nav.tsx` — `cycle`, `completed`
- `app/(family)/missions/surprise/surprise-session-context.tsx` — hit keeps Accepted `cycleId`
- `app/(family)/missions/surprise/surprise-screen.tsx` — **Fazer agora**

## FE checkboxes

- `especs/tdd/wave8/mission-play/fase8Task.md` — Frontend section marked.

## Type-check / lint / build

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Fails in existing backend files (not this lane). Cycle/completed FE not in the error list. |
| Lint | Not configured (no project lint script) |
| `npm run build` | Fail — `app/api/families/[id]/forecast/week-list-strategy.ts` (`title` `string \| undefined`) |

## Verification

- `especs/tdd/wave8/mission-play/frontend-verification.md`

## Router blocks merged

No `frontend/src/portals/*`. Family chrome already wraps `(family)` children.

Shared nav appended in chrome:

```tsx
<FamilyNav familyId={…} active="quiz" | "profile" | "calendar" | "forecast" | "surprise" | "cycle" | "completed" />
```

File: `app/(family)/chrome/family-nav.tsx`. Links: `/quiz`, `/profile`, `/calendar`, `/forecast`, `/missions/surprise`, `/missions/cycle`, `/missions/completed` with `?id=`. Cycle also reads `?cycle=` (Accepted id) and optional `?title=`.

## Canva

Issues: none that required a new dependency. Screens follow Wave 5–7 canva fixes (`min-width: 0`, inputs `font-size: 16px`, reduced-motion, transform/opacity only). Closing questions were moved out of wrapping `<label>` so Sim/Não keep distinct names. Closed modal stays in the DOM with `inert` (same as profile). Manual still needed: iOS input zoom, Safari/Firefox on a real device, reduced-motion on a device.

## Graph

Updated. CLI `graphify`. Command:

```bash
graphify update .
```

`graphify-out/graph.json` + `GRAPH_REPORT.md` verified (AST-only; 4069 nodes, 6878 edges, 271 communities). Harness templates not touched. CycleScreen / CompletedScreen / FamilyNav present.

## Backend signals

### Repo `tsc` / `next build` fail on Wave 7 forecast strategy

- Feature: weekly-suggestion / forecast
- Path: `app/api/families/[id]/forecast/week-list-strategy.ts`
- Harness / TDD: `WeekSuggestion.title` is `string`.
- Evidence: `npm run build` — `p_row.title` is `string | undefined`.
- Suggested correction: guarantee `title` is a string when mapping `PickCandidate` (Scultore). Pittore did not change backend.

### Repo `tsc` fails on catalog pick values

- Feature: ai-mission-rules
- Path: `services/mission_pick/catalog-pick-strategy.ts`
- Harness / TDD: `PickCandidate.values` used in filter.
- Evidence: `npx tsc --noEmit` — `p_candidate.values` possibly undefined.
- Suggested correction: narrow or default `values` on the candidate. Pittore did not change backend.

### No GET for a cycle row

- Feature: mission-cycle
- Path: `app/api/family-missions/[id]/route.ts` (PATCH only)
- Harness / TDD: cycle UI consumes Accepted id from surprise; PATCH returns status after each command.
- Evidence: FE assumes `?cycle=` is Accepted until a PATCH succeeds. A refresh after Doing would re-offer Start and get 422.
- Suggested correction: GET `/api/family-missions/{id}` returning `{ id, fam_id, mission_id, status, closing }` so the cycle screen can restore. Not a V1 blocker for the surprise → cycle happy path.

## Not done

- Project lint (no toolchain in `package.json`).
- `npm run build` green (blocked by existing backend type error).
- Safari / Firefox / iOS device pass (canva manual list).
- `sistina-arch` flowchart (not requested as flowchart mode).
- Babylon Gate (user override OFF).
- GET restore for an in-flight cycle row (signal above).
