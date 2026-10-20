# Handoff to Scultore — Wave 5

Wave 5 Frontend painted. Do not start Wave 6 until the user starts Scultore again. gps and calendar FE are done.

## Files written per lane

### gps

- `app/(family)/quiz/page.tsx`
- `app/(family)/quiz/quiz-screen.tsx`
- `app/(family)/quiz/quiz-session-context.tsx`
- `app/(family)/quiz/quiz-command.ts`
- `app/(family)/quiz/submit-answer-command.ts`
- `app/(family)/quiz/mode-strategy.ts`
- `app/(family)/quiz/gps-view-policy.ts`
- `app/(family)/profile/page.tsx`
- `app/(family)/profile/profile-screen.tsx`
- `app/(family)/profile/profile-session-context.tsx`
- `app/(family)/profile/gps-composite.ts`
- `app/(family)/profile/profile-command.ts`
- `app/(family)/profile/edit-answer-command.ts`
- `app/(family)/profile/delete-answer-command.ts`

### calendar

- `app/(family)/calendar/page.tsx`
- `app/(family)/calendar/calendar-screen.tsx`
- `app/(family)/calendar/calendar-session-context.tsx`
- `app/(family)/calendar/calendar-command.ts`
- `app/(family)/calendar/schedule-on-day-command.ts`
- `app/(family)/calendar/move-suggestion-command.ts`
- `app/(family)/calendar/day-composite.ts`
- `app/(family)/calendar/published-mission.ts`

## FE checkboxes

- `especs/tdd/wave5/gps/fase5Task.md` — all three Frontend items marked.
- `especs/tdd/wave5/calendar/fase5Task.md` — Frontend section marked.

## Type-check / lint / build

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass |
| Lint | Not configured (no project lint script) |
| `npm run build` | Pass (`/quiz` 5.12 kB, `/profile` 5.93 kB, `/calendar` 5.82 kB) |

## Verification

- `especs/tdd/wave5/gps/frontend-verification.md`
- `especs/tdd/wave5/calendar/frontend-verification.md`

## Router blocks merged

No `frontend/src/portals/*`. Family chrome already wraps `(family)` children.

Shared nav appended in chrome (used by quiz, profile, calendar):

```tsx
<FamilyNav familyId={…} active="quiz" | "profile" | "calendar" />
```

File: `app/(family)/chrome/family-nav.tsx`. Links: `/quiz`, `/profile`, `/calendar` with `?id=`.

## Canva

Issues: flex children needed `min-width: 0` so Firefox/Safari do not overflow the 430px screen (quiz, profile, calendar, nav links). Inputs stay `font-size: 16px` to avoid iOS zoom. Reduced-motion CSS disables enter/load/modal motion. Manual still needed: iOS input zoom, Safari/Firefox pass on a real device, reduced-motion on a device.

## Graph

Updated. CLI `graphify 0.9.65`. Command:

```bash
graphify update .
```

`graphify-out/graph.json` + `GRAPH_REPORT.md` verified (AST-only; 3446 nodes, 5316 edges, 233 communities). Harness templates not touched.

## Backend signals

### Mock session store is still per Route Handler bundle

- Feature: family-quiz / family-calendar / admin-panel
- Path: `internal/db/mock-session.ts`
- Harness / TDD: staff seed (`POST /api/panel/session` `{ role: "Admin" }`) then `POST /api/panel/questions` / `POST /api/missions`.
- Evidence: this run, `POST /api/panel/session` → 200 `{ role: "Admin" }`, immediate `POST /api/panel/questions` → 403 `{ error: "forbidden" }`, immediate `POST /api/missions` → 403. Wave 4 already reported the same split for `/api/missions`.
- Suggested correction: one mock session for the process (`globalThis`) so panel Admin also authorizes catalog and question writes in the running app.

### Calendar move cannot update the source day

- Feature: family-calendar
- Path: `app/api/families/[id]/calendar/[day]/route.ts`
- Harness / TDD: MoveSuggestion should set source `status: moved` without a second unique row; PUT is create-once.
- Evidence: second PUT same family+day is 409. FE Move only PUTs an empty target day with `status: moved`; the source day stays `scheduled`.
- Suggested correction: Wave 7 PATCH (already planned). Do not change Wave 5 PUT unique.

## Not done

- Project lint (no toolchain in `package.json`).
- Safari / Firefox / iOS device pass (canva manual list).
- Calendar source-day move (Wave 7 PATCH).
- `sistina-arch` flowchart (not requested this invocation).
