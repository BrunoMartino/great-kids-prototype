# Handoff to Scultore — Wave 9

Wave 9 Frontend painted. Do not start Wave 10 until the user starts Scultore again. diary + indicators FE are done.

## Files written per lane

### diary

- `app/(family)/diary/page.tsx`
- `app/(family)/diary/diary-screen.tsx`
- `app/(family)/diary/diary-session-context.tsx`
- `app/(family)/diary/diary-payload.ts`
- `app/(family)/diary/diary-command.ts`
- `app/(family)/diary/list-diary-command.ts`
- `app/(family)/diary/add-note-command.ts`
- `app/(family)/diary/kind-strategy.ts`

Shared:

- `app/(family)/chrome/family-nav.tsx` — `diary` / **Diário**

### indicators

- `app/(panel)/indicators/page.tsx`
- `app/(panel)/indicators/indicators-screen.tsx`
- `app/(panel)/indicators/indicators-session-context.tsx`
- `app/(panel)/indicators/indicators-facade.ts`

Shared:

- `app/(panel)/layout.tsx` — **Indicadores**

## FE checkboxes

- `especs/tdd/wave9/diary/fase9Task.md` — Frontend section marked.
- `especs/tdd/wave9/indicators/fase9Task.md` — Frontend section marked.

## Type-check / lint / build

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass |
| Lint | Not configured (no project lint script) |
| `npm run build` | Pass (`/diary`, `/indicators` in the route table) |

## Verification

- `especs/tdd/wave9/diary/frontend-verification.md`
- `especs/tdd/wave9/indicators/frontend-verification.md`

## Router blocks merged

No `frontend/src/portals/*`. Family chrome already wraps `(family)` children. Panel layout already wraps `(panel)` children.

Shared nav appended:

- Family: `/diary?id=` via `FamilyNav` `active="diary"`
- Panel: `/indicators`

## Canva

Issues: none that required a new dependency. Screens follow Wave 5–8 canva fixes (`min-width: 0`, inputs `font-size: 16px`, reduced-motion, transform/opacity only, `color-mix` with hex fallbacks). Composer sheet stays in the DOM with `inert` (same as profile). Kind chip “Momento engraçado” wraps on two lines in the 2-col phone grid — readable, not jank. Next.js dev overlay can cover the first indicators card in screenshots; production has no overlay. Manual still needed: iOS input zoom, Safari/Firefox on a real device, reduced-motion on a device.

## Graph

Updated. CLI `graphify`. Command:

```bash
graphify update .
```

`graphify-out/graph.json` + `GRAPH_REPORT.md` verified (AST-only; 4325 nodes, 7517 edges, 283 communities). Harness templates not touched. `DiaryScreen` / `IndicatorsScreen` / `FamilyNav` present.

## Backend signals

### Panel Admin blocks family diary GET while family presentation stays Parent

- Feature: family-diary / context-switch
- Path: `app/api/session/presentation-strategy.ts` (`alignFamilyMock`)
- Harness / TDD: family diary GET is Parent or Child; panel session POST may leave mock as Admin/Operator.
- Evidence: after Admin on `/indicators`, `GET /api/session` still `{ role: "Parent" }` but `GET /api/families/{id}/diary` is 403. `alignFamilyMock` returns early when mock is Admin/Operator.
- Suggested correction: either keep mock and family presentation aligned, or have diary FE treat 403 as staff-session (Scultore). Pittore did not change backend.

## Not done

- Safari / Firefox / iOS device pass (manual)
- Lint (no script)
- Sistina-arch flowchart (not requested this wave)
- Photo picker (forbidden INV-002 — correctly omitted)
- Parent-facing indicators dashboard (out of scope)

Babylon Gate: not run (user override OFF / “No babylon-gardens”).
