# Handoff to Scultore — Wave 4

Wave 4 Frontend painted. Do not start Wave 5 until the user starts Scultore again. mascot and questions FE are done.

## Files written per lane

### mascot

- `app/(family)/missions/mascot/page.tsx`
- `app/(family)/missions/mascot/mascot-screen.tsx`
- `app/(family)/missions/mascot/mascot-mission-context.tsx`
- `app/(family)/missions/mascot/published-mission.ts`
- `app/(family)/missions/mascot/mission-message-protocol.ts`
- `app/(family)/missions/mascot/mission-decorator.ts`
- `app/(family)/missions/mascot/mascot-message-decorator.ts`
- `app/(family)/missions/mascot/reveal-strategy.ts`
- `app/(family)/missions/mascot/typewriter-reveal-strategy.ts`
- `app/(family)/missions/mascot/instant-reveal-strategy.ts`
- `app/(family)/missions/mascot/mascot-revealed-copy.tsx`

### questions

- `app/(panel)/questions/page.tsx`
- `app/(panel)/questions/questions-facade.ts`
- `app/(panel)/questions/questions-session-context.tsx`
- `app/(panel)/questions/questions-screen.tsx`
- `app/(panel)/questions/kind-filter-strategy.ts`

## FE checkboxes

- `especs/tdd/wave4/mascot/fase4Task.md` — all four Frontend items marked.
- `especs/tdd/wave4/questions/fase4Task.md` — Frontend section marked.

## Type-check / lint / build

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass |
| Lint | Not configured (no project lint script) |
| `npm run build` | Pass (`/missions/mascot` 3.94 kB, `/questions` 5.79 kB) |

## Verification

- `especs/tdd/wave4/mascot/frontend-verification.md`
- `especs/tdd/wave4/questions/frontend-verification.md`

## Router blocks merged

No `frontend/src/portals/*`. Panel layout nav appended:

```tsx
<a href="/questions">Perguntas</a>
```

Family chrome already wraps `(family)` children; mascot did not change the layout.

## Canva

Issues: Safari `MediaQueryList.addEventListener` fallback; Firefox questions table not shrinking (`min-width: 0` + `max-content` scroll); typewriter bubble reflow (hidden sizer grid). Fixes in `mascot-screen.tsx` and `questions-screen.tsx`. Manual still needed: iOS input zoom, Firefox horizontal scroll, reduced-motion on a real device, typewriter rAF on leave.

## Graph

Updated. CLI `graphify 0.9.65`. Commands:

```bash
graphify extract . --code-only
graphify cluster-only . --no-label
```

`graphify-out/graph.json` + `GRAPH_REPORT.md` verified (cluster-only; 3020 nodes, 4286 edges). Harness templates not touched.

## Backend signals

### Mock session store is per Route Handler bundle

- Feature: mascot-mission / admin-panel
- Path: `internal/db/mock-session.ts`
- Harness / TDD: POST `/api/panel/session` `{ role: "Admin" }` then staff catalog/questions live test. Family GET `/api/missions/{id}` is Parent-readable when published.
- Evidence: same browser tab, `POST /api/panel/session` → 200 `{ role: "Admin" }`, immediate `POST /api/missions` → 403 `{ error: "forbidden" }`. `POST /api/panel/questions` after the same Admin POST → 201. `getMockSession()` returns a module-level `store`, not `globalThis`.
- Suggested correction: keep one mock session for the process (`globalThis`) so panel session Admin also authorizes `/api/missions` and `/api/missions/{id}/review` in the running app.

## Not done

- Project lint (no toolchain in `package.json`).
- Safari / Firefox / iOS device pass (canva manual list).
- Family quiz answering (Wave 5, blocked this wave).
