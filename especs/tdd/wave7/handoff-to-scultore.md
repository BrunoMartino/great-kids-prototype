# Handoff to Scultore — Wave 7

Wave 7 Frontend painted. Do not start Wave 8 until the user starts Scultore again. calendar-ops and surprise FE are done.

## Files written per lane

### calendar-ops

- `app/(family)/forecast/page.tsx`
- `app/(family)/forecast/forecast-screen.tsx`
- `app/(family)/forecast/forecast-session-context.tsx`
- `app/(family)/forecast/forecast-command.ts`
- `app/(family)/forecast/week-suggestion.ts`
- `app/(family)/forecast/drop-on-day-command.ts`
- `app/(family)/forecast/patch-suggestion-command.ts`
- `app/(family)/forecast/proposal-command.ts`
- `app/(family)/forecast/rhythm-proposal-observer.ts`

### surprise

- `app/(family)/missions/surprise/page.tsx`
- `app/(family)/missions/surprise/surprise-screen.tsx`
- `app/(family)/missions/surprise/surprise-session-context.tsx`
- `app/(family)/missions/surprise/post-surprise-command.ts`
- `app/(family)/missions/surprise/surprise-payload.ts`

## FE checkboxes

- `especs/tdd/wave7/calendar-ops/fase7Task.md` — Frontend section marked.
- `especs/tdd/wave7/surprise/fase7Task.md` — Frontend section marked.

## Type-check / lint / build

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Fails in existing `tests/pick/pick-ranker-adapter.test.ts` (`LeakyPickStrategy.filter` vs `PickCandidate`). App routes type-check via Next. |
| Lint | Not configured (no project lint script) |
| `npm run build` | Pass (`/forecast` 7.03 kB, `/missions/surprise` 5.63 kB) |

## Verification

- `especs/tdd/wave7/calendar-ops/frontend-verification.md`
- `especs/tdd/wave7/surprise/frontend-verification.md`

## Router blocks merged

No `frontend/src/portals/*`. Family chrome already wraps `(family)` children.

Shared nav appended in chrome (used by quiz, profile, calendar, forecast, surprise):

```tsx
<FamilyNav familyId={…} active="quiz" | "profile" | "calendar" | "forecast" | "surprise" />
```

File: `app/(family)/chrome/family-nav.tsx`. Links: `/quiz`, `/profile`, `/calendar`, `/forecast`, `/missions/surprise` with `?id=`.

## Canva

Issues: none found that required a code change. New screens follow Wave 5 canva fixes (`min-width: 0`, inputs `font-size: 16px`, reduced-motion disables enter/load/modal motion, transform/opacity only). Rhythm sheet uses the same backdrop/sheet timing as profile. Manual still needed: iOS input zoom, Safari/Firefox pass on a real device, reduced-motion on a device, four-repeat proposal sheet.

## Graph

Updated. CLI `graphify 0.9.65`. Command:

```bash
graphify update .
```

`graphify-out/graph.json` + `GRAPH_REPORT.md` verified (AST-only; 3804 nodes, 6286 edges, 259 communities). Harness templates not touched.

## Backend signals

### Repo `tsc` fails on Wave 6 pick test double

- Feature: surprise-mission / ai-mission-rules
- Path: `tests/pick/pick-ranker-adapter.test.ts`
- Harness / TDD: `PickStrategy.filter` returns `PickCandidate[]`.
- Evidence: `npx tsc --noEmit` — `LeakyPickStrategy.filter` returns `{ id: string }[]`, missing `title`, ages, `repeatable`, `values`.
- Suggested correction: widen the test double to `PickCandidate` (Scultore / persisted-tester: user must edit the existing test). Pittore did not change tests.

### Live catalog cannot produce surprise miss

- Feature: surprise-mission
- Path: `app/api/families/[id]/missions/surprise/route.ts` + `CatalogPickStrategy`
- Harness / TDD: empty published set / exhausted non-repeatable → `{ id, mission_id: null }`.
- Evidence: GET week and POST surprise on family `76b0b6a7-c789-49fc-b4fa-808889336cae` always return published **Barquinhos de papel** (`age_min`/`age_max` null). FE empty UI was verified with the miss envelope; live DB has no miss path.
- Suggested correction: none required for the contract. A staff-unpublished catalog (or Completed + non-repeatable history) is needed to browser-check empty against the real route.

## Not done

- Project lint (no toolchain in `package.json`).
- Safari / Firefox / iOS device pass (canva manual list).
- Four-repeat rhythm accept/dismiss in the browser (needs four done/moved).
- Live-DB surprise miss (published catalog present).
- `sistina-arch` flowchart (not requested this invocation).
- Babylon Gate (user override OFF).
